const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const Entity = require('../entity');
const sqlType = require('../sqlType');
const {attribute, dataType} = sqlType.sqlite3

const DB_DEFAULT_DIR = "tidebitswap";

const TBL_TOKEN = 'token';
const TBL_TOKEN_PRICE = 'token_price';
const TBL_POOL = 'pool';
const TBL_POOL_PRICE = 'pool_price';
const TBL_TRANSACTION = 'transactionHistory';
const TBL_BLOCK_TIMESTAMP = 'block_timestamp';
const TBL_CRYPTO_RATE_TO_USD = 'crypto_rate_to_usd';
const TBL_OVERVIEW_HISTORY = 'overviewHistory';
const TBL_POOL_DETAIL_HISTORY = 'pool_detail_history';
const TBL_TOKEN_DETAIL_HISTORY = 'token_detail_history';
const TBL_MIGRATIONS = 'migrations';
const TBL_POOL_TVL_HISTORY = 'pool_tvl_history';
const TBL_TOKEN_TVL_HISTORY = 'token_tvl_history';
const TBL_STAKE = 'stake';

class sqliteDB {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath);
    return this;
  }

  runDB(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          console.log('Error running sql ' + sql)
          console.log(err)
          reject(err)
        } else {
          // console.log('run sql id:', this.lastID)
          resolve({ id: this.lastID })
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          console.log('Error running sql: ' + sql)
          console.log(err)
          reject(err)
        } else {
          resolve(result)
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.log('Error running sql: ' + sql)
          console.log(err)
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }
}

class Sqlite {
  constructor() {}
  db = null;
  _tokenDao = null;
  _tokenPriceDao = null;
  _poolDao = null;
  _poolPriceDao = null;
  _transactionHistoryDao = null;
  _blockTimestampDao = null;
  _cryptoRateToUsdDao = null;
  _overviewHistoryDao = null;
  _poolDetailHistoryDao = null;
  _tokenDetailHistoryDao = null;
  _migrationsDao = null;
  _poolTvlHistoryDao = null;
  _tokenTvlHistoryDao = null;
  _stakeDao = null;

  init(dir) {
    return this._createDB(dir);
  }

  async _createDB(dbDir = DB_DEFAULT_DIR) {
    // const request = indexedDB.open(dbName, dbVersion);
    const DBName = `tidebitswap.db`;
    const dbPath = path.join(dbDir, DBName);
    if (await !fs.existsSync(dbDir)) { await fs.mkdirSync(dbDir, { recursive: true }); }
    this.db = new sqliteDB(dbPath);

    this._tokenDao = new TokenDao(this.db, TBL_TOKEN);
    this._tokenPriceDao = new TokenPriceDao(this.db, TBL_TOKEN_PRICE);
    this._poolDao = new PoolDao(this.db, TBL_POOL);
    this._poolPriceDao = new PoolPriceDao(this.db, TBL_POOL_PRICE);
    this._transactionHistoryDao = new TransactionHistoryDao(this.db, TBL_TRANSACTION);
    this._blockTimestampDao = new BlockTimestampDao(this.db, TBL_BLOCK_TIMESTAMP);
    this._cryptoRateToUsdDao = new CryptoRateToUsdDao(this.db, TBL_CRYPTO_RATE_TO_USD);
    this._overviewHistoryDao = new OverviewHistoryDao(this.db, TBL_OVERVIEW_HISTORY);
    this._poolDetailHistoryDao = new PoolDetailHistoryDao(this.db, TBL_POOL_DETAIL_HISTORY);
    this._tokenDetailHistoryDao = new TokenDetailHistoryDao(this.db, TBL_TOKEN_DETAIL_HISTORY);
    this._migrationsDao = new MigrationsDao(this.db, TBL_MIGRATIONS);
    this._poolTvlHistoryDao = new PoolTvlHistoryDao(this.db, TBL_POOL_TVL_HISTORY);
    this._tokenTvlHistoryDao = new TokenTvlHistoryDao(this.db, TBL_TOKEN_TVL_HISTORY);
    this._stakeDao = new StakeDao(this.db, TBL_STAKE);

    await this._createTable();
    await this._createIndex();
    await this._runMigration();
    return this.db;
  }

  async _createTable() {
    const tokenSQL = `CREATE TABLE IF NOT EXISTS ${TBL_TOKEN} (
      id TEXT PRIMARY KEY,
      chainId TEXT,
      contract TEXT,
      name TEXT,
      symbol TEXT,
      decimals INTEGER,
      totalSupply TEXT,
      priceToEth TEXT,
      timestamp INTEGER
    )`;

    const tokenPriceSQL = `CREATE TABLE IF NOT EXISTS ${TBL_TOKEN_PRICE}(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chainId TEXT,
      contract TEXT,
      priceToEth TEXT,
      timestamp INTEGER
    )`;

    const poolSQL = `CREATE TABLE IF NOT EXISTS ${TBL_POOL} (
      id TEXT PRIMARY KEY,
      chainId TEXT,
      contract TEXT,
      factoryContract TEXT,
      factoryIndex INTEGER,
      decimals INTEGER,
      totalSupply TEXT,
      token0Contract TEXT,
      token1Contract TEXT,
      timestamp INTEGER
    )`;

    const poolPriceSQL = `CREATE TABLE IF NOT EXISTS ${TBL_POOL_PRICE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chainId TEXT,
      contract TEXT,
      transactionHash TEXT,
      timestamp INTEGER,
      token0Amount TEXT,
      token1Amount TEXT
    )`;

    const transactionSQL = `CREATE TABLE IF NOT EXISTS ${TBL_TRANSACTION} (
      id TEXT PRIMARY KEY,
      chainId TEXT,
      transactionHash TEXT,
      type INTEGER,
      callerAddress TEXT,
      poolContract TEXT,
      token0Contract TEXT,
      token1Contract TEXT,
      token0AmountIn TEXT,
      token0AmountOut TEXT,
      token1AmountIn TEXT,
      token1AmountOut TEXT,
      share TEXT,
      timestamp INTEGER
    )`;

    const blockTimestampSQL = `CREATE TABLE IF NOT EXISTS ${TBL_BLOCK_TIMESTAMP} (
      id TEXT PRIMARY KEY,
      chainId TEXT,
      blockNumber TEXT,
      timestamp INTEGER,
      isParsed INTEGER
    )`;

    const cryptRateToUsdSQL = `CREATE TABLE IF NOT EXISTS ${TBL_CRYPTO_RATE_TO_USD} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chainId TEXT,
      rate TEXT,
      timestamp INTEGER
    )`;

    const overviewHistorySQL = `CREATE TABLE IF NOT EXISTS ${TBL_OVERVIEW_HISTORY} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chainId TEXT,
      timestamp INTEGER,
      volumeValue TEXT,
      volume24hrBefore TEXT,
      volumeChange TEXT,
      tvlValue TEXT,
      tvl24hrBefore TEXT,
      tvlChange TEXT,
      fee24 TEXT
    )`;

    const poolDetailHistorySQL = `CREATE TABLE IF NOT EXISTS ${TBL_POOL_DETAIL_HISTORY} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chainId TEXT,
      contract TEXT,
      timestamp INTEGER,
      volumeValue TEXT,
      volume24hrBefore TEXT,
      volumeChange TEXT,
      tvlValue TEXT,
      tvl24hrBefore TEXT,
      tvlChange TEXT,
      irr TEXT,
      interest24 TEXT,
      fee24 TEXT
    )`;

    const tokenDetailHistorySQL = `CREATE TABLE IF NOT EXISTS ${TBL_TOKEN_DETAIL_HISTORY} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chainId TEXT,
      contract TEXT,
      timestamp INTEGER,
      priceValue TEXT,
      priceChange TEXT,
      priceToEthValue TEXT,
      priceToEthChange TEXT,
      volumeValue TEXT,
      volumeChange TEXT,
      swap7Day TEXT,
      fee24 TEXT,
      tvlValue TEXT,
      tvlChange TEXT
    )`;
    
    try {
      await this.db.runDB(tokenSQL);
      await this.db.runDB(tokenPriceSQL);
      await this.db.runDB(poolSQL);
      await this.db.runDB(poolPriceSQL);
      await this.db.runDB(transactionSQL);
      await this.db.runDB(blockTimestampSQL);
      await this.db.runDB(cryptRateToUsdSQL);
      await this.db.runDB(overviewHistorySQL);
      await this.db.runDB(poolDetailHistorySQL);
      await this.db.runDB(tokenDetailHistorySQL);
    } catch (error) {
      console.log('create table error:', error);
    }
  }

  async _createIndex() {
    const indexTokenPriceChainIdContractTimestamp = `CREATE INDEX IF NOT EXISTS idx_token_price_chainId_contract_timestamp ON ${TBL_TOKEN_PRICE}(
      chainId,
      contract,
      timestamp
    )`;

    const indexPoolPriceChainIdContractTimestamp = `CREATE INDEX IF NOT EXISTS idx_pool_price_chainId_contract_timestamp ON ${TBL_POOL_PRICE}(
      chainId,
      contract,
      timestamp
    )`;

    const uniqueIndexPoolPriceChainIdContractTransactionHash = `CREATE UNIQUE INDEX IF NOT EXISTS idx_pool_price_chainId_contract_transactionHash ON ${TBL_POOL_PRICE}(
      chainId,
      contract,
      transactionHash
    )`;

    const indexTransactionChainIdCallerAddress = `CREATE INDEX IF NOT EXISTS idx_chainId_callerAddress ON ${TBL_TRANSACTION}(
      chainId,
      callerAddress
    )`;

    const indexTransactionChainIdPoolContractTimestampType = `CREATE INDEX IF NOT EXISTS idx_chainId_pool_contract_timestamp_type ON ${TBL_TRANSACTION}(
      chainId,
      poolContract,
      timestamp,
      type
    )`;

    const indexTransactionChainIdToken0ContractTimestampType = `CREATE INDEX IF NOT EXISTS idx_chainId_token0_contract_timestamp_type ON ${TBL_TRANSACTION}(
      chainId,
      token0Contract,
      timestamp,
      type
    )`;

    const indexTransactionChainIdToken1ContractTimestampType = `CREATE INDEX IF NOT EXISTS idx_chainId_token1_contract_timestamp_type ON ${TBL_TRANSACTION}(
      chainId,
      token1Contract,
      timestamp,
      type
    )`;

    const indexBlockTimestampChainIdIsParsed = `CREATE INDEX IF NOT EXISTS idx_block_timestamp_chainId_isParsed ON ${TBL_BLOCK_TIMESTAMP}(
      chainId,
      isParsed
    )`;

    const indexBlockTimestampChainIdTimestamp = `CREATE INDEX IF NOT EXISTS idx_block_timestamp_chainId_timestamp ON ${TBL_BLOCK_TIMESTAMP}(
      chainId,
      timestamp
    )`;

    const indexCryptoRateToUsdChainIdTimestamp = `CREATE INDEX IF NOT EXISTS idx_crypto_rate_to_usd_chainId_timestamp ON ${TBL_CRYPTO_RATE_TO_USD}(
      chainId,
      timestamp
    )`;

    const indexPoolChainIdToken0Contract = `CREATE INDEX IF NOT EXISTS idx_pool_chainId_token0_contract ON ${TBL_POOL}(
      chainId,
      token0Contract
    )`;

    const indexPoolChainIdToken1Contract = `CREATE INDEX IF NOT EXISTS idx_pool_chainId_token1_contract ON ${TBL_POOL}(
      chainId,
      token1Contract
    )`;

    const indexOverviewHistoryChainIdTimestamp = `CREATE INDEX IF NOT EXISTS idx_overview_history_chainId_timestamp ON ${TBL_OVERVIEW_HISTORY}(
      chainId,
      timestamp
    )`;

    const indexPoolDetailHistoryChainIdContractTimestamp = `CREATE INDEX IF NOT EXISTS idx_pool_detail_history_chainId_contract_timestamp ON ${TBL_POOL_DETAIL_HISTORY}(
      chainId,
      contract,
      timestamp
    )`;

    const indexTokenDetailHistoryChainIdContractTimestamp = `CREATE INDEX IF NOT EXISTS idx_token_detail_history_chainId_contract_timestamp ON ${TBL_TOKEN_DETAIL_HISTORY}(
      chainId,
      contract,
      timestamp
    )`;

    try {
      await this.db.runDB(indexTokenPriceChainIdContractTimestamp);
      await this.db.runDB(indexPoolPriceChainIdContractTimestamp);
      await this.db.runDB(uniqueIndexPoolPriceChainIdContractTransactionHash);
      await this.db.runDB(indexTransactionChainIdCallerAddress);
      await this.db.runDB(indexTransactionChainIdPoolContractTimestampType);
      await this.db.runDB(indexTransactionChainIdToken0ContractTimestampType);
      await this.db.runDB(indexTransactionChainIdToken1ContractTimestampType);
      await this.db.runDB(indexBlockTimestampChainIdIsParsed);
      await this.db.runDB(indexBlockTimestampChainIdTimestamp);
      await this.db.runDB(indexCryptoRateToUsdChainIdTimestamp);
      await this.db.runDB(indexPoolChainIdToken0Contract);
      await this.db.runDB(indexPoolChainIdToken1Contract);
      await this.db.runDB(indexOverviewHistoryChainIdTimestamp);
      await this.db.runDB(indexPoolDetailHistoryChainIdContractTimestamp);
      await this.db.runDB(indexTokenDetailHistoryChainIdContractTimestamp);
    } catch (error) {
      console.log('create table error:', error);
    }
  }

  close() {
    this.db.close();
  }

  get tokenDao() {
    return this._tokenDao;
  }

  get tokenPriceDao() {
    return this._tokenPriceDao;
  }

  get poolDao() {
    return this._poolDao;
  }

  get poolPriceDao() {
    return this._poolPriceDao;
  }

  get transactionHistoryDao() {
    return this._transactionHistoryDao;
  }

  get blockTimestampDao() {
    return this._blockTimestampDao;
  }

  get cryptoRateToUsdDao() {
    return this._cryptoRateToUsdDao;
  }

  get overviewHistoryDao() {
    return this._overviewHistoryDao;
  }

  get poolDetailHistoryDao() {
    return this._poolDetailHistoryDao;
  }

  get tokenDetailHistoryDao() {
    return this._tokenDetailHistoryDao;
  }

  get migrationsDao() {
    return this._migrationsDao;
  }

  get poolTvlHistoryDao() {
    return this._poolTvlHistoryDao;
  }

  get tokenTvlHistoryDao() {
    return this._tokenTvlHistoryDao;
  }

  get stakeDao() {
    return this._stakeDao;
  }

  // migration

  async _runMigration() {
    const migrationTBLSQL = `CREATE TABLE IF NOT EXISTS ${TBL_MIGRATIONS} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name VARCHAR,
      run_on DATETIME
    )`;
    await this.db.runDB(migrationTBLSQL);
    const mgPath = path.resolve(__dirname, '../migrations');
    const dirMigrations = (fs.readdirSync(mgPath)).map(fileName => {
      const arr = fileName.split('.');
      arr.pop();
      return arr.join('.');
    });
    const dbMigrations = (await this.migrationsDao.listMigrations()).map(mg => mg.file_name);
    const newMigrations = dirMigrations.filter((mg) => !dbMigrations.includes(mg));
    try {
      for (const newMigration of newMigrations) {
        await this.db.runDB('BEGIN TRANSACTION');
        const entity = this.migrationsDao.entity({
          file_name: newMigration,
        });
        const mgUp = require(`${mgPath}/${newMigration}`).up;
        console.log(`[Run migration] ${newMigration}`);

        await this.migrationsDao.insertMigration(entity);
        await mgUp(this, dataType);
        await this.db.runDB('COMMIT');
      }
    } catch (error) {
      console.log('[Migration error]', error);
      await this.db.runDB('ROLLBACK');
      throw error;
    }

    if (newMigrations.length === 0) {
      console.log('[There is not have new migrations]');
    }
  }

  _parseAttribute(attr) {
    const cloneAttr = {...attr};
    delete cloneAttr.type;
    const keys = Object.keys(cloneAttr);
    let sqlArr = [];
    keys.forEach(key => {
      let sql;
      switch (key) {
        case attribute.primaryKey:
          if (cloneAttr.primaryKey) { sql = 'PRIMARY KEY'; }
          break;
        case attribute.autoIncrement:
          if (cloneAttr.autoIncrement) { sql = 'AUTOINCREMENT'; }
          break;
        case attribute.allowNull:
          if (!cloneAttr.allowNull) { sql = 'NOT NULL'; }
          break;
        case attribute.defaultValue:
          sql = `DEFAULT ${cloneAttr.defaultValue}`;
          break;
        default:
      }

      if (sql) sqlArr.push(sql);
    });
    return sqlArr.join(' ');
  }

  async createTable(tableName, attributes) {
    const columeNames = Object.keys(attributes);
    let schemaSqlArr = [];
    columeNames.forEach(name => {
      const attr = attributes[name];
      if (typeof attr === 'string') {
        const columnSql = `${name} ${attr}`;
        schemaSqlArr.push(columnSql);
      } else {
        const columnSql = `${name} ${attr.type} ${this._parseAttribute(attr)}`;
        schemaSqlArr.push(columnSql);
      }
    });

    const sql = `CREATE TABLE ${tableName} (${schemaSqlArr.join(', ')})`;
    console.log(`[Run migration] ${sql}`);
    return this.db.runDB(sql);
  }

  async addColumn(tableName, columnName, attribute) {
    let columnSql = '';
    if (typeof attribute === 'string') {
      columnSql = `${columnName} ${attribute}`;
    } else {
      columnSql = `${columnName} ${attribute.type} ${this._parseAttribute(attribute)}`;
    }

    const sql = `ALTER TABLE ${tableName} ADD COLUMN ${columnSql}`;
    console.log(`[Run migration] ${sql}`);
    return this.db.runDB(sql);
  }

  async renameTable(oriTableName, newTableName) {
    const sql = `ALTER TABLE ${oriTableName} RENAME TO ${newTableName}`;
    console.log(`[Run migration] ${sql}`);
    return this.db.runDB(sql);
  }

  async dropTable(tableName) {
    const sql = `DROP TABLE ${tableName}`;
    console.log(`[Run migration] ${sql}`);
    return this.db.runDB(sql);
  }

  async renameColumn(tableName, oriColumnName, newColumnName) {
    const sql = `ALTER TABLE ${tableName} RENAME COLUMN ${oriColumnName} TO ${newColumnName}`;
    console.log(`[Run migration] ${sql}`);
    return this.db.runDB(sql);
  }

  async addIndex(tableName, attributes, options = {}) {
    const indexName = options.name ? options.name : `idx_${tableName}_${attributes.join('_')}`;
    const isUnique = options.unique ? 'UNIQUE' : '';
    const sql = `CREATE ${isUnique} INDEX ${indexName} ON ${tableName} (${attributes.join(', ')})`;
    console.log(`[Run migration] ${sql}`);
    return this.db.runDB(sql);
  }

  async dropIndex(indexName) {
    const sql = `DROP INDEX IF EXISTS ${indexName};`;
    console.log(`[Run migration] ${sql}`);
    return this.db.runDB(sql);
  }

  // 為了DB降版用，未完成
  // async removeColumn(tableName, columnName) {
  //   const tempTableName = `${tableName}_${Date.now()}`;
  //   const oriTableCreateSql = await this.db.get(`SELECT sql FROM sqlite_master WHERE name=?`, tableName);
  //   console.log('!!!oriTableCreateSql', oriTableCreateSql) // --
  //   const arrSql = oriTableCreateSql.sql.split(/\(|\)/);
  //   console.log('!!!arrSql', arrSql); // --
  //   const arrColumn = arrSql[1].split(', ');
  //   const newArrColumn = arrColumn.filter(str => {
  //     const arr = str.split(' ');
  //     if (arr[0] === columnName) return false;
  //     return true;
  //   });
  //   const newTableSql = `CREATR TABLE ${tempTableName} (${newArrColumn.join(', ')})`;
  //   console.log('!!!newTableSql', newTableSql); // --
  //   await this.db.runDB(newTableSql);

  //   throw new Error ('stop migrate')
  // }
}

class DAO {
  constructor(db, name, pk) {
    this._db = db;
    this._name = name;
    this._pk = pk
  }

  entity() {}

  /**
   *
   * @param {Object} data The entity return value
   * @param {Object} [options]
   */
  _write(data, options) {
    const sql = `
      INSERT OR REPLACE INTO ${this._name} (${Object.keys(data).join(', ')})
      VALUES (${Object.keys(data).map((k) => '?').join(', ')})
    `;
    return this._db.runDB(sql, Object.values(data));
  }

  _writeAll(entities) {
    if (entities.length > 0) {
      let sql = `INSERT OR REPLACE INTO ${this._name} (${Object.keys(entities[0]).join(', ')}) VALUES`;
      let values = [];
      for (const entity of entities) {
        sql += ` (${Object.keys(entity).map((k) => '?').join(', ')}),`;
        values = [...values, ...Object.values(entity)]
      }
      sql = sql.slice(0, -1);
      return this._db.runDB(sql, values);
    }
    return Promise.resolve(true);
  }

  _read(value = null, index, option = {}) {
    const where = index ? index.map(i => `${i}= ?`).join(' AND ') : `${this._pk} = ?`;
    const order = (option && option.orderBy) ? ` ORDER BY ${option.orderBy.join(', ')}` : '';
    const findOne = `SELECT * FROM ${this._name} WHERE ${where} ${order}`;
    return this._db.get(findOne, value);
  }

  _readAll(value = [], index, option = {}) {
    const where = value.length ? (index ? `WHERE ${index.map(i => `${i}= ?`).join(' AND ')}` : `WHERE ${this._pk} = ?`) : '';
    const order = (option && option.orderBy) ? ` ORDER BY ${option.orderBy.join(', ')}` : '';
    const limit = (option && option.limit) ? ` LIMIT ${option.limit.join(', ')}` : '';
    const find = `SELECT * FROM ${this._name} ${where} ${order} ${limit}`;
    return this._db.all(find, value);
  }

  _update(data) {
    const where = `${this._pk} = ?`;
    const params = Object.values(data);
    params.push(data[this._pk]);
    const sql = `UPDATE ${this._name} SET ${Object.keys(data).map((k) => `${k} = ?`).join(', ')} WHERE ${where}`;
    return this._db.runDB(sql, params);
  }

  _delete(key) {
    const where = `${this._pk} = ?`;
    const sql = `DELETE FROM ${this._name} WHERE ${where}`;
    return this._db.runDB(sql, key)
  }

  _deleteAll() {
    const sql = `DELETE FROM ${this._name}`;
    return this._db.runDB(sql)
  }
}

class TokenDao extends DAO {
  constructor(db, name) {
    super(db, name, 'id');
  }

  /**
   * @override
   */
  entity(param) {
    return Entity.TokenDao(param);
  }

  findToken(chainId, address) {
    return this._read(`${chainId}-${address}`);
  }

  listToken(chainId) {
    return this._readAll(chainId, ['chainId'])
  }

  insertToken(tokenEntity) {
    return this._write(tokenEntity);
  }

  updateToken(tokenEntity) {
    return this._write(tokenEntity);
  }
}

class TokenPriceDao extends DAO {
  constructor(db, name) {
    super(db, name, 'id');
  }

  /**
   * @override
   */
  entity(param) {
    return Entity.TokenPriceDao(param);
  }

  findTokenPrice(chainId, contract) {
    return this._read([chainId, contract], ['chainId', 'contract'], { orderBy: ['timestamp DESC'] });
  }

  findTokenPriceByTimeBefore(chainId, contract, timestamp) {
    return this._read([chainId, contract, timestamp], ['chainId', 'contract', 'timestamp<'], { orderBy: ['timestamp DESC'] });
  }

  findTokenPriceByTimeAfter(chainId, contract, timestamp) {
    return this._read([chainId, contract, timestamp], ['chainId', 'contract', 'timestamp>'], { orderBy: ['timestamp ASC'] });
  }

  listTokenPrice(chainId, contract) {
    return this._readAll([chainId, contract], ['chainId', 'contract'])
  }

  insertTokenPrice(tokenPriceEntity) {
    return this._write(tokenPriceEntity);
  }

  insertTokenPrices(tokenPriceEntitys) {
    return this._writeAll(tokenPriceEntitys);
  }

  updateToken(tokenPriceEntity) {
    return this._write(tokenPriceEntity);
  }
}

class PoolDao extends DAO {
  constructor(db, name) {
    super(db, name, 'id');
  }

  /**
   * @override
   */
  entity(param) {
    return Entity.PoolDao(param);
  }

  findPool(chainId, contract) {
    return this._read(`${chainId}-${contract}`);
  }

  listPool(chainId) {
    return this._readAll(chainId, ['chainId'])
  }

  listPoolByToken0(chainId, token0Contract) {
    return this._readAll([chainId, token0Contract], ['chainId', 'token0Contract']);
  }

  listPoolByToken1(chainId, token1Contract) {
    return this._readAll([chainId, token1Contract], ['chainId', 'token1Contract']);
  }

  insertPool(poolEntity) {
    return this._write(poolEntity);
  }

  insertPools(poolEntitys) {
    return this._writeAll(poolEntitys);
  }

  updatePool(poolEntity) {
    return this._write(poolEntity);
  }
}

class PoolPriceDao extends DAO {
  constructor(db, name) {
    super(db, name, 'id');
  }

  /**
   * @override
   */
  entity(param) {
    return Entity.PoolPriceDao(param);
  }

  findPoolPrice(chainId, contract) {
    return this._read([chainId, contract], ['chainId', 'contract'], { orderBy: ['timestamp DESC'] });
  }

  findPoolPriceByTimeBefore(chainId, contract, timestamp) {
    return this._read([chainId, contract, timestamp], ['chainId', 'contract', 'timestamp<'], { orderBy: ['timestamp DESC'] });
  }

  findPoolPriceByTimeAfter(chainId, contract, timestamp) {
    return this._read([chainId, contract, timestamp], ['chainId', 'contract', 'timestamp>'], { orderBy: ['timestamp ASC'] });
  }

  listPoolPriceByTime(chainId, contract, startTime, endTime) {
    return this._readAll([chainId, contract, startTime, endTime], ['chainId', 'contract', 'timestamp>', 'timestamp<'])
  }

  insertPoolPrice(poolPriceEntity) {
    return this._write(poolPriceEntity);
  }

  insertPoolPrices(poolPriceEntitys) {
    return this._writeAll(poolPriceEntitys);
  }

  updatePoolPrice(poolPriceEntity) {
    return this._write(poolPriceEntity);
  }
}

class TransactionHistoryDao extends DAO {
  constructor(db, name) {
    super(db, name, 'id');
  }

  /**
   * @override
   */
  entity(param) {
    return Entity.TransactionHistoryDao(param);
  }

  findTx(chainId, callerAddress) {
    return this._read([chainId, callerAddress], ['chainId', 'callerAddress']);
  }

  listTxByCaller(chainId, callerAddress) {
    return this._readAll([chainId, callerAddress], ['chainId', 'callerAddress']);
  }

  listTxByToken0(chainId, token0Contract, type, startTime, endTime) {
    if (type !== null) {
    return this._readAll([chainId, token0Contract, startTime, endTime, type], ['chainId', 'token0Contract', 'timestamp>', 'timestamp<', 'type']);
    } else {
    return this._readAll([chainId, token0Contract, startTime, endTime], ['chainId', 'token0Contract', 'timestamp>', 'timestamp<']);
    }
  }

  listTxByToken1(chainId, token1Contract, type, startTime, endTime) {
    if (type !== null) {
      return this._readAll([chainId, token1Contract, startTime, endTime, type], ['chainId', 'token1Contract', 'timestamp>', 'timestamp<', 'type']);
    } else {
      return this._readAll([chainId, token1Contract, startTime, endTime], ['chainId', 'token1Contract', 'timestamp>', 'timestamp<']);
    }
  }

  listTxByPool(chainId, poolContract, type, startTime, endTime) {
    if (type !== null) {
      return this._readAll([chainId, poolContract, startTime, endTime, type], ['chainId', 'poolContract', 'timestamp>', 'timestamp<', 'type']);
    } else {
      return this._readAll([chainId, poolContract, startTime, endTime], ['chainId', 'poolContract', 'timestamp>', 'timestamp<']);
    }
  }

  insertTx(txEntity) {
    return this._write(txEntity);
  }

  insertTxs(txEntitys) {
    return this._writeAll(txEntitys);
  }

  updateTx(txEntity) {
    return this._write(txEntity);
  }
}

class BlockTimestampDao extends DAO {
  constructor(db, name) {
    super(db, name, 'id');
  }

  /**
   * @override
   */
  entity(param) {
    return Entity.BlockTimestampDao(param);
  }

  findTimestamp(chainId, blockNumber) {
    return this._read(`${chainId}-${blockNumber}`);
  }

  findUnparsed(chainId) {
    return this._read([chainId, 0], ['chainId', 'isParsed']);
  }

  findLastBlock(chainId) {
    return this._read([chainId], ['chainId'], {orderBy: ['timestamp DESC']});
  }

  listBlockTimestamp(chainId) {
    return this._readAll([chainId], ['chainId']);
  }

  insertBlockTimestamp(entity) {
    return this._write(entity);
  }

  updateBlockTimestamp(entity) {
    return this._write(entity);
  }
}

class CryptoRateToUsdDao extends DAO {
  constructor(db, name) {
    super(db, name, 'id');
  }

  /**
   * @override
   */
  entity(param) {
    return Entity.CryptoRateToUsdDao(param);
  }

  findLastRate(chainId) {
    return this._read([chainId], ['chainId'], { orderBy: ['timestamp DESC'] });
  }

  findRateByTimeBefore(chainId, timestamp) {
    return this._read([chainId, timestamp], ['chainId', 'timestamp<'], { orderBy: ['timestamp DESC'] });
  }

  findRateByTimeAfter(chainId, timestamp) {
    return this._read([chainId, timestamp], ['chainId', 'timestamp>'], { orderBy: ['timestamp ASC'] });
  }

  listRateByTime(chainId, startTime, endTime) {
    return this._readAll([chainId, startTime, endTime], ['chainId', 'timestamp>', 'timestamp<']);
  }

  insertRate(rateEntity) {
    return this._write(rateEntity);
  }

  insertRates(rateEntitys) {
    return this._writeAll(rateEntitys);
  }

  updateRate(rateEntity) {
    return this._write(rateEntity);
  }
}

class OverviewHistoryDao extends DAO {
  constructor(db, name) {
    super(db, name, 'id');
  }

  /**
   * @override
   */
  entity(param) {
    return Entity.OverviewHistoryDao(param);
  }

  listOverviewHistory(chainId, startTime, endTime) {
    return this._readAll([chainId, startTime, endTime], ['chainId', 'timestamp >', 'timestamp <']);
  }

  insertOverviewHistory(overviewHistoryEntity) {
    return this._write(overviewHistoryEntity);
  }

  insertOverviewHistories(overviewHistoryEntities) {
    return this._writeAll(overviewHistoryEntities);
  }

  updateOverviewHistory(overviewHistoryEntity) {
    return this._write(overviewHistoryEntity);
  }
}

class PoolDetailHistoryDao extends DAO {
  constructor(db, name) {
    super(db, name, 'id');
  }

  /**
   * @override
   */
  entity(param) {
    return Entity.PoolDetailHistoryDao(param);
  }

  listPoolDetailHistory(chainId, contract, startTime, endTime) {
    return this._readAll([chainId, contract, startTime, endTime], ['chainId', 'contract', 'timestamp >', 'timestamp <']);
  }

  insertPoolDetailHistory(poolDetailHistoryEntity) {
    return this._write(poolDetailHistoryEntity);
  }

  insertPoolDetailHistories(poolDetailHistoryEntities) {
    return this._writeAll(poolDetailHistoryEntities);
  }

  updatePoolDetailHistory(poolDetailHistoryEntity) {
    return this._write(poolDetailHistoryEntity);
  }
}

class TokenDetailHistoryDao extends DAO {
  constructor(db, name) {
    super(db, name, 'id');
  }

  /**
   * @override
   */
  entity(param) {
    return Entity.TokenDetailHistoryDao(param);
  }

  listTokenDetailHistory(chainId, contract, startTime, endTime) {
    return this._readAll([chainId, contract, startTime, endTime], ['chainId', 'contract', 'timestamp >', 'timestamp <']);
  }

  insertTokenDetailHistory(tokenDetailHistoryEntity) {
    return this._write(tokenDetailHistoryEntity);
  }

  insertTokenDetailHistories(tokenDetailHistoryEntities) {
    return this._writeAll(tokenDetailHistoryEntities);
  }

  updateTokenDetailHistory(tokenDetailHistoryEntity) {
    return this._write(tokenDetailHistoryEntity);
  }
}

class MigrationsDao extends DAO {
  constructor(db, name) {
    super(db, name, 'id');
  }

  /**
   * @override
   */
  entity(param) {
    return Entity.MigrationsDao(param);
  }

  listMigrations() {
    return this._readAll();
  }

  insertMigration(migrationEntity) {
    return this._write(migrationEntity);
  }

  removeMigration(id) {
    return this._delete(id);
  }
}

class PoolTvlHistoryDao extends DAO {
  constructor(db, name) {
    super(db, name, 'id');
  }

  /**
   * @override
   */
  entity(param) {
    return Entity.PoolTvlHistoryDao(param);
  }

  findPoolTvlHistoryByTimeBefore(chainId, contract, timestamp) {
    return this._read([chainId, contract, timestamp], ['chainId', 'contract', 'timestamp<'], { orderBy: ['timestamp DESC'] });
  }

  findPoolTvlHistoryByTimeAfter(chainId, contract, timestamp) {
    return this._read([chainId, contract, timestamp], ['chainId', 'contract', 'timestamp>'], { orderBy: ['timestamp ASC'] });
  }

  listPoolTvlHistory(chainId, contract, startTime, endTime) {
    return this._readAll([chainId, contract, startTime, endTime], ['chainId', 'contract', 'timestamp >', 'timestamp <']);
  }

  insertPoolTvlHistory(poolTvlHistoryEntity) {
    return this._write(poolTvlHistoryEntity);
  }

  insertPoolDetailHistories(poolTvlHistoryEntities) {
    return this._writeAll(poolTvlHistoryEntities);
  }
}

class TokenTvlHistoryDao extends DAO {
  constructor(db, name) {
    super(db, name, 'id');
  }

  /**
   * @override
   */
  entity(param) {
    return Entity.TokenTvlHistoryDao(param);
  }

  findTokenTvlHistoryByTimeBefore(chainId, contract, timestamp) {
    return this._read([chainId, contract, timestamp], ['chainId', 'contract', 'timestamp<'], { orderBy: ['timestamp DESC'] });
  }

  findTokenTvlHistoryByTimeAfter(chainId, contract, timestamp) {
    return this._read([chainId, contract, timestamp], ['chainId', 'contract', 'timestamp>'], { orderBy: ['timestamp ASC'] });
  }

  listTokenTvlHistory(chainId, contract, startTime, endTime) {
    return this._readAll([chainId, contract, startTime, endTime], ['chainId', 'contract', 'timestamp >', 'timestamp <']);
  }

  insertTokenTvlHistory(poolTvlHistoryEntity) {
    return this._write(poolTvlHistoryEntity);
  }

  insertTokenDetailHistories(tokenTvlHistoryEntities) {
    return this._writeAll(tokenTvlHistoryEntities);
  }
}

class StakeDao extends DAO {
  constructor(db, name) {
    super(db, name, 'id');
  }

  /**
   * @override
   */
  entity(param) {
    return Entity.StakeDao(param);
  }

  findStakeByFactoryIndex(chainId, factoryContract, factoryIndex) {
    return this._read([chainId, factoryContract, factoryIndex], ['chainId', 'factoryContract', 'factoryIndex']);
  }

  async findLastStakeInFactory(chainId, factoryContract) {
    return this._read([chainId, factoryContract], ['chainId', 'factoryContract'], { orderBy : ['factoryIndex DESC'] });
  }

  listStakeByFactoryIndex(chainId, factoryContract, factoryIndex, limit) {
    return this._readAll([chainId, factoryContract, factoryIndex], ['chainId', 'factoryContract', 'factoryIndex'], { orderBy: ['factoryIndex DESC'], limit: [limit] });
  }

  listStakesByState(chainId, factoryContract, state) {
    return this._readAll([chainId, factoryContract, state], ['chainId', 'factoryContract', 'state']);
  }

  insertStake(stakeEntity) {
    return this._write(stakeEntity);
  }

  insertStakes(stakeEntity) {
    return this._writeAll(stakeEntity);
  }
}

module.exports = Sqlite;
