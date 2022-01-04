const Blockchains = require('../constants/Blockchain');
const Eceth = require('./eceth');
const SmartContract = require('./smartContract');
const SafeMath = require('./SafeMath');

const PAIR_CREATE_EVENT = '0x' + SmartContract.encodeFunction('PairCreated(address,address,address,uint256)');
const SYNC_EVENT = '0x' + SmartContract.encodeFunction('Sync(uint112,uint112)');
const SWAP_EVENT = '0x' + SmartContract.encodeFunction('Swap(address,uint256,uint256,uint256,uint256,address)');
const MINT_EVENT = '0x' + SmartContract.encodeFunction('Mint(address,uint256,uint256)');
const BURN_EVENT = '0x' + SmartContract.encodeFunction('Burn(address,uint256,uint256,address)');
const TRANSFER_EVENT = '0x' + SmartContract.encodeFunction('Transfer(address,address,uint256)');

class CrawlerBase {
  constructor(chainId, database, logger, config) {
    this.chainId = chainId;
    this.database = database;
    this.logger = logger;
    this.config = config;
    this.syncInterval = 7500;
    this.events = [SWAP_EVENT, MINT_EVENT, BURN_EVENT];
    this.TideBitSwapDatas = this.config.TideBitSwapDatas;
    return this;
  }

  async init() {
    this.isSyncing = false;
    this.blockchain = Blockchains.findByChainId(this.chainId);
    const swapData = this.TideBitSwapDatas.find((o) => o.chainId === this.chainId);
    this.router = swapData.router.toLowerCase();
    this.weth = swapData.weth.toLowerCase();
    this.factory = swapData.factory.toLowerCase();

    this._poolIndex = await this.allPairsLength();
    this._poolAddresses = []
    this._poolAddresses = this._poolAddresses.concat(await this.poolAddresses(0, this._poolIndex));
    const syncPoolJobs = this._poolAddresses.map((v,i) => {
      return this.syncPool(v,i);
    });
    await Promise.all(syncPoolJobs);
  }

  async start() {
    this._peerBlock = 0;
    try {
      this.oneCycle();
    } catch (error) {
      this.logger.log(`[${this.constructor.name}] ${error}`);
    }
    setInterval(async () => {
      try {
        this.oneCycle();
      } catch (error) {
        this.logger.log(`[${this.constructor.name}] ${error}`);
      }
    }, this.syncInterval);
  }

  async oneCycle() {
    try {
      if(this.isSyncing) {
        this.logger.log(`[${this.constructor.name}] is syncing.`);
        return;
      }
      this.isSyncing = true;
      // step
      // 1. get block number from db
      // 2. get block number from node
      // 3. check block number, if qeual, wait to next cycle
      // 4. get block by number from node
      // 5. filter input != '0x'
      // 6. get receipt
      // 7. if log address is factory and topic is create pool, insert pool
      // 8. filter log address include in pool set and topic with sync and at least one [swap, mint burn]
      // 9. insert poolPrice, transactionHistory
      // 10 update blockTimestamp isParsed
      // 11. loop 5~10 until newest block

      if (!await this.checkBlockNumberLess()) {
        this.logger.debug(`[${this.constructor.name}] block height ${this._dbBlock} is top now.`);
        this.isSyncing = false;
        return Promise.resolve();
      }

      const newPoolIndex = await this.allPairsLength();
      // const newPoolAddresses = await this.poolAddresses(this._poolIndex, newPoolIndex);
      // const syncPoolJobs = newPoolAddresses.map((v,i) => {
      //   return this.syncPool(v,i);
      // });
      // await Promise.all(syncPoolJobs);

      // this._poolAddresses.concat(newPoolAddresses);
      // this._poolIndex = newPoolIndex;
      // if (this._poolIndex === newPoolIndex) {
      // }

      for (let blockNumber = parseInt(this._dbBlock); blockNumber <= parseInt(this._peerBlock); blockNumber++) {
        this.logger.debug(`[${this.constructor.name}] blockNumber`, blockNumber);
        const t1 = Date.now();
        const blockData = await this.getBlockByNumber(blockNumber);

        const txs = blockData.transactions.filter((tx) => tx.input != '0x');
        for(const tx of txs) {
          const receipt = await this.getReceiptFromPeer(tx.hash);
          
          await this.parseReceipt(receipt, parseInt(blockData.timestamp));
        }
        await this.updateBlockParsed(blockNumber);
        this.logger.debug(`[${this.constructor.name}] total txs`, txs.length);
        this.logger.debug(`[${this.constructor.name}] one block used`, Date.now() - t1, 'ms');
      }
      this.isSyncing = false;
    } catch (error) {
      this.logger.error(error);
      this.isSyncing = false;
    }
  }

  async checkBlockNumberLess() {
    this.logger.debug(`[${this.constructor.name}] checkBlockNumberLess`);
    this._dbBlock = await this.blockNumberFromDB();
    this._peerBlock = await this.blockNumberFromPeer();
    let intDbBlock = this._dbBlock;
    let intPeerBlock = this._peerBlock;
    if (typeof this._dbBlock === 'string') {
      intDbBlock = parseInt(this._dbBlock);
    }
    if (typeof this._peerBlock === 'string') {
      intPeerBlock = parseInt(this._peerBlock, 16);
    }
    if (typeof intDbBlock !== 'number' || typeof intPeerBlock !== 'number') {
      return false;
    }
    if (intDbBlock === 0) { this._dbBlock = this._peerBlock; } //if db not found any block, get newest
    return intDbBlock < intPeerBlock;
  }

  async blockNumberFromDB() {
    let res;
    try {
      const findUnparsed = await this.database.blockTimestampDao.findUnparsed(this.chainId.toString());
      if (findUnparsed) {
        res = findUnparsed.blockNumber;
      } else {
        const findLastBlock = await this.database.blockTimestampDao.findLastBlock(this.chainId.toString());
        res = findLastBlock ? findLastBlock.blockNumber : '0';
      }
    } catch (error) {
      this.logger.error(error)
    }

    this.logger.debug('blockNumberFromDB res', res)
    return res;
  }

  async blockNumberFromPeer() {
    const res = await Eceth.getBlockNumber({ server: this.blockchain.rpcUrls[0] });
    this.logger.debug('blockNumberFromPeer res', res)
    return res;
  }

  // async getFactoryFromRouter(router) {
  //   const [factory] = await Eceth.getData({ contract: router, func: 'factory()', params: [], dataType: ['address'], server: this.blockchain.rpcUrls[0] });
  //   this.logger.debug(`[${this.constructor.name}] getFactoryFromRouter`, router, '->', factory);
  //   if (!factory) throw new Error('getFactoryFromRouter fail');
  //   return factory;
  // }

  async allPairsLength() {
    const allPairsLength = (await Eceth.getData({ contract: this.factory, func: 'allPairsLength()', params: [], dataType: ['uint8'], server: this.blockchain.rpcUrls[0] }))[0];
    return allPairsLength;
  }

  async syncPool(poolContract, factoryIndex) {
    try {
      const [[decimals], [totalSupply], [token0Contract], [token1Contract]] = await Promise.all([
        Eceth.getData({ contract: poolContract, func: 'decimals()', params: [], dataType: ['uint8'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: poolContract, func: 'totalSupply()', params: [], dataType: ['uint256'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: poolContract, func: 'token0()', params: [], dataType: ['address'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: poolContract, func: 'token1()', params: [], dataType: ['address'], server: this.blockchain.rpcUrls[0] }),
      ]);
      const entity = this.database.poolDao.entity({
        chainId: this.chainId.toString(),
        contract: poolContract,
        factoryContract: this.factory,
        factoryIndex,
        decimals,
        totalSupply,
        token0Contract,
        token1Contract,
        timestamp: Math.floor(Date.now() / 1000),
      });
      await this.database.poolDao.insertPool(entity);
      await this._findToken(this.chainId, token0Contract);
      await this._findToken(this.chainId, token1Contract);
    } catch (error) {
      this.logger.trace(error);
    }
    return;
  }

  async getBlockByNumber(number) {
    const blockData = await Eceth.getBlockByNumber({ blockNumber: number, server: this.blockchain.rpcUrls[0] });
    if (!blockData) throw new Error('block not found.')
    const entity = this.database.blockTimestampDao.entity({
      chainId: this.chainId.toString(),
      blockNumber: number,
      timestamp: parseInt(blockData.timestamp),
      isParsed: 0,
    });
    await this.database.blockTimestampDao.insertBlockTimestamp(entity);
    return blockData;
  }

  async poolAddresses(startIndex, endIndex){
    this.logger.debug('poolAddresses', startIndex, typeof startIndex, endIndex, typeof endIndex);
    const getAddress = async (i) => {
      const pairAddress = (await Eceth.getData({ contract: this.factory, func: 'allPairs(uint256)', params: [i], dataType: ['address'], server: this.blockchain.rpcUrls[0] }))[0];
      return pairAddress;
    }
    let result = [];
    for (let i = startIndex, step = 10; i < endIndex; i+= step) {
      const request = [];
      if (step > endIndex - i) step = endIndex - i;
      for (let j = i; j < i + step; j++) {
        request.push(getAddress(j));
      }
      try {
        const res = await Promise.all(request);
        result = result.concat(res);
      } catch (error) {
        this.logger.error(error);
      }
    }
    return result;
  }

  async getReceiptFromPeer(txHash) {
    const receipt = await Eceth.getReceipt({ txHash, server: this.blockchain.rpcUrls[0] });
    return receipt;
  }

  async parseReceipt(receipt, timestamp) {
    // todo event如果一筆交易同時有mint swap burn會錯
    const { isNotice, event, poolAddress } = this.checkEvent(receipt);
    if (!isNotice) return;

    const price = {};
    const pairToWeth = {};
    let share = '0';
    for(const log of receipt.logs) {
      let parsedData;
      let poolDetail;
      try {
        const topic = log.topics[0];
        switch(topic) {
          case PAIR_CREATE_EVENT:
            parsedData = Eceth.parseData({ data: log.data.replace('0x', ''), dataType: ['address', 'uint256'] });
            await this.syncPool(parsedData[0], this._poolIndex++);
            this._poolAddresses.push(parsedData[0]);
            break;
          case SYNC_EVENT:
            parsedData = Eceth.parseData({ data: log.data.replace('0x', ''), dataType: ['uint112', 'uint112'] })
            await this.insertPoolPrice({
              address: log.address,
              transactionHash: receipt.transactionHash,
              timestamp,
              token0Amount: parsedData[0],
              token1Amount: parsedData[1],
            })
            price[log.address] = {
              token0Amount: parsedData[0],
              token1Amount: parsedData[1],
            }
            break;
          case SWAP_EVENT:
            parsedData = Eceth.parseData({ data: log.data.replace('0x', ''), dataType: ['uint256', 'uint256', 'uint256', 'uint256'] });
            this.logger.debug('!!!log.data', log.data);
            this.logger.debug('!!!parsedData', parsedData);
            poolDetail = await this.database.poolDao.findPool(this.chainId.toString(), log.address);
            await this.insertTransaction({
              transactionHash: receipt.transactionHash,
              type: 0,
              callerAddress: receipt.from,
              poolContract: log.address,
              token0Contract: poolDetail.token0Contract,
              token1Contract: poolDetail.token1Contract,
              token0AmountIn: parsedData[0],
              token0AmountOut: parsedData[1],
              token1AmountIn: parsedData[2],
              token1AmountOut: parsedData[3],
              timestamp,
            });
            if (poolDetail.token0Contract === this.weth || poolDetail.token1Contract === this.weth) {
              pairToWeth[log.address] = {
                token0Contract: poolDetail.token0Contract,
                token1Contract: poolDetail.token1Contract,
              }
            }
            break;
          case TRANSFER_EVENT:
            // todo 按照log順序讀取topic，根據地址是from還是to判斷方向
            if (log.address === poolAddress) {
              this.logger.debug('!!!TRANSFER_EVENT with event', event,', share', share);
              switch(event) {
                case MINT_EVENT:
                  if (log.topics[2].slice(-40) === receipt.from.replace('0x','')) {
                    share = SafeMath.plus(share, log.data);
                  }
                  break;
                case BURN_EVENT:
                  if (log.topics[1].slice(-40) === receipt.from.replace('0x','')) {
                    share = SafeMath.plus(share, log.data);
                  }
                  break;
                default:
              }
            }
            break;
          case MINT_EVENT:
            parsedData = Eceth.parseData({ data: log.data.replace('0x', ''), dataType: ['uint256', 'uint256'] });
            this.logger.debug('!!!MINT_EVENT');
            this.logger.debug('!!!log.data', log.data);
            this.logger.debug('!!!parsedData', parsedData);
            poolDetail = await this.database.poolDao.findPool(this.chainId.toString(), log.address);
            await this.insertTransaction({
              transactionHash: receipt.transactionHash,
              type: 1,
              callerAddress: receipt.from,
              poolContract: log.address,
              token0Contract: poolDetail.token0Contract,
              token1Contract: poolDetail.token1Contract,
              token0AmountIn: parsedData[0],
              token1AmountIn: parsedData[1],
              share,
              timestamp,
            });
            await this.updatePool(poolAddress);
            if (poolDetail.token0Contract === this.weth || poolDetail.token1Contract === this.weth) {
              pairToWeth[log.address] = {
                token0Contract: poolDetail.token0Contract,
                token1Contract: poolDetail.token1Contract,
              }
            }
            break;
          case BURN_EVENT:
            parsedData = Eceth.parseData({ data: log.data.replace('0x', ''), dataType: ['uint256', 'uint256'] });
            this.logger.debug('!!!BURN_EVENT');
            this.logger.debug('!!!log.data', log.data);
            this.logger.debug('!!!parsedData', parsedData);
            poolDetail = await this.database.poolDao.findPool(this.chainId.toString(), log.address);
            await this.insertTransaction({
              transactionHash: receipt.transactionHash,
              type: 2,
              callerAddress: receipt.from,
              poolContract: log.address,
              token0Contract: poolDetail.token0Contract,
              token1Contract: poolDetail.token1Contract,
              token0AmountOut: parsedData[0],
              token1AmountOut: parsedData[1],
              share,
              timestamp,
            });
            await this.updatePool(poolAddress);
            if (poolDetail.token0Contract === this.weth || poolDetail.token1Contract === this.weth) {
              pairToWeth[log.address] = {
                token0Contract: poolDetail.token0Contract,
                token1Contract: poolDetail.token1Contract,
              }
            }
            break;
          default:
        }
      } catch (error) {
        this.logger.trace(error)
      }
    }

    for (const address of Object.keys(pairToWeth)) {
      await this.updateTokenToWeth(pairToWeth[address], price[address], timestamp);
    }
  }

  checkEvent(receipt) {
    try {
      let event;
      let poolAddress;
      let containCreatePair = false;
      for (const log of receipt.logs) {
        if (log.topics[0] === PAIR_CREATE_EVENT && log.address === this.factory) { containCreatePair = true; }
        if (this.events.includes(log.topics[0])
          && (this._poolAddresses.includes(log.address) || containCreatePair)) {
          event = log.topics[0];
          poolAddress = log.address;
        }
      }
      const result = {
        event,
        poolAddress,
        isNotice: receipt.logs.some((log) => log.topics[0] === SYNC_EVENT)
          && event
          && poolAddress
      }
      return result;
    } catch (error) {
      this.logger.trace(error);
      return {
        isNotice: false,
      }
    }
  }

  async insertPoolPrice({ address, transactionHash, timestamp, token0Amount, token1Amount }) {
    const entity = this.database.poolPriceDao.entity({
      chainId: this.chainId.toString(),
      contract: address,
      transactionHash,
      timestamp,
      token0Amount,
      token1Amount,
    });

    return this.database.poolPriceDao.insertPoolPrice(entity);
  }

  async insertTransaction({
    transactionHash, type, callerAddress, poolContract, token0Contract, token1Contract,
    token0AmountIn, token0AmountOut, token1AmountIn, token1AmountOut, share, timestamp,
   }) {
    const entity = this.database.transactionHistoryDao.entity({
      chainId: this.chainId.toString(),
      transactionHash,
      type,
      callerAddress,
      poolContract,
      token0Contract,
      token1Contract,
      token0AmountIn,
      token0AmountOut,
      token1AmountIn,
      token1AmountOut,
      share,
      timestamp,
    })
    return this.database.transactionHistoryDao.insertTx(entity);
  }

  async insertTokenPrice({ contract, priceToEth, timestamp }) {
    const entity = this.database.tokenPriceDao.entity({
      chainId: this.chainId.toString(),
      contract,
      priceToEth,
      timestamp, 
    })

    return this.database.tokenPriceDao.insertTokenPrice(entity);
  }

  async updateBlockParsed(blockNumber) {
    const entity = await this.database.blockTimestampDao.findTimestamp(this.chainId.toString(), blockNumber);
    entity.isParsed = 1;
    await this.database.blockTimestampDao.updateBlockTimestamp(entity);
    return {};
  }

  async updatePool(poolContract) {
    const totalSupply = await Eceth.getData({ contract: poolContract, func: 'totalSupply()', params: [], dataType: ['uint256'], server: this.blockchain.rpcUrls[0] });

    const entity = await this.database.poolDao.findPool(this.chainId.toString(), poolContract);
    entity.totalSupply = totalSupply;
    entity.timestamp = Math.floor(Date.now() / 1000);
    await this.database.poolDao.updatePool(entity);
  }

  async updateTokenToWeth(pair, price, timestamp) {
    const { token0Contract, token1Contract } = pair;
    const { token0Amount, token1Amount } = price;

    const tokenContract = token0Contract !== this.weth ? token0Contract : token1Contract;
    const priceToEth = token0Contract === this.weth ? SafeMath.div(token0Amount, token1Amount) : SafeMath.div(token1Amount, token0Amount);
    const findToken = await this._findToken(this.chainId, tokenContract);
    findToken.timestamp = timestamp;
    findToken.priceToEth = priceToEth;

    await this.database.tokenDao.updateToken(findToken);

    await this.insertTokenPrice({ contract: tokenContract, priceToEth, timestamp });
  }

  async _findToken(chainId, tokenAddress) {
    let findToken;
    tokenAddress = tokenAddress.toLowerCase();
    try {
      findToken = await this.database.tokenDao.findToken(chainId.toString(), tokenAddress);
    } catch (error) {
      console.trace(error);
    }

    if(!findToken) {
      const tokenDetailByContract = await this.getErc20Detail({ erc20: tokenAddress , server: this.blockchain.rpcUrls[0] });
      if (!tokenDetailByContract.name || !tokenDetailByContract.symbol
        || !tokenDetailByContract.decimals || !tokenDetailByContract.totalSupply) {
          throw new Error(`contract: ${tokenAddress} is not erc20 token`);
        }
      const tokenEnt = this.database.tokenDao.entity({
        chainId: chainId.toString(),
        contract: tokenAddress,
        name: tokenDetailByContract.name,
        symbol: tokenDetailByContract.symbol,
        decimals: tokenDetailByContract.decimals,
        totalSupply: tokenDetailByContract.totalSupply,
      });
      await this.database.tokenDao.insertToken(tokenEnt);
      findToken = await this.database.tokenDao.findToken(chainId.toString(), tokenAddress);
      if(!findToken) throw new Error('still not found token');
    }
    return findToken;
  }

  async getErc20Detail({ erc20, server }) {
    let result;
    try {
      const [[name], [symbol], [decimals], [totalSupply]] = await Promise.all([
        Eceth.getData({ contract: erc20, func: 'name()', params:[], dataType: ['string'], server }),
        Eceth.getData({ contract: erc20, func: 'symbol()', params:[], dataType: ['string'], server }),
        Eceth.getData({ contract: erc20, func: 'decimals()', params:[], dataType: ['uint8'], server }),
        Eceth.getData({ contract: erc20, func: 'totalSupply()', params: [], dataType: ['uint256'], server }),
      ]);
      result = { contract: erc20, name, symbol, decimals, totalSupply };
    }
    catch(e) {
      result = { contract: erc20, symbol: '?', decimals: 18 };
      // console.trace(e);
    }
    return result;
  }

  // async getWETHFromRouter({ router, server }) {
  //   const rs = await Eceth.getData({ contract: router, func: 'WETH()', params: [], dataType: ['address'], server });
  //   return rs[0];
  // }
}

module.exports = CrawlerBase;
