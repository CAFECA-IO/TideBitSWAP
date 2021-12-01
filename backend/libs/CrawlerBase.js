class CrawlerBase {
  constructor(chainId, database, logger) {
    super();
    this.chainId = chainId;
    this.database = database;
    this.logger = logger;
    this.syncInterval = 7500;
    return this;
  }

  async init() {
    this.isSyncing = false;
    this._poolIndex = await this.poolIndexFromPeer();
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
      // 7. filter to address include in pool set
      // 8. get receipt
      // 9. insert poolPrice, transactionHistory
      // 10. loop 5~9 until newest block

      if (!await this.checkBlockNumberLess()) {
        this.logger.debug(`[${this.constructor.name}] block height ${this._dbBlock} is top now.`);
        this.isSyncing = false;
        return Promise.resolve();
      }

      const newPoolIndex = await this.poolIndexFromPeer();
      for (let i = this._poolIndex; i <= newPoolIndex; i++) {
        await this.syncPool(i);
      }
      this._poolIndex = newPoolIndex;

      const blockData = await this.getBlockByNumber()


    } catch (error) {
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
    return this.intDbBlock < intPeerBlock;
  }

  async blockNumberFromDB() {
    return '';
  }

  async blockNumberFromPeer() {
    return '';
  }

  async poolIndexFromPeer() {
    return '';
  }

  async syncPool(poolIndex) {
    return;
  }

  async getBlockByNumber(number) {
    return {};
  }
}

module.exports = CrawlerBase;
