const path = require('path');

const Sqlite = require(path.resolve(__dirname, "./sqlite"));

class DBOperator {
  database = null;
  _isInit = false;

  get tokenDao() {
    return this.database.tokenDao;
  }

  get tokenPriceDao() {
    return this.database.tokenPriceDao;
  }

  get poolDao() {
    return this.database.poolDao;
  }

  get poolPriceDao() {
    return this.database.poolPriceDao;
  }

  get transactionHistoryDao() {
    return this.database.transactionHistoryDao;
  }

  get blockTimestampDao() {
    return this.database.blockTimestampDao;
  }

  get cryptoRateToUsdDao() {
    return this.database.cryptoRateToUsdDao;
  }

  get overviewHistoryDao() {
    return this.database.overviewHistoryDao;
  }

  get poolDetailHistoryDao() {
    return this.database.poolDetailHistoryDao;
  }

  get tokenDetailHistoryDao() {
    return this.database.tokenDetailHistoryDao;
  }

  get poolTvlHistoryDao() {
    return this.database.poolTvlHistoryDao;
  }

  get tokenTvlHistoryDao() {
    return this.database.tokenTvlHistoryDao;
  }

  get stakeDao() {
    return this.database.stakeDao;
  }

  constructor() {
    return this;
  }

  async init(dir) {
    if (this._isInit) return;
    this.database = new Sqlite();
    this._isInit = true;

    return this.database.init(dir);
  }

  down() {
    if (!this.database) return;
    this.database.close();
    this._isInit = false;
    this.database = null;
  }
}

module.exports = DBOperator;
