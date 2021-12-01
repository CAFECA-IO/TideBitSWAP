const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const Entity = require('../entity');

const DB_DEFAULT_DIR = "tidebitswap";

const TBL_TOKEN = 'token';
const TBL_TOKEN_PRICE = 'token_price';
const TBL_POOL = 'pool';
const TBL_POOL_PRICE = 'pool_price';
const TBL_TRANSACTION = 'transactionHistory';
const TBL_BLOCK_TIMESTAMP = 'block_timestamp';

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

    await this._createTable();
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

    const indexTokenPriceChainIdContractTimestamp = `CREATE INDEX IF NOT EXISTS idx_token_price_chainId_contract_timestamp ON ${TBL_TOKEN_PRICE}(
      chainId,
      contract,
      timestamp
    )`;

    const poolSQL = `CREATE TABLE IF NOT EXISTS ${TBL_POOL} (
      id TEXT PRIMARY KEY,
      chainId TEXT,
      contract TEXT,
      factoryIndex INTEGER,
      decimals INTEGER,
      totalSupply TEXT,
      token0Contract TEXT,
      token1Contract TEXT,
      token0Amount TEXT,
      token1Amount TEXT,
      timestamp INTEGER
    )`;

    const poolPriceSQL = `CREATE TABLE IF NOT EXISTS ${TBL_POOL_PRICE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chainId TEXT,
      contract TEXT,
      factoryIndex INTEGER,
      transactionHash TEXT,
      timestamp INTEGER,
      token0Amount TEXT,
      token1Amount TEXT
    )`;

    const indexPoolPriceChainIdContractTimestamp = `CREATE INDEX IF NOT EXISTS idx_pool_price_chainId_contract_timestamp ON ${TBL_POOL_PRICE}(
      chainId,
      contract,
      timestamp
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
      timestamp INTEGER
    )`;

    const indexTransactionChainIdCallerAddress = `CREATE INDEX IF NOT EXISTS idx_chainId_callerAddress ON ${TBL_TRANSACTION}(
      chainId,
      callerAddress
    )`;

    const blockTimestampSQL = `CREATE TABLE IF NOT EXISTS ${TBL_BLOCK_TIMESTAMP} (
      id TEXT PRIMARY KEY,
      chainId TEXT,
      blockNumber TEXT,
      timestamp INTEGER,
      isParsed INTEGER
    )`;
    
    try {
      await this.db.runDB(tokenSQL);
      await this.db.runDB(tokenPriceSQL);
      await this.db.runDB(poolSQL);
      await this.db.runDB(poolPriceSQL);
      await this.db.runDB(transactionSQL);
      await this.db.runDB(blockTimestampSQL);
      await this.db.runDB(indexTokenPriceChainIdContractTimestamp);
      await this.db.runDB(indexPoolPriceChainIdContractTimestamp);
      await this.db.runDB(indexTransactionChainIdCallerAddress);
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

  _read(value = null, index) {
    const where = index ? `${index} = ?` : `${this._pk} = ?`;
    const findOne = `
      SELECT * FROM ${this._name} WHERE ${where}
    `;
    return this._db.get(findOne, value);
  }

  _readAll(value = [], index) {
    const where = value.length ? (index ? `${index} = ?` : `${this._pk} = ?`) : '';
    const find = where ? `
      SELECT * FROM ${this._name} WHERE ${where}
    `
    : `SELECT * FROM ${this._name}`;
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
    return this._readAll(chainId, 'chainId')
  }

  insertToken(tokenEntity) {
    return this._write(tokenEntity);
  }

  updateToken(tokenEntity) {
    return this._write(tokenEntity);
  }
}

module.exports = Sqlite;
