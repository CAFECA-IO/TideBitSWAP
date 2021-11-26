const path = require('path');
const dvalue = require('dvalue');
const smartContract = require('../libs/smartContract');
const Utils = require('../libs/Utils');

const Bot = require(path.resolve(__dirname, 'Bot.js'));
const eceth = require(path.resolve(__dirname, '../libs/eceth.js'));
const Blockchains = require('../constants/Blockchain')
const ResponseFormat = require(path.resolve(__dirname, '../libs/ResponseFormat'));

class Explorer extends Bot {
  _tidebitSwap = '0x3753A62D7654b072Aa379866391e4a10000Dcc53';  // TideBit Swap

  constructor() {
    super();
    this.name = 'Explorer';
  }

  init({ config, database, logger, i18n }) {
    return super.init({ config, database, logger, i18n })
      .then(() => this);
  }

  async start() {
    return super.start()
      .then(() => this);
  }

  async getCandleStickData() {
    return new ResponseFormat({
      message: 'get CandleStickData',
      payload: this._getDummyCandleStickData(Utils.randomCandleStickData()),
    });
  }

  async getFixedDirectionData({ params = {} }) {
    const { startTime = new Date(2021, 9, 15), endTime = new Date() } = params;
    return new ResponseFormat({
      message: 'get FixedDirectionData',
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

  async getTokenList() {
    try {
      const findList = await this.database.tokenDao.listToken();
      return new ResponseFormat({
        message: 'Token List',
        payload: findList,
      })
    } catch (error) {
      return new ResponseFormat({
        message: `Token List fail, ${error}`,
        code:'',
      });
    }
  }

  async getTokenByContract(chainId, tokenAddress) {
    const blockchain = Blockchains.findByChainId(chainId);
    console.log('blockchain', blockchain)

    const scanner = await this.getBot('Scanner');
    const res = await scanner.getErc20Detail({ erc20: tokenAddress, server: blockchain.rpcUrls[0] });
    return res;
  }

  async searchToken({ params = {} }) {
    try {
      const {chainId, tokenAddress} = params;
      if (!chainId || !tokenAddress) throw new Error('Invalid input');
      const findToken = await this._findToken(chainId, tokenAddress);
      return new ResponseFormat({
        message: 'Search Token',
        payload: findToken,
      })
    } catch (error) {
      return new ResponseFormat({
        message: `Search Token fail, ${error}`,
        code:'',
      });
    }
  }

  async _findToken(chainId, tokenAddress) {
    let findToken;
    tokenAddress = tokenAddress.toLowerCase();
    try {
      findToken = await this.database.tokenDao.findToken(chainId, tokenAddress);
    } catch (error) {
      console.trace(error);
    }

    if(!findToken) {
      const tokenDetailByContract = await this.getTokenByContract(chainId, tokenAddress);
      if (!tokenDetailByContract.name || !tokenDetailByContract.symbol
        || !tokenDetailByContract.decimals || !tokenDetailByContract.totalSupply) {
          throw new Error(`address: ${tokenAddress} is not erc20 token`);
        }
      const tokenEnt = this.database.tokenDao.entity({
        chainId,
        address: tokenAddress,
        name: tokenDetailByContract.name,
        symbol: tokenDetailByContract.symbol,
        decimals: tokenDetailByContract.decimals,
        totalSupply: tokenDetailByContract.totalSupply,
      });
      await this.database.tokenDao.insertToken(tokenEnt);
      findToken = await this.database.tokenDao.findToken(chainId, tokenAddress);
      if(!findToken) throw new Error('still not found token');
    }

    console.log('_findToken', findToken);
    return findToken;
  }

  _getDummyCandleStickData(data) {
    return {
      series: [
        {
          data: data ? data : [],
        },
      ],
      options: {
        chart: {
          type: "candlestick",
          height: 350,
          toolbar: {
            show: false,
          },
        },
        xaxis: {
          type: "datetime",
        },
        yaxis: {
          tooltip: {
            enabled: true,
          },
        },
      },
    };
  }
}

module.exports = Explorer;