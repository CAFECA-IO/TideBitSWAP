const path = require('path');
const dvalue = require('dvalue');
const smartContract = require('../libs/smartContract');
const Utils = require('../libs/Utils');

const Bot = require(path.resolve(__dirname, 'Bot.js'));
const eceth = require(path.resolve(__dirname, '../libs/eceth.js'));
const Blockchains = require(path.resolve(__dirname, '../constants/Blockchain.js'));
const ResponseFormat = require(path.resolve(__dirname, '../libs/ResponseFormat.js'));
const TideBitSwapRouters = require('../constants/SwapRouter.js');

class Explorer extends Bot {
  constructor() {
    super();
    this.name = 'Explorer';
  }

  init({ config, database, logger, i18n }) {
    return super.init({ config, database, logger, i18n })
      .then(() => this);
  }

  async start() {
    await super.start();
    this.scanToken(TideBitSwapRouters); // do not await
    return this;
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

  async scanToken(routers) { // temp for now, will extract to scanner
    const scanner = await this.getBot('Scanner');
    for(const tidebitSwap of routers) {
      const { chainId, router } = tidebitSwap;
      const blockchain = Blockchains.findByChainId(chainId);

      const factory = await scanner.getFactoryFromRouter({ router, server: blockchain.rpcUrls[0] });
      console.log('getFactoryFromRouter', router, '->', factory);
      if (!factory) throw new Error('scanToken fail');

      const allPairsLength = (await eceth.getData({ contract: factory, func: 'allPairsLength()', params: [], dataType: ['uint8'], server: blockchain.rpcUrls[0] }))[0];
      console.log('allPairsLength', allPairsLength);

      const tokensAddr = [];
      for (let i = 0; i < allPairsLength; i++) {
        const pairAddress = (await eceth.getData({ contract: factory, func: 'allPairs(uint256)', params: [i], dataType: ['address'], server: blockchain.rpcUrls[0] }))[0];

        const token0Address = (await eceth.getData({ contract: pairAddress, func: 'token0()', params: [], dataType: ['address'], server: blockchain.rpcUrls[0] }))[0];
        const token1Address = (await eceth.getData({ contract: pairAddress, func: 'token1()', params: [], dataType: ['address'], server: blockchain.rpcUrls[0] }))[0];

        if (!tokensAddr.includes(token0Address)) { tokensAddr.push(token0Address); }
        if (!tokensAddr.includes(token1Address)) { tokensAddr.push(token1Address); }
      }

      for (const tokenAddress of tokensAddr) {
        await this._findToken(chainId, tokenAddress);
      }
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
          throw new Error(`contract: ${tokenAddress} is not erc20 token`);
        }
      const tokenEnt = this.database.tokenDao.entity({
        chainId,
        contract: tokenAddress,
        name: tokenDetailByContract.name,
        symbol: tokenDetailByContract.symbol,
        decimals: tokenDetailByContract.decimals,
        totalSupply: tokenDetailByContract.totalSupply,
      });
      await this.database.tokenDao.insertToken(tokenEnt);
      findToken = await this.database.tokenDao.findToken(chainId, tokenAddress);
      if(!findToken) throw new Error('still not found token');
    }

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