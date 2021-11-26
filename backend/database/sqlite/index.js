const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const Entity = require('../entity');

const DB_DEFAULT_DIR = "tidebitswap";

const TBL_TOKEN = 'token';

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
  _userDao = null;
  _accountDao = null;
  _currencyDao = null;
  _networkDao = null;
  _txDao = null;
  _utxoDao = null;
  _exchangeRateDao = null;
  _prefDao = null;

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
      inPoolAmount TEXT,
      timestamp INTEGER
    )`;
    
    try {
      await this.db.runDB(tokenSQL);
    } catch (error) {
      console.log('create table error:', error);
    }
    // create index
    // if (version <= 1) {
    //   const accounts = this.db.createObjectStore(TBL_ACCOUNT, {
    //     keyPath: "id",
    //   });V

    //   let accountIndex = accounts.createIndex("accountId", "accountId");
    //   let blockchainIndex = accounts.createIndex(
    //     "blockchainId",
    //     "blockchainId"
    //   );

    //   const txs = this.db.createObjectStore(TBL_TX, {
    //     keyPath: "id",
    //   });V
    //   let accountIdIndex = txs.createIndex("accountId", "accountId");
    //   let txIndex = txs.createIndex("id", "id");

    //   const currency = this.db.createObjectStore(TBL_CURRENCY, {
    //     keyPath: "currencyId",
    //   });V
    //   let currencyIndex = currency.createIndex("blockchainId", "blockchainId");

    //   const utxo = this.db.createObjectStore(TBL_UTXO, {
    //     keyPath: "utxoId",
    //   });V
    //   let utxoIndex = utxo.createIndex("accountId", "accountId");
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

  listToken() {
    return this._readAll()
  }

  insertToken(tokenEntity) {
    return this._write(tokenEntity);
  }

  updateToken(tokenEntity) {
    return this._write(tokenEntity);
  }
}

module.exports = Sqlite;
