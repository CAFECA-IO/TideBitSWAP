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
    this._poolAddresses = await this.poolAddresses();
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

      const newPoolIndex = await this.poolIndexFromPeer();
      for (let i = this._poolIndex; i <= newPoolIndex; i++) {
        await this.syncPool(i);
      }
      this._poolIndex = newPoolIndex;

      for (let blockNumber = this._dbBlock; blockNumber < this._peerBlock; blockNumber++) {
        const blockData = await this.getBlockByNumber(blockNumber);

        const txs = blockData.transactions.filter((tx) => tx.input != '0x');

        for(const tx of txs) {
          const receipt = await this.getReceiptFromPeer(tx.hash);
          
          await this.parseReceipt(receipt);
        }
      }

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

  async poolAddresses(){
    return [];
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
