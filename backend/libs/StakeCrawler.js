const Ecrequest = require('ecrequest');

const Blockchains = require('../constants/Blockchain');
const Eceth = require('./eceth');
const SafeMath = require('./SafeMath');
const DefaultIcon = require('../constants/DefaultIcon');


class StakeCrawler {
  constructor(stakeData, database, logger) {
    this.chainId = stakeData.chainId;
    this.database = database;
    this.logger = logger;
    this.syncInterval = 7500;
    this.stakeData = stakeData;
    return this;
  }

  async init() {
    this.isSyncing = false;
    this.blockchain = Blockchains.findByChainId(this.chainId);
    this.router = this.stakeData.router.toLowerCase();
    this.weth = this.stakeData.weth.toLowerCase();
    this.factory = this.stakeData.factory.toLowerCase();

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
        this.logger.debug(`[${this.constructor.name}] is syncing.`);
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

  async allPairsLength() {
    const allPairsLength = (await Eceth.getData({ contract: this.factory, func: 'allPairsLength()', params: [], dataType: ['uint8'], server: this.blockchain.rpcUrls[0] }))[0];
    return allPairsLength;
  }

  async syncPool(poolContract, factoryIndex) {
    try {
      const [
        [rewardToken], [stakedToken], [rewardPerBlock], [hasUserLimit], [poolLimitPerUser],
        [startBlock], [endBlock], /* [projectSite] */
      ] = await Promise.all([
        Eceth.getData({ contract: poolContract, func: 'rewardToken()', params: [], dataType: ['address'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: poolContract, func: 'stakedToken()', params: [], dataType: ['address'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: poolContract, func: 'rewardPerBlock()', params: [], dataType: ['uint256'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: poolContract, func: 'hasUserLimit()', params: [], dataType: ['boolean'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: poolContract, func: 'poolLimitPerUser()', params: [], dataType: ['address'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: poolContract, func: 'startBlock()', params: [], dataType: ['uint256'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: poolContract, func: 'bonusEndBlock()', params: [], dataType: ['uint256'], server: this.blockchain.rpcUrls[0] }),
        // Eceth.getData({ contract: poolContract, func: 'projectSite()', params: [], dataType: ['string'], server: this.blockchain.rpcUrls[0] }),
      ]);

      const totalStaked = await Eceth.getData({ contract: poolContract, func: 'balanceOf()', params: [stakedToken], dataType: ['uint256'], server: this.blockchain.rpcUrls[0] });
      const APY = SafeMath.div(rewardPerBlock, totalStaked);

      // mock projectSite
      const projectSite = 'https://swap.tidebit.network/';

      const entity = this.database.poolDao.entity({
        chainId: this.chainId.toString(),
        contract: poolContract,
        factoryContract: this.factory,
        factoryIndex,
        rewardToken,
        stakedToken,
        rewardPerBlock,
        totalStaked,
        hasUserLimit,
        poolLimitPerUser,
        APY,
        start: startBlock,
        end: endBlock,
        projectSite,
      });
      await this.database.poolDao.insertPool(entity);
      await this._findToken(this.chainId, rewardToken);
      await this._findToken(this.chainId, stakedToken);
    } catch (error) {
      this.logger.trace(error);
    }
    return;
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

  async insertTokenPrice({ contract, priceToEth, timestamp }) {
    const entity = this.database.tokenPriceDao.entity({
      chainId: this.chainId.toString(),
      contract,
      priceToEth,
      timestamp, 
    })

    return this.database.tokenPriceDao.insertTokenPrice(entity);
  }

  async updatePool(poolContract) {
    const totalSupply = await Eceth.getData({ contract: poolContract, func: 'totalSupply()', params: [], dataType: ['uint256'], server: this.blockchain.rpcUrls[0] });

    const entity = await this.database.poolDao.findPool(this.chainId.toString(), poolContract);

    await this.database.poolDao.updatePool(entity);
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
      
      const icon = await this.getIconBySymbol(tokenDetailByContract.symbol);
      const tokenEnt = this.database.tokenDao.entity({
        chainId: chainId.toString(),
        contract: tokenAddress,
        name: tokenDetailByContract.name,
        symbol: tokenDetailByContract.symbol,
        decimals: tokenDetailByContract.decimals,
        totalSupply: tokenDetailByContract.totalSupply,
        icon
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

  async getIconBySymbol(symbol) {
    let icon = `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@9ab8d6934b83a4aa8ae5e8711609a70ca0ab1b2b/32/icon/${symbol.toLocaleLowerCase()}.png`;
    try {
      const checkIcon = await Ecrequest.get({
        protocol: 'https:',
        hostname: 'cdn.jsdelivr.net',
        port: '',
        path: `/gh/atomiclabs/cryptocurrency-icons@9ab8d6934b83a4aa8ae5e8711609a70ca0ab1b2b/32/icon/${symbol.toLocaleLowerCase()}.png`,
        timeout: 1000,
      });
      if (checkIcon.data.toString().indexOf('Couldn\'t find') !== -1) throw Error('Couldn\'t find');
    } catch (e) {
      icon = DefaultIcon.erc20;
    }
    return icon;
  }
}

module.exports = StakeCrawler;
