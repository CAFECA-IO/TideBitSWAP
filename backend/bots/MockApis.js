const path = require('path');
const dvalue = require('dvalue');
const smartContract = require('../libs/smartContract');
const Utils = require('../libs/Utils');

const Bot = require(path.resolve(__dirname, 'Bot.js'));
const eceth = require(path.resolve(__dirname, '../libs/eceth.js'));
const Blockchains = require(path.resolve(__dirname, '../constants/Blockchain.js'));
const ResponseFormat = require(path.resolve(__dirname, '../libs/ResponseFormat.js'));
const TideBitSwapRouters = require('../constants/SwapRouter.js');

class MockApis extends Bot {
  constructor() {
    super();
    this.name = 'MockApis';
  }

  init({ config, database, logger, i18n }) {
    return super.init({ config, database, logger, i18n })
      .then(() => this);
  }

  async start() {
    await super.start();
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

  async getPoolList({ params = {} }) {
      return new ResponseFormat({
        message: 'Pool List',
        payload: [
          {
            poolContract: '0x63D11c6d79D7FB7cf611b0B142e057a00D7D19E7',
            token0Contract: '0x786c7cf5d05d8f7792180c1f40e7f79aa10300f6',
            token1Contract: '0xb97fc2e31b5c9f6901a0daded776a05409feb3df',
            reserve0: '420090909090909091000',
            reserve1: '437476317655020223996',
            volume: {
              value: `${(Math.random() * 10).toFixed(2)}m`,
              change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
                Math.random() * 1
              ).toFixed(2)}`,
            },
            tvl: {
              value: `${(Math.random() * 10).toFixed(2)}m`,
              change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
                Math.random() * 1
              ).toFixed(2)}`,
            },
            irr: "3",
            interest24: `${(Math.random() * 10).toFixed(2)}m`,
          }
        ],
      })
  }

  async searchPool({ params = {} }) {
    return new ResponseFormat({
      message: 'Search Pool',
      payload:{
        poolContract: '0x63D11c6d79D7FB7cf611b0B142e057a00D7D19E7',
        token0Contract: '0x786c7cf5d05d8f7792180c1f40e7f79aa10300f6',
        token1Contract: '0xb97fc2e31b5c9f6901a0daded776a05409feb3df',
        reserve0: '420090909090909091000',
        reserve1: '437476317655020223996',
        volume: {
          value: `${(Math.random() * 10).toFixed(2)}m`,
          change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
            Math.random() * 1
          ).toFixed(2)}`,
        },
        tvl: {
          value: `${(Math.random() * 10).toFixed(2)}m`,
          change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
            Math.random() * 1
          ).toFixed(2)}`,
        },
        irr: "3",
        interest24: `${(Math.random() * 10).toFixed(2)}m`,
      }
    })
  }

  async getPoolDetail({ params = {} }) {
    return new ResponseFormat({
      message: 'Pool Detail',
      payload:{
        poolContract: '0x63D11c6d79D7FB7cf611b0B142e057a00D7D19E7',
        token0Contract: '0x786c7cf5d05d8f7792180c1f40e7f79aa10300f6',
        token1Contract: '0xb97fc2e31b5c9f6901a0daded776a05409feb3df',
        reserve0: '420090909090909091000',
        reserve1: '437476317655020223996',
        volume: {
          value: `${(Math.random() * 10).toFixed(2)}m`,
          change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
            Math.random() * 1
          ).toFixed(2)}`,
        },
        tvl: {
          value: `${(Math.random() * 10).toFixed(2)}m`,
          change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
            Math.random() * 1
          ).toFixed(2)}`,
        },
        irr: "3",
        interest24: `${(Math.random() * 10).toFixed(2)}m`,
      }
    })
  }

  async getAddrTransHistory({ params = {} }) {
    return new ResponseFormat({
      message: 'Address Transaction History',
      payload: [
        {
          id: 1,
          transactionHash: '0x8d5e3f8cd3ce1b24394ad2682448fc5abb476df2382ecb972690d140efb50280',
          type: 0,  //[swap, add, remove]
          from: '0x1270a0aad453a315c5ab99397d88121c34453eb4',
          token0Contract: '0x786c7cf5d05d8f7792180c1f40e7f79aa10300f6',
          token1Contract: '0xb97fc2e31b5c9f6901a0daded776a05409feb3df',
          token0AmountIn: '10000000000000000000',
          token0AmountOut: '0',
          token1AmountIn: '0',
          token1AmountOut: '10635785359615621360',
          timestamp: '1638176626'
        }
      ]
    })
  }
}

module.exports = MockApis;