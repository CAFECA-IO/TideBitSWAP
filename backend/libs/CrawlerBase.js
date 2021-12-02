const Blockchains = require('../constants/Blockchain');
const Eceth = require('./eceth');
const TideBitSwapRouters = require('../constants/SwapRouter.js');

class CrawlerBase {
  constructor(chainId, database, logger) {
    this.chainId = chainId;
    this.database = database;
    this.logger = logger;
    this.syncInterval = 7500;
    return this;
  }

  async init() {
    this.isSyncing = false;
    this.blockchain = Blockchains.findByChainId(this.chainId);
    this.router = TideBitSwapRouters.find((o) => o.chainId === this.chainId).router;
    this.factory = await this.getFactoryFromRouter(this.router);

    this._poolIndex = await this.allPairsLength();
    this._poolAddresses = []
    this._poolAddresses = this._poolAddresses.concat(await this.poolAddresses(0, this._poolIndex));
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
      // 4. get new pool set from factory
      // 4-1. if has new pool, insert pool
      // 5. get block by number from node
      // 6. filter input != '0x'
      // 7. get receipt
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
      for (let i = this._poolIndex; i <= newPoolIndex; i++) {
        await this.syncPool(i);
      }
      this._poolIndex = newPoolIndex;

      for (let blockNumber = parseInt(this._dbBlock); blockNumber <= parseInt(this._peerBlock); blockNumber++) {
        const blockData = await this.getBlockByNumber(blockNumber);

        const txs = blockData.transactions.filter((tx) => tx.input != '0x');
        for(const tx of txs) {
          const receipt = await this.getReceiptFromPeer(tx.hash);
          
          // await this.parseReceipt(receipt);
        }
      }

    } catch (error) {
      console.log(error);
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
      intDbBlock = parseInt(this._dbBlock, 16);
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
      const findUnparsed = await this.database.blockTimestampDao.findUnparsed(this.chainId);
      if (findUnparsed) {
        res = findUnparsed.blockNumber;
      } else {
        const findLastBlock = await this.database.blockTimestampDao.findLastBlock(this.chainId);
        res = findLastBlock ? findLastBlock.blockNumber : '0';
      }
    } catch (error) {
      console.log(error)
    }

    this.logger.debug('blockNumberFromDB res', res)
    return res;
  }

  async blockNumberFromPeer() {
    const res = await Eceth.getBlockNumber({ server: this.blockchain.rpcUrls[0] });
    this.logger.debug('blockNumberFromPeer res', res)
    return res;
  }

  async getFactoryFromRouter(router) {
    const [factory] = await Eceth.getData({ contract: router, func: 'factory()', params: [], dataType: ['address'], server: this.blockchain.rpcUrls[0] });
    this.logger.debug(`[${this.constructor.name}] getFactoryFromRouter`, router, '->', factory);
    if (!factory) throw new Error('getFactoryFromRouter fail');
    return factory;
  }

  async allPairsLength() {
    const allPairsLength = (await Eceth.getData({ contract: this.factory, func: 'allPairsLength()', params: [], dataType: ['uint8'], server: this.blockchain.rpcUrls[0] }))[0];
    return allPairsLength;
  }

  async syncPool(poolIndex) {
    return;
  }

  async getBlockByNumber(number) {
    const blockData = await Eceth.getBlockByNumber({ blockNumber: number, server: this.blockchain.rpcUrls[0] });
    if (!blockData) throw new Error('block not found.')
    return blockData;
  }

  async poolAddresses(startIndex, endIndex){
    console.log('poolAddresses', startIndex, typeof startIndex, endIndex, typeof endIndex);
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
    return {};
  }

  async parseReceipt(receipt) {

  }

  isNotice(receipt) {
    return receipt.logs.some((log) => log.topic[0] === SYNC_EVENT)
    && receipt.logs.some((log) => this.events.includes(log.topic[0]));
  }

  async insertPoolPrice() {
    return {};
  }

  async insertTransaction() {
    return {};
  }

  async updateBlockParsed() {
    return {};
  }
}

module.exports = CrawlerBase;
