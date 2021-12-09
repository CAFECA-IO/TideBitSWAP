const path = require('path');
const dvalue = require('dvalue');
const smartContract = require('../libs/smartContract');
const Ecrequest = require('ecrequest');
const { URL } = require('url');
const Utils = require('../libs/Utils');

const Bot = require(path.resolve(__dirname, 'Bot.js'));
const eceth = require(path.resolve(__dirname, '../libs/eceth.js'));
const Blockchains = require(path.resolve(__dirname, '../constants/Blockchain.js'));
const ResponseFormat = require(path.resolve(__dirname, '../libs/ResponseFormat.js'));
const TideBitSwapData = require('../constants/TideBitSwapData.js');
const TideWalletBackend = require('../constants/TideWalletBackend.js');

const CrawlerBase = require('../libs/CrawlerBase') //++ todo: move to new class

class MockApis extends Bot {
  constructor() {
    super();
    this.name = 'MockApis';
  }

  init({ config, database, logger, i18n }) {
    return super.init({ config, database, logger, i18n })
    .then(() => {
      this.testCrawler = new CrawlerBase(3, database, logger);
      return this.testCrawler.init();
    })
      .then(() => this);
  }

  async start() {
    await super.start();
    await this.testCrawler.start();
    return this;
  }

  async getPriceData({ params = {} }) {
    return new ResponseFormat({
      message: 'Price Data',
      payload: Utils.randomCandleStickData(),
    });
  }

  async getTvlHistory({ params = {} }) {
    const { startTime = new Date(2021, 9, 15), endTime = new Date() } = params;
    return new ResponseFormat({
      message: 'TVL History',
      payload: Utils.randomFixedDirectionData(startTime, endTime),
    })
  }

  async getVolume24hr({ params = {} }) {
    const { startTime = new Date(2021, 9, 15), endTime = new Date() } = params;
    return new ResponseFormat({
      message: 'get Volume 24hr',
      payload: Utils.randomData(startTime, endTime),
    });
  }

  async getPoolDetail({ params = {} }) {
    return new ResponseFormat({
      message: 'Pool Detail',
      payload:{
        volume: {
          value: `${Math.floor(Math.random() * 1e+8)}`,
          change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
            Math.random() * 1
          ).toFixed(2)}`,
        },
        tvl: {
          value: `${Math.floor(Math.random() * 1e+8)}`,
          change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
            Math.random() * 1
          ).toFixed(2)}`,
        },
        irr: "3",
        interest24: `${(Math.random() * 1e+4)}`,
      }
    })
  }

  async getTokenDetail({ params = {} }) {
    return new ResponseFormat({
      message: 'Token Detail',
      payload:{
        priceToEth: {
          value: `${Math.floor(Math.random() * 1e+8)}`,
          change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
            Math.random() * 1
          ).toFixed(2)}`,
        },
        volume: {
          value: `${Math.floor(Math.random() * 1e+8)}`,
          change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
            Math.random() * 1
          ).toFixed(2)}`,
        },
      }
    })
  }

  async getCryptoRate({ params = {} }) {
    try {
      const { chainId } = params;
      const decChainId = parseInt(chainId).toString();
      const blockchain = Blockchains.findByChainId(decChainId);
      if (!blockchain) {
        console.warn('chainId not support');
        return new ResponseFormat({
          message: 'Crypto Currency Rate Failed',
          code: '',
        });
      }
      const currencyId = TideWalletBackend.currencyId[blockchain.nativeCurrency.symbol];
      const { protocol, host } = new URL(TideWalletBackend.url);
      const requestData = {
        protocol,
        host,
        path: '/api/v1/crypto/rate',
        headers: { 'content-type': 'application/json' },
      }
      const raw = await Ecrequest.get(requestData);
      const res = JSON.parse(raw.data);
      if (res.code !== '00000000') throw new Error(res.message);
      const result = res.payload.find(o => o.currency_id === currencyId);
      delete result.currency_id;

      return new ResponseFormat({
        message: 'Crypto Currency Rate',
        payload: result,
      });
    } catch (error) {
      return new ResponseFormat({
        message: 'Crypto Currency Rate Fail',
        code: '',
      });
    }
  }
    
}

module.exports = MockApis;
