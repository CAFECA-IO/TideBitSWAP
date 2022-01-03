const path = require('path');
// const dvalue = require('dvalue');
// const smartContract = require('../libs/smartContract');
const Ecrequest = require('ecrequest');
const { URL } = require('url');
// const Utils = require('../libs/Utils');

const Bot = require(path.resolve(__dirname, 'Bot.js'));
// const eceth = require(path.resolve(__dirname, '../libs/eceth.js'));
const Blockchains = require(path.resolve(__dirname, '../constants/Blockchain.js'));
const ResponseFormat = require(path.resolve(__dirname, '../libs/ResponseFormat.js'));
const TideWalletBackend = require('../constants/TideWalletBackend.js');

const CrawlerBase = require('../libs/CrawlerBase') //++ todo: move to new class

const ONE_DAY_SECONDS = 86400;
const ONE_MONTH_SECONDS = 2628000;

class MockApis extends Bot {
  constructor() {
    super();
    this.name = 'MockApis';
  }

  init({ config, database, logger, i18n }) {
    return super.init({ config, database, logger, i18n })
    .then(() => {
      this.testCrawler = new CrawlerBase(3, database, logger, config);
      return this.testCrawler.init();
    })
      .then(() => this);
  }

  async start() {
    await super.start();
    await this.testCrawler.start();
    return this;
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

  async getPoolFeeHistory({ params = {} }) {
    const now = Math.floor(Date.now() / 1000);
    const monthBefore = now - ONE_MONTH_SECONDS;

    try {
      let interpolation = Math.floor(monthBefore / ONE_DAY_SECONDS);
      const res = [];
      while (now / ONE_DAY_SECONDS > interpolation) {
        interpolation += 1;
        if (now / ONE_DAY_SECONDS !== interpolation) {
          res.push({
            date: interpolation * ONE_DAY_SECONDS * 1000,
            value: '0',
          })
        }
      }
      
      return new ResponseFormat({
        message: 'Pool Fee History',
        payload: res,
      });
    } catch (error) {
      console.log(error);
      return new ResponseFormat({
        message: 'Pool Fee History fail',
        code: '',
      });
    }
  }

  async getStakeList({ params = {} }) {
    const { chainId } = params
    return new ResponseFormat({
      message: 'Stake List',
      payload: [
        {
          id: `${chainId}-0x63D11c6d79D7FB7cf611b0B142e057a00D7D19E7`,
          chainId,
          contract: '0x63D11c6d79D7FB7cf611b0B142e057a00D7D19E7',
          index: '203',
          tokenContract: '0xb97fc2e31b5c9f6901a0daded776a05409feb3df',
          totalStaked: '420090909090909091000',
          APY: '0.57',
          end: '15659300',
          endsIn: '2345',
          projectSite: '530725760680039093730'
        }
      ],
    })
  }

  async getStakeEndList({ params = {} }) {
    const { chainId } = params
    return new ResponseFormat({
      message: 'Stake List',
      payload: [
        {
          id: `${chainId}-0x63D11c6d79D7FB7cf611b0B142e057a00D7D19E7`,
          chainId,
          contract: '0x63D11c6d79D7FB7cf611b0B142e057a00D7D19E7',
          index: '203',
          tokenContract: '0xb97fc2e31b5c9f6901a0daded776a05409feb3df',
          totalStaked: '420090909090909091000',
          APY: '0.57',
          end: '15659300',
          endsIn: '2345',
          projectSite: '530725760680039093730'
        }
      ],
    })
  }
}

module.exports = MockApis;
