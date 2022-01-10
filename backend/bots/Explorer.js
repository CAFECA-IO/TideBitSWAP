const path = require('path');
const Ecrequest = require('ecrequest');
const { URL } = require('url');

const Bot = require(path.resolve(__dirname, 'Bot.js'));
const eceth = require(path.resolve(__dirname, '../libs/eceth.js'));
const Blockchains = require(path.resolve(__dirname, '../constants/Blockchain.js'));
const ResponseFormat = require(path.resolve(__dirname, '../libs/ResponseFormat.js'));
const TideWalletBackend = require('../constants/TideWalletBackend.js');
const SafeMath = require('../libs/SafeMath');
const Utils = require('../libs/Utils');
const DefaultIcon = require('../constants/DefaultIcon');
const Codes = require('../constants/Codes');

const TYPE_SWAP = 0;
const TEN_MIN_MS = 600000;
const ONE_DAY_SECONDS = 86400;
const HALF_YEAR_SECONDS = 15552000;
const ONE_YEAR_SECONDS = 31536000;

class Explorer extends Bot {
  constructor() {
    super();
    this.name = 'Explorer';

    this._poolList = [];
    this._tokenList = [];
    this._poolDetails = {};
    this._tokenDetails = {};
    this._overview = {};
  }

  init({ config, database, logger, i18n }) {
    return super.init({ config, database, logger, i18n })
      .then(() => {
        this.TideBitSwapDatas = this.config.TideBitSwapDatas;
        return this;
      })
      .then(async () => {
        await this._prepareDetailRecurrsive();
      })
      .then(() => this);
  }

  async start() {
    await super.start();
    this.scanToken(this.TideBitSwapDatas); // do not await
    return this;
  }

  async getContract({ params = {} }) {
    try {
      const { chainId } = params;
      const decChainId = parseInt(chainId).toString();

      const TideBitSwapData = this.TideBitSwapDatas.find((v) => v.chainId.toString() === decChainId);
      if (!TideBitSwapData) throw new Error('router not found');

      return new ResponseFormat({
        message: 'Contract',
        payload: {
          factory: TideBitSwapData.factory,
          WETH: TideBitSwapData.weth,
        }
      });
    } catch(error) {
      console.log(error);
      return new ResponseFormat({
        message: 'Contract fail',
        code: '',
      });
    }
  }

  async getTokenPriceData({ params = {} }) {
    const { chainId, tokenAddress } = params;
    const decChainId = parseInt(chainId).toString();
    const now = Math.floor(Date.now() / 1000);
    const halfYearBefore = now - HALF_YEAR_SECONDS;

    try {
      const findTokenDetailHistoryList = await this._findTokenDetailHistory(decChainId, tokenAddress.toLowerCase(), halfYearBefore, now);
      const byDay = Utils.objectTimestampGroupByDay(findTokenDetailHistoryList);
      const dates = Object.keys(byDay);
      let interpolation = Math.floor(halfYearBefore / ONE_DAY_SECONDS);
      dates.sort((a, b) => parseInt(a) - parseInt(b));
      const res = []
      dates.forEach(date => {
        while (SafeMath.gt(date, interpolation)) {
          interpolation += 1;
          if (!SafeMath.eq(date, interpolation)) {
            res.push({
              x: interpolation * ONE_DAY_SECONDS * 1000,
              y: ['', '', '', ''],
            })
          }
        }
        let open = '0';
        let highest = '0';
        let lowest = '0';
        let close = '0';
        byDay[date].sort((a,b) => (a.timestamp - b.timestamp));
        byDay[date].forEach((tokenDetailData, i) => {
          if (i === 0) {
            open = tokenDetailData.priceValue;
            highest = tokenDetailData.priceValue;
            lowest = tokenDetailData.priceValue;
          }
          close = tokenDetailData.priceValue;
          if (SafeMath.gt(tokenDetailData.priceValue, highest)) highest = tokenDetailData.priceValue;
          if (SafeMath.lt(tokenDetailData.priceValue, lowest)) lowest = tokenDetailData.priceValue;
        })
        res.push({
          x: parseInt(SafeMath.mult(date, SafeMath.mult(ONE_DAY_SECONDS, 1000))),
          y: [open, highest, lowest, close],
        });
      });

      res.sort((a,b) => {
        if (SafeMath.gt(a.date, b.date)) return 1;
        if (SafeMath.lt(a.date, b.date)) return -1;
        return 0;
      })
      
      return new ResponseFormat({
        message: 'Price Data',
        payload: res,
      });
    } catch (error) {
      console.log(error);
      return new ResponseFormat({
        message: 'Price Data fail',
        code: '',
      });
    }
  }

  async getPoolPriceData({ params = {} }) {
    const { chainId, poolContract } = params;
    const decChainId = parseInt(chainId).toString();
    const now = Math.floor(Date.now() / 1000);
    const halfYearBefore = now - HALF_YEAR_SECONDS;

    try {
      const findPool = await this._findPool(decChainId, poolContract);
      if (!findPool) throw new Error('Pool not found');

      const [token0, token1, findPoolPriceList] = await Promise.all([
        this._findToken(decChainId, findPool.token0Contract),
        this._findToken(decChainId, findPool.token1Contract),
        this._findPoolPriceList(decChainId, poolContract.toLowerCase(), halfYearBefore, now)
      ]);

      if (findPoolPriceList.length === 0) {
        const blockchain = Blockchains.findByChainId(chainId);
        const reserves = await eceth.getData({ contract: poolContract, func: 'getReserves()', params: [], dataType: ['uint112', 'uint112', 'uint32'], server: blockchain.rpcUrls[0] });
        if (!reserves[0] || !reserves[1]) throw new Error(`chainId ${decChainId} pool ${poolContract} not found.`);
        findPoolPriceList.push({
          token0Amount: reserves[0],
          token1Amount: reserves[1],
          timestamp: now,
        });
      }
      const byDay = Utils.objectTimestampGroupByDay(findPoolPriceList);
      const dates = Object.keys(byDay);
      dates.sort(((a, b) => parseInt(a) - parseInt(b)));
      const res = [];
      let interpolation = Math.floor(halfYearBefore / ONE_DAY_SECONDS);
      dates.forEach((date, di) => {
        while (SafeMath.gt(date, interpolation)) {
          interpolation += 1;
          if (!SafeMath.eq(date, interpolation)) {
            res.push({
              x: interpolation * ONE_DAY_SECONDS * 1000,
              y: ['', '', '', ''],
            })
          }
        }
        let open = '0';
        let highest = '0';
        let lowest = '0';
        let close = '0';
        byDay[date].sort((a,b) => (a.timestamp - b.timestamp));
        byDay[date].forEach((poolPriceData, i) => {
          const price = SafeMath.div(SafeMath.toCurrencyUint(poolPriceData.token0Amount, token0.decimals), SafeMath.toCurrencyUint(poolPriceData.token1Amount, token1.decimals));
          if (i === 0) {
            open = price;
            highest = price;
            lowest = price;
          }
          close = price;
          if (SafeMath.gt(price, highest)) highest = price;
          if (SafeMath.lt(price, lowest)) lowest = price;
        })
        res.push({
          x: parseInt(SafeMath.mult(date, SafeMath.mult(ONE_DAY_SECONDS, 1000))),
          y: [open, highest, lowest, close],
        });
      });

      res.sort((a,b) => {
        if (SafeMath.gt(a.date, b.date)) return 1;
        if (SafeMath.lt(a.date, b.date)) return -1;
        return 0;
      });

      while (Math.floor(now / ONE_DAY_SECONDS) > interpolation) {
        interpolation += 1;
        res.push({
          x: interpolation * ONE_DAY_SECONDS * 1000,
          y: ['', '', '', ''],
        })
      }
      
      return new ResponseFormat({
        message: 'Pool Price Data',
        payload: res,
      });
    } catch (error) {
      console.log(error);
      return new ResponseFormat({
        message: 'Pool Price Data fail',
        code: '',
      });
    }
  }

  async getPoolPriceDataReciprocal({ params = {} }) {
    const { chainId, poolContract } = params;
    const decChainId = parseInt(chainId).toString();
    const now = Math.floor(Date.now() / 1000);
    const halfYearBefore = now - HALF_YEAR_SECONDS;

    try {
      const findPool = await this._findPool(decChainId, poolContract);
      if (!findPool) throw new Error('Pool not found');

      const [token0, token1, findPoolPriceList] = await Promise.all([
        this._findToken(decChainId, findPool.token0Contract),
        this._findToken(decChainId, findPool.token1Contract),
        this._findPoolPriceList(decChainId, poolContract.toLowerCase(), halfYearBefore, now)
      ]);

      if (findPoolPriceList.length === 0) {
        const blockchain = Blockchains.findByChainId(chainId);
        const reserves = await eceth.getData({ contract: poolContract, func: 'getReserves()', params: [], dataType: ['uint112', 'uint112', 'uint32'], server: blockchain.rpcUrls[0] });
        if (!reserves[0] || !reserves[1]) throw new Error(`chainId ${decChainId} pool ${poolContract} not found.`);
        findPoolPriceList.push({
          token0Amount: reserves[0],
          token1Amount: reserves[1],
          timestamp: now,
        });
      }
      const byDay = Utils.objectTimestampGroupByDay(findPoolPriceList);
      const dates = Object.keys(byDay);
      dates.sort(((a, b) => parseInt(a) - parseInt(b)));
      const res = [];
      let interpolation = Math.floor(halfYearBefore / ONE_DAY_SECONDS);
      dates.forEach((date, di) => {
        while (SafeMath.gt(date, interpolation)) {
          interpolation += 1;
          if (!SafeMath.eq(date, interpolation)) {
            res.push({
              x: interpolation * ONE_DAY_SECONDS * 1000,
              y: ['', '', '', ''],
            })
          }
        }
        let open = '0';
        let highest = '0';
        let lowest = '0';
        let close = '0';
        byDay[date].sort((a,b) => (a.timestamp - b.timestamp));
        byDay[date].forEach((poolPriceData, i) => {
          const price = SafeMath.div(SafeMath.toCurrencyUint(poolPriceData.token1Amount, token1.decimals), SafeMath.toCurrencyUint(poolPriceData.token0Amount, token0.decimals));
          if (i === 0) {
            open = price;
            highest = price;
            lowest = price;
          }
          close = price;
          if (SafeMath.gt(price, highest)) highest = price;
          if (SafeMath.lt(price, lowest)) lowest = price;
        })
        res.push({
          x: parseInt(SafeMath.mult(date, SafeMath.mult(ONE_DAY_SECONDS, 1000))),
          y: [open, highest, lowest, close],
        });
      });

      res.sort((a,b) => {
        if (SafeMath.gt(a.date, b.date)) return 1;
        if (SafeMath.lt(a.date, b.date)) return -1;
        return 0;
      });

      while (Math.floor(now / ONE_DAY_SECONDS) > interpolation) {
        interpolation += 1;
        res.push({
          x: interpolation * ONE_DAY_SECONDS * 1000,
          y: ['', '', '', ''],
        })
      }
      
      return new ResponseFormat({
        message: 'Pool Price Data Reciprocal',
        payload: res,
      });
    } catch (error) {
      console.log(error);
      return new ResponseFormat({
        message: 'Pool Price Data Reciprocal fail',
        code: '',
      });
    }
  }

  async getTvlHistory({ params = {} }) {
    const { chainId } = params;
    const decChainId = parseInt(chainId).toString();
    const now = Math.floor(Date.now() / 1000);
    const halfYearBefore = now - HALF_YEAR_SECONDS;

    try {
      const findOverviewList = await this._findOverviewHistory(decChainId, halfYearBefore, now);
      const byDay = Utils.objectTimestampGroupByDay(findOverviewList);
      const dates = Object.keys(byDay);
      let interpolation = Math.floor(halfYearBefore / ONE_DAY_SECONDS);
      const res = []
      dates.forEach(date => {
        while (SafeMath.gt(date, interpolation)) {
          interpolation += 1;
          if (!SafeMath.eq(date, interpolation)) {
            res.push({
              date: interpolation * ONE_DAY_SECONDS * 1000,
              value: '0',
            })
          }
        }
        byDay[date].sort((a,b) => (a.timestamp - b.timestamp));
        const lastTvl = byDay[date][byDay[date].length - 1].tvlValue;
        res.push({
          date: parseInt(SafeMath.mult(date, SafeMath.mult(ONE_DAY_SECONDS, 1000))),
          value: lastTvl
        });
      });

      res.sort((a,b) => {
        if (SafeMath.gt(a.date, b.date)) return 1;
        if (SafeMath.lt(a.date, b.date)) return -1;
        return 0;
      })
      
      return new ResponseFormat({
        message: 'TVL History',
        payload: res,
      });
    } catch (error) {
      console.log(error);
      return new ResponseFormat({
        message: 'TVL History fail',
        code: '',
      });
    }
  }

  async getVolume24hr({ params = {} }) {
    const { chainId } = params;
    const decChainId = parseInt(chainId).toString();
    const now = Math.floor(Date.now() / 1000);
    const halfYearBefore = now - HALF_YEAR_SECONDS;

    try {
      const findOverviewList = await this._findOverviewHistory(decChainId, halfYearBefore, now);
      const byDay = Utils.objectTimestampGroupByDay(findOverviewList);
      const dates = Object.keys(byDay);
      let interpolation = Math.floor(halfYearBefore / ONE_DAY_SECONDS);
      dates.sort((a, b) => parseInt(a) - parseInt(b));
      const res = []
      dates.forEach(date => {
        while (SafeMath.gt(date, interpolation)) {
          interpolation += 1;
          if (!SafeMath.eq(date, interpolation)) {
            res.push({
              date: interpolation * ONE_DAY_SECONDS * 1000,
              value: '0',
            })
          }
        }
        byDay[date].sort((a, b) => a.timestamp - b.timestamp);
        let lastVolume = byDay[date][byDay[date].length - 1].volumeToday;
        if (parseInt(date) < 18988) {// 2021/12/27
          lastVolume = byDay[date][byDay[date].length - 1].volumeValue;
        }
        res.push({
          date: parseInt(SafeMath.mult(date, SafeMath.mult(ONE_DAY_SECONDS, 1000))),
          value: lastVolume,
        });
      });

      res.sort((a,b) => {
        if (SafeMath.gt(a.date, b.date)) return 1;
        if (SafeMath.lt(a.date, b.date)) return -1;
        return 0;
      })
      
      return new ResponseFormat({
        message: 'Volume 24hr',
        payload: res,
      });
    } catch (error) {
      console.log(error);
      return new ResponseFormat({
        message: 'Volume 24hr fail',
        code: '',
      });
    }
  }

  async getTokenList({ params = {} }) {
    try {
      const { chainId } = params;
      const decChainId = parseInt(chainId).toString();

      const findList = await this.database.tokenDao.listToken(decChainId);
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

  async getPoolAddressByToken(chainId, token0Contract, token1Contract) {
    const blockchain = Blockchains.findByChainId(chainId);
    const scanner = await this.getBot('Scanner');
    const TideBitSwapData = this.TideBitSwapDatas.find((v) => v.chainId.toString() === chainId.toString());
    if (!TideBitSwapData) throw new Error('router not found');

    const factory = TideBitSwapData.factory;

    const pair = {
      token0: {
        contract: token0Contract,
      },
      token1: {
        contract: token1Contract,
      },
    }
    const poolAddress = await scanner.findPairAddressFromFactory({ pair, factory , server: blockchain.rpcUrls[0] });

    return poolAddress;
  }

  async searchToken({ params = {} }) {
    try {
      const {chainId, tokenAddress} = params;
      const decChainId = parseInt(chainId).toString();

      if (!decChainId || !tokenAddress) throw new Error('Invalid input');
      const findToken = await this._findToken(decChainId, tokenAddress);
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

  async searchPool({ params = {}, body = {} }) {
    const { chainId } = params;
    const decChainId = parseInt(chainId).toString();
    const { token0Contract, token1Contract, create = false } = body;
    
    try {
      if (!token0Contract || !token1Contract) throw new Error('Invalid input');
      const findPool = await this._findPoolByToken(decChainId, token0Contract, token1Contract, create);

      return new ResponseFormat({
        message: 'Search Pool',
        payload: findPool,
      })
    } catch (error) {
      console.trace(error);
      return new ResponseFormat({
        message: 'Search Pool Fail',
        code: '',
      })
    }
  }

  async scanToken(TideBitSwapDatas) { // temp for now, will extract to scanner
    for(const tidebitSwap of TideBitSwapDatas) {
      try {
        const { chainId, router } = tidebitSwap;
        const blockchain = Blockchains.findByChainId(chainId);
  
        const factory = tidebitSwap.factory;
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
  
        const jobs = [];
        for (const tokenAddress of tokensAddr) {
          jobs.push(this._findToken(chainId, tokenAddress));
        }
        await Promise.all(jobs)
      } catch (error) {
        console.log(error);
      }
    }
  }

  async getPoolList({ params = {} }) {
    const { chainId } = params;
    const decChainId = parseInt(chainId).toString();
    const findPoolList = await this._findPoolList(decChainId);

    return new ResponseFormat({
      message: 'Pool List',
      payload: findPoolList,
    })
  }

  async getPoolDetail({ params = {} }) {
    const { chainId, poolContract } = params;
    const decChainId = parseInt(chainId).toString();
    try {
      const findDetail = this._poolDetails[decChainId][poolContract.toLowerCase()];
      return findDetail ? findDetail : new ResponseFormat({
        message: 'Pool Detail Failed',
        code: '',
      });
    } catch (error) {
      return new ResponseFormat({
        message: 'Pool Detail Failed',
        code: '',
      });
    }
  }

  async getCryptoRate() {
    const scanner = await this.getBot('Scanner');
    return new ResponseFormat({
      message: 'Crypto Currency Rate',
      payload: scanner._cryptoRate,
    });
  }

  async getFiatRate() {
    try {
      const { protocol, host } = new URL(TideWalletBackend.url);
      const requestData = {
        protocol,
        host,
        path: '/api/v1/fiats/rate',
        headers: { 'content-type': 'application/json' },
      }
      const raw = await Ecrequest.get(requestData);
      const res = JSON.parse(raw.data);
      if (res.code !== '00000000') throw new Error(res.message);
      const result = res.payload;
      result.forEach(o => delete o.currency_id);
      return new ResponseFormat({
        message: 'Fiat Rate',
        payload: result,
      });
    } catch (error) {
      console.trace(error);
      return new ResponseFormat({
        message: 'Fiat Rate Failed',
        code: '',
      });
    }
  }

  async getTokenDetail({ params = {} }) {
    const { chainId, tokenAddress } = params;
    const decChainId = parseInt(chainId).toString();

    try {
      const findDetail = this._tokenDetails[decChainId][tokenAddress.toLowerCase()];
      return findDetail ? findDetail : new ResponseFormat({
        message: 'Token Detail Failed',
        code: '',
      });
      
    } catch (error) {
      return new ResponseFormat({
        message: 'Token Detail Failed',
        code: '',
      });
    }
  }

  async getAddrTransHistory({ params = {} }) {
    const { chainId, myAddress } = params;
    const decChainId = parseInt(chainId).toString();
    
    const findTxHistories = await this._findTxsByCaller(decChainId, myAddress);
    const results = [];
    findTxHistories.forEach(txHistory => {
      let returnData = txHistory;
      if (txHistory.type === 0) {
        let changeDir = false;
        if (txHistory.token0AmountIn === '0') {
          changeDir = true;
        }
        returnData = {
          id: txHistory.id,
          chainId: txHistory.chainId,
          transactionHash: txHistory.transactionHash,
          type: txHistory.type,
          callerAddress: txHistory.callerAddress,
          poolContract: txHistory.poolContract,
          fromTokenContract: changeDir ? txHistory.token1Contract : txHistory.token0Contract,
          toTokenContract: changeDir ? txHistory.token0Contract : txHistory.token1Contract,
          amountIn: changeDir ? txHistory.token0AmountOut : txHistory.token0AmountIn,
          amountOut: changeDir ? txHistory.token1AmountIn : txHistory.token1AmountOut,
          share: txHistory.share,
          timestamp: txHistory.timestamp
        }
      }
      results.push(returnData);
    });

    results.sort((a, b) => b.timestamp - a.timestamp);

    return new ResponseFormat({
      message: 'Address Transaction History',
      payload: results,
    });
  }

  async getTokenTransHistory({ params = {} }) {
    const { chainId, tokenAddress } = params;
    const decChainId = parseInt(chainId).toString();
    const now = Math.floor(Date.now() / 1000);

    const [token0Txs, token1Txs] = await Promise.all([
      this._findTxsByToken0(decChainId, tokenAddress, null, 0, now),
      this._findTxsByToken1(decChainId, tokenAddress, null, 0, now),
    ]);
    const findTxHistories = token0Txs.concat(token1Txs);
    const results = [];
    findTxHistories.forEach(txHistory => {
      let returnData = txHistory;
      if (txHistory.type === 0) {
        let changeDir = false;
        if (txHistory.token0AmountIn === '0') {
          changeDir = true;
        }
        returnData = {
          id: txHistory.id,
          chainId: txHistory.chainId,
          transactionHash: txHistory.transactionHash,
          type: txHistory.type,
          callerAddress: txHistory.callerAddress,
          poolContract: txHistory.poolContract,
          fromTokenContract: changeDir ? txHistory.token1Contract : txHistory.token0Contract,
          toTokenContract: changeDir ? txHistory.token0Contract : txHistory.token1Contract,
          amountIn: changeDir ? txHistory.token0AmountOut : txHistory.token0AmountIn,
          amountOut: changeDir ? txHistory.token1AmountIn : txHistory.token1AmountOut,
          share: txHistory.share,
          timestamp: txHistory.timestamp
        }
      }
      results.push(returnData);
    });

    results.sort((a, b) => b.timestamp - a.timestamp);

    return new ResponseFormat({
      message: 'Token Transaction History',
      payload: results,
    });
  }

  async getPoolTransHistory({ params = {} }) {
    const { chainId, poolContract } = params;
    const decChainId = parseInt(chainId).toString();
    const now = Math.floor(Date.now() / 1000);
    
    const findTxHistories = await this._findTxsByPool(decChainId, poolContract, null, 0, now);
    const results = [];
    findTxHistories.forEach(txHistory => {
      let returnData = txHistory;
      if (txHistory.type === 0) {
        let changeDir = false;
        if (txHistory.token0AmountIn === '0') {
          changeDir = true;
        }
        returnData = {
          id: txHistory.id,
          chainId: txHistory.chainId,
          transactionHash: txHistory.transactionHash,
          type: txHistory.type,
          callerAddress: txHistory.callerAddress,
          poolContract: txHistory.poolContract,
          fromTokenContract: changeDir ? txHistory.token1Contract : txHistory.token0Contract,
          toTokenContract: changeDir ? txHistory.token0Contract : txHistory.token1Contract,
          amountIn: changeDir ? txHistory.token0AmountOut : txHistory.token0AmountIn,
          amountOut: changeDir ? txHistory.token1AmountIn : txHistory.token1AmountOut,
          share: txHistory.share,
          timestamp: txHistory.timestamp
        }
      }
      results.push(returnData);
    });

    results.sort((a, b) => b.timestamp - a.timestamp);

    return new ResponseFormat({
      message: 'Pool Transaction History',
      payload: results,
    });
  }

  async getOverview({ params = {} }) {
    const { chainId } = params;
    const decChainId = parseInt(chainId).toString();

    try {
      const findOverview = this._overview[decChainId];
      return findOverview ? findOverview : new ResponseFormat({
        message: 'Overview Failed',
        code: '',
      });
    } catch (error) {
      return  new ResponseFormat({
        message: 'Overview Failed',
        code: '',
      });
    }
  }

  async getTokenTvlHistory({ params = {} }){
    const { chainId, tokenAddress } = params;
    const decChainId = parseInt(chainId).toString();
    const now = Math.floor(Date.now() / 1000);
    const halfYearBefore = now - HALF_YEAR_SECONDS;

    try {
      const findTokenDetailHistoryList = await this.database.tokenTvlHistoryDao.listTokenTvlHistory(decChainId, tokenAddress.toLowerCase(), halfYearBefore, now);
      const byDay = Utils.objectTimestampGroupByDay(findTokenDetailHistoryList);
      const dates = Object.keys(byDay);
      let interpolation = Math.floor(halfYearBefore / ONE_DAY_SECONDS);
      dates.sort((a, b) => parseInt(a) - parseInt(b));
      const res = []
      dates.forEach(date => {
        while (SafeMath.gt(date, interpolation)) {
          interpolation += 1;
          if (!SafeMath.eq(date, interpolation)) {
            res.push({
              date: interpolation * ONE_DAY_SECONDS * 1000,
              value: '0',
            })
          }
        }
        byDay[date].sort((a,b) => (a.timestamp - b.timestamp));
        const lastTvl = byDay[date][byDay[date].length - 1].tvl;
        res.push({
          date: parseInt(SafeMath.mult(date, SafeMath.mult(ONE_DAY_SECONDS, 1000))),
          value: lastTvl !== '' ? lastTvl : '0'
        });
      });

      res.sort((a,b) => {
        if (SafeMath.gt(a.date, b.date)) return 1;
        if (SafeMath.lt(a.date, b.date)) return -1;
        return 0;
      })
      
      return new ResponseFormat({
        message: 'Token Tvl History',
        payload: res,
      });
    } catch (error) {
      console.log(error);
      return new ResponseFormat({
        message: 'Token Tvl History fail',
        code: '',
      });
    }
  }

  async getPoolTvlHistory({ params = {} }) {
    const { chainId, poolContract } = params;
    const decChainId = parseInt(chainId).toString();
    const now = Math.floor(Date.now() / 1000);
    const halfYearBefore = now - HALF_YEAR_SECONDS;

    try {
      const findPoolDetailHistoryList = await this.database.poolTvlHistoryDao.listPoolTvlHistory(decChainId, poolContract.toLowerCase(), halfYearBefore, now);
      const byDay = Utils.objectTimestampGroupByDay(findPoolDetailHistoryList);
      const dates = Object.keys(byDay);
      let interpolation = Math.floor(halfYearBefore / ONE_DAY_SECONDS);
      dates.sort((a, b) => parseInt(a) - parseInt(b));
      const res = []
      dates.forEach(date => {
        while (SafeMath.gt(date, interpolation)) {
          interpolation += 1;
          if (!SafeMath.eq(date, interpolation)) {
            res.push({
              date: interpolation * ONE_DAY_SECONDS * 1000,
              value: '0',
            })
          }
        }
        byDay[date].sort((a,b) => (a.timestamp - b.timestamp));
        const lastTvl = byDay[date][byDay[date].length - 1].tvl;
        res.push({
          date: parseInt(SafeMath.mult(date, SafeMath.mult(ONE_DAY_SECONDS, 1000))),
          value: lastTvl !== '' ? lastTvl : '0'
        });
      });

      res.sort((a,b) => {
        if (SafeMath.gt(a.date, b.date)) return 1;
        if (SafeMath.lt(a.date, b.date)) return -1;
        return 0;
      })
      
      return new ResponseFormat({
        message: 'Pool Tvl History',
        payload: res,
      });
    } catch (error) {
      console.log(error);
      return new ResponseFormat({
        message: 'Pool Tvl History fail',
        code: '',
      });
    }
  }

  async getTokenVolume24hr({ params = {} }) {
    const { chainId, tokenAddress } = params;
    const decChainId = parseInt(chainId).toString();
    const now = Math.floor(Date.now() / 1000);
    const halfYearBefore = now - HALF_YEAR_SECONDS;

    try {
      const findTokenDetailHistoryList = await this._findTokenDetailHistory(decChainId, tokenAddress, halfYearBefore, now);
      const byDay = Utils.objectTimestampGroupByDay(findTokenDetailHistoryList);
      const dates = Object.keys(byDay);
      let interpolation = Math.floor(halfYearBefore / ONE_DAY_SECONDS);
      dates.sort((a, b) => parseInt(a) - parseInt(b));
      const res = []
      dates.forEach(date => {
        while (SafeMath.gt(date, interpolation)) {
          interpolation += 1;
          if (!SafeMath.eq(date, interpolation)) {
            res.push({
              date: interpolation * ONE_DAY_SECONDS * 1000,
              value: '0',
            })
          }
        }
        byDay[date].sort((a, b) => a.timestamp - b.timestamp);
        let lastVolume = byDay[date][byDay[date].length - 1].volumeToday;
        if (parseInt(date) < 18988) {// 2021/12/27
          lastVolume = byDay[date][byDay[date].length - 1].volumeValue;
        }
        res.push({
          date: parseInt(SafeMath.mult(date, SafeMath.mult(ONE_DAY_SECONDS, 1000))),
          value: lastVolume,
        });
      });

      res.sort((a,b) => {
        if (SafeMath.gt(a.date, b.date)) return 1;
        if (SafeMath.lt(a.date, b.date)) return -1;
        return 0;
      })
      
      return new ResponseFormat({
        message: 'Token Volume 24hr',
        payload: res,
      });
    } catch (error) {
      console.log(error);
      return new ResponseFormat({
        message: 'Token Volume 24hr fail',
        code: '',
      });
    }
  }

  async getPoolVolume24hr({ params = {} }) {
    const { chainId, poolContract } = params;
    const decChainId = parseInt(chainId).toString();
    const now = Math.floor(Date.now() / 1000);
    const halfYearBefore = now - HALF_YEAR_SECONDS;

    try {
      const findPoolDetailHistoryList = await this._findPoolDetailHistory(decChainId, poolContract.toLowerCase(), halfYearBefore, now);
      const byDay = Utils.objectTimestampGroupByDay(findPoolDetailHistoryList);
      const dates = Object.keys(byDay);
      let interpolation = Math.floor(halfYearBefore / ONE_DAY_SECONDS);
      dates.sort((a, b) => parseInt(a) - parseInt(b));
      const res = []
      dates.forEach(date => {
        while (SafeMath.gt(date, interpolation)) {
          interpolation += 1;
          if (!SafeMath.eq(date, interpolation)) {
            res.push({
              date: interpolation * ONE_DAY_SECONDS * 1000,
              value: '0',
            })
          }
        }
        byDay[date].sort((a, b) => a.timestamp - b.timestamp);
        let lastVolume = byDay[date][byDay[date].length - 1].volumeToday;
        if (parseInt(date) < 18988) {// 2021/12/27
          lastVolume = byDay[date][byDay[date].length - 1].volumeValue;
        }
        res.push({
          date: parseInt(SafeMath.mult(date, SafeMath.mult(ONE_DAY_SECONDS, 1000))),
          value: lastVolume,
        });
      });

      res.sort((a,b) => {
        if (SafeMath.gt(a.date, b.date)) return 1;
        if (SafeMath.lt(a.date, b.date)) return -1;
        return 0;
      })
      
      return new ResponseFormat({
        message: 'Pool Volume 24hr',
        payload: res,
      });
    } catch (error) {
      console.log(error);
      return new ResponseFormat({
        message: 'Pool Volume 24hr fail',
        code: '',
      });
    }
  }

  async getStakeList({ params = {}, query = {} }) {
    const { chainId } = params;
    const decChainId = parseInt(chainId).toString();
    const { limit = '20', from = ''} = query;

    const TideBitStakeData = this.config.TideBitStakeDatas.find(o => o.chainId.toString() === decChainId);
    if (!TideBitStakeData) return new ResponseFormat({
      message: 'invalid input chainId',
      code: Codes.INVALID_INPUT_CHAIN_ID,
    })
    const listStake = await this._findStakeList(decChainId, TideBitStakeData.factory, from, limit);
    this.logger.debug('listStake:', listStake);
    const blockchain = Blockchains.findByChainId(parseInt(decChainId));
    const peerBlockNumber = await eceth.getBlockNumber({ server: blockchain.rpcUrls[0] });

    const jobs = listStake.map(async stake => ({
      id: stake.id,
      chainId: stake.chainId,
      contract: stake.contract,
      index: stake.factoryIndex.toString(),
      stakedToken: await this._findToken(chainId, stake.stakedToken),
      rewardToken: await this._findToken(chainId, stake.rewardToken),
      totalStaked: stake.totalStaked,
      poolLimitPerUser: stake.poolLimitPerUser,
      APY: stake.APY,
      end: stake.end,
      endsIn: SafeMath.gt(stake.end, peerBlockNumber) ? SafeMath.minus(stake.end, peerBlockNumber) : '0',
      projectSite: stake.projectSite,
      isLive: SafeMath.gt(stake.end, peerBlockNumber),
    }));
    const jobRes = await Promise.all(jobs);
    const payload = jobRes.map(res => ({
      ...res,
      stakedToken: {
        contract: res.stakedToken.contract,
        decimals: res.stakedToken.decimals,
        iconSrc: res.stakedToken.icon,
        symbol: res.stakedToken.symbol,
      },
      rewardToken: {
        contract: res.rewardToken.contract,
        decimals: res.rewardToken.decimals,
        iconSrc: res.rewardToken.icon,
        symbol: res.rewardToken.symbol,
      },
    }))
    return new ResponseFormat({
      message: 'Stake List',
      payload
    });
  }

  async calculateTokenPriceToUsd(chainId, tokenAddress, timestamp) {
    try {
      let priceToEth;
      let targetTimestamp;
      const findTokenPrice = await this._findTokenPrice(chainId, tokenAddress, timestamp);
      if(findTokenPrice) {
        priceToEth = findTokenPrice.priceToEth;
        targetTimestamp = findTokenPrice.isFindAfter ? findTokenPrice.timestamp : timestamp;
      } else {
        try {
          const findToken = await this._findToken(chainId, tokenAddress);
          priceToEth = findToken.priceToEth;
          targetTimestamp = SafeMath.gte(findToken.timestamp, timestamp) ? findToken.timestamp : timestamp;
        } catch (error) {
          console.log(error);
        }
      }
      if (!priceToEth) return {
        price: '',
        priceToEth: '',
        rate: ''
      };

      const findCryptoRateToUsd = await this._findCryptoRateToUsd(chainId, targetTimestamp);

      const rate = (findCryptoRateToUsd && findCryptoRateToUsd.rate) ? findCryptoRateToUsd.rate : '0';
      return {
        price: SafeMath.mult(SafeMath.toCurrencyUint(priceToEth, 18), rate),
        priceToEth,
        rate,
        timestamp: targetTimestamp,
      };
    } catch (error) {
      console.trace(error);
      return {
        price: '',
        priceToEth: '',
        rate: ''
      };
    }
  }

  async calculateTokenSwapVolume(chainId, tokenAddress, startTime, endTime) {
    try {
      const listToken0Txs = await this._findTxsByToken0(chainId, tokenAddress, TYPE_SWAP, startTime, endTime);
      const listToken1Txs = await this._findTxsByToken1(chainId, tokenAddress, TYPE_SWAP, startTime, endTime);
      let totalAmount = '0';
      listToken0Txs.forEach(tx => {
        totalAmount = SafeMath.plus(totalAmount, tx.token0AmountIn);
        totalAmount = SafeMath.plus(totalAmount, tx.token0AmountOut);
      })
      listToken1Txs.forEach(tx => {
        totalAmount = SafeMath.plus(totalAmount, tx.token1AmountIn);
        totalAmount = SafeMath.plus(totalAmount, tx.token1AmountOut);
      })
      return totalAmount;
    } catch (error) {
      console.log(error);
      return '0';
    }
  }

  async getPoolTvl(chainId, pool, timestamp) {
    try {
      let targetTimestamp;
      
      let findPoolPrice = await this._findPoolPriceByTime(chainId, pool.contract, timestamp);
      if (findPoolPrice) {
        targetTimestamp = findPoolPrice.isFindAfter? findPoolPrice.timestamp : timestamp;
      } else {
        const blockchain = Blockchains.findByChainId(parseInt(chainId.toString()));
        const reserves = await eceth.getData({ contract: pool.contract, func: 'getReserves()', params: [], dataType: ['uint112', 'uint112', 'uint32'], server: blockchain.rpcUrls[0] });
        findPoolPrice = {
          token0Amount: reserves[0],
          token1Amount: reserves[1],
        }
        targetTimestamp = SafeMath.gte(reserves[2], timestamp) ? reserves[2] : timestamp;
      }
      
      const tvl = {
        token0Amount: findPoolPrice.token0Amount,
        token1Amount: findPoolPrice.token1Amount,
        timestamp: targetTimestamp,
      };
      return tvl;
    } catch (error) {
      console.log(error);
      return {
        token0Amount: '0',
        token1Amount: '0',
        timestamp: 0,
      }
    }
  }

  async calculatePoolSwapVolume(chainId, poolContract, startTime, stopTime) {
    try {
      const listPoolTxs = await this._findTxsByPool(chainId, poolContract, TYPE_SWAP, startTime, stopTime);
      let token0TotalAmount = '0';
      let token1TotalAmount = '0';
      listPoolTxs.forEach(tx => {
        token0TotalAmount = SafeMath.plus(token0TotalAmount, tx.token0AmountIn);
        token0TotalAmount = SafeMath.plus(token0TotalAmount, tx.token0AmountOut);
        token1TotalAmount = SafeMath.plus(token1TotalAmount, tx.token1AmountIn);
        token1TotalAmount = SafeMath.plus(token1TotalAmount, tx.token1AmountOut);
      })
      return {
        token0Volume: token0TotalAmount,
        token1Volume: token1TotalAmount,
      }
    } catch (error) {
      console.log(error);
      return {
        token0Volume: '0',
        token1Volume: '0',
      }
    }
  }

  calculateTokenValume(tokenAmount, priceToEth) {
    return (priceToEth === '' || priceToEth === '0') ? '0' : SafeMath.mult(tokenAmount, priceToEth);
  }

  async getPoolToUsd(chainId, pool, timestamp) {
    try {
      let targetTimestamp = timestamp;
      let [token0PriceToUsd, token1PriceToUsd] = await Promise.all([
        this.calculateTokenPriceToUsd(chainId, pool.token0Contract, targetTimestamp),
        this.calculateTokenPriceToUsd(chainId, pool.token1Contract, targetTimestamp),
      ]);
  
      // 解決時間誤差
      // console.log('!!!token0PriceToUsd.timestamp', typeof token0PriceToUsd.timestamp, token0PriceToUsd.timestamp)
      // console.log('!!!token1PriceToUsd.timestamp', typeof token1PriceToUsd.timestamp, token1PriceToUsd.timestamp)
      if (token0PriceToUsd.timestamp > token1PriceToUsd.timestamp) {
        targetTimestamp = token0PriceToUsd.timestamp;
        token1PriceToUsd = await this.calculateTokenPriceToUsd(chainId, pool.token1Contract, targetTimestamp);
      } else if (token0PriceToUsd.timestamp < token1PriceToUsd.timestamp) {
        targetTimestamp = token1PriceToUsd.timestamp;
        token0PriceToUsd = await this.calculateTokenPriceToUsd(chainId, pool.token0Contract, targetTimestamp);
      }
      
      const t0p = (token0PriceToUsd.price !== '') ? token0PriceToUsd.price : '0';
      const t1p = (token1PriceToUsd.price !== '') ? token1PriceToUsd.price : '0';

      const t0e = (token0PriceToUsd.priceToEth !== '') ? token0PriceToUsd.priceToEth : '0';
      const t1e = (token1PriceToUsd.priceToEth !== '') ? token1PriceToUsd.priceToEth : '0';
  
      return {
        token0ToUsd: t0p,
        token1ToUsd: t1p,
        token0ToEth: t0e,
        token1ToEth: t1e,
        timestamp: targetTimestamp,
      }
    } catch (error) {
      console.log(error);
      return {
        token0ToUsd: '0',
        token1ToUsd: '0',
        token0ToEth: '0',
        token1ToEth: '0',
        timestamp: 0,
      }
    }
  }

  async syncPool(chainId, poolAddress) {
    try {
      const blockchain = Blockchains.findByChainId(chainId);
      const TideBitSwapData = this.TideBitSwapDatas.find((v) => v.chainId.toString() === chainId.toString());

      const [[factory], [decimals], [totalSupply], [token0Contract], [token1Contract]] = await Promise.all([
        eceth.getData({ contract: TideBitSwapData.router, func: 'factory()', params: [], dataType: ['address'], server: blockchain.rpcUrls[0] }),
        eceth.getData({ contract: poolAddress, func: 'decimals()', params: [], dataType: ['uint8'], server: blockchain.rpcUrls[0] }),
        eceth.getData({ contract: poolAddress, func: 'totalSupply()', params: [], dataType: ['uint256'], server: blockchain.rpcUrls[0] }),
        eceth.getData({ contract: poolAddress, func: 'token0()', params: [], dataType: ['address'], server: blockchain.rpcUrls[0] }),
        eceth.getData({ contract: poolAddress, func: 'token1()', params: [], dataType: ['address'], server: blockchain.rpcUrls[0] }),
      ]);
      const entity = this.database.poolDao.entity({
        chainId: chainId.toString(),
        contract: poolAddress,
        factoryContract: factory,
        factoryIndex : undefined, // temp for now
        decimals: decimals,
        totalSupply: totalSupply,
        token0Contract,
        token1Contract,
        timestamp: Math.floor(Date.now() / 1000),
      });

      await this.database.poolDao.insertPool(entity);
      // find or insert token into db
      await this._findToken(chainId, token0Contract);
      await this._findToken(chainId, token1Contract);
    } catch (error) {
      console.log(error);
    }
  }

  async _prepareDetailRecurrsive() {
    await this._prepareDetail();
    setInterval(async() => {
      await this._prepareDetail();
    }, TEN_MIN_MS);
  }

  async _prepareDetail() {
    const t1 = Date.now();
    let poolList = [];
    let tokenList = [];
    let poolDetails = {};
    let tokenDetails = {};
    let overview = {};

    for(const tidebitSwap of this.TideBitSwapDatas) {
      const { chainId } = tidebitSwap;
      if (!Object.keys(poolDetails).includes(chainId.toString())) {
        const findPoolList = await this.database.poolDao.listPool(chainId.toString());
        poolList = poolList.concat(findPoolList);
        poolDetails[chainId.toString()] = {};
      }
      if (!Object.keys(tokenDetails).includes(chainId.toString())) {
        const findTokenList = await this.database.tokenDao.listToken(chainId.toString());
        tokenList = tokenList.concat(findTokenList);
        tokenDetails[chainId.toString()] = {};
      }
    }
    // pool detail
    const pds = await Promise.all(poolList.map(pool =>
      this._getPoolDetail(pool.chainId, pool.contract)
    ));
    const timestamp = Math.floor(Date.now() / 1000);
    poolList.forEach((pool, i) => {
      poolDetails[pool.chainId][pool.contract] = pds[i];
      if (pds[i].success) {
        this._insertPoolDetail(pool.chainId, pool.contract, timestamp, pds[i].payload);
        this._insertPoolTvlHistory(pool.chainId, pool.contract, timestamp, pds[i].payload);
      }
    });
    this._poolList = poolList;
    this._poolDetails = poolDetails;

    // token detail
    const tds = await Promise.all(tokenList.map(token => 
      this._getTokenDetail(token.chainId, token.contract)
    ));

    tokenList.forEach((token, i) => {
      tokenDetails[token.chainId][token.contract] = tds[i];
      if (tds[i].success) {
        this._insertTokenDetail(token.chainId, token.contract, timestamp, tds[i].payload);
        this._insertTokenTvlHistory(token.chainId, token.contract, timestamp, tds[i].payload);
      }
    });
    this._tokenList = tokenList;
    this._tokenDetails = tokenDetails;

    // overview
    for(const tidebitSwap of this.TideBitSwapDatas) {
      const { chainId } = tidebitSwap;
      overview[chainId.toString()] = this._getOverview(chainId.toString());
      if (overview[chainId.toString()].success) {
        this._insertOverview(chainId.toString(), timestamp, overview[chainId.toString()].payload);
      }
    }

    this._overview = overview;
    console.log('prepare details used', Date.now() - t1, 'ms');
  }

  async _getPoolDetail(chainId, poolContract) {
    try {
      const decChainId = parseInt(chainId).toString();
      const now = Math.floor(Date.now() / 1000);
      const oneDayBefore = now - ONE_DAY_SECONDS;
      const twoDayBefore = oneDayBefore - ONE_DAY_SECONDS;
      const oneYearBefore = now - ONE_YEAR_SECONDS;
      const todayStart = Math.floor(now / ONE_DAY_SECONDS) * ONE_DAY_SECONDS;

      const findPool = await this._findPool(decChainId, poolContract);
      if (!findPool) throw new Error('Pool not found');
      let [tvlNow, tvlDay, tvlYear, poolSwapVolume24hr, poolSwapVolume48hr, poolSwapVolumeToday] = await Promise.all([
        this.getPoolTvl(decChainId, findPool, now),
        this._findPoolTvlHistory(decChainId, findPool.contract, oneDayBefore),
        this._findPoolTvlHistory(decChainId, findPool.contract, oneYearBefore),
        this.calculatePoolSwapVolume(decChainId, poolContract, oneDayBefore, now),
        this.calculatePoolSwapVolume(decChainId, poolContract, twoDayBefore, oneDayBefore),
        this.calculatePoolSwapVolume(decChainId, poolContract, todayStart, now),
      ]);

      if (!tvlDay || !tvlYear) { // for first time there is no data in poolTvlHistory table
        const reFindTvl = [];
        if (!tvlDay) reFindTvl.push(this.getPoolTvl(decChainId, findPool, oneDayBefore));
        if (!tvlYear) reFindTvl.push(this.getPoolTvl(decChainId, findPool, oneYearBefore));
        [tvlDay, tvlYear] = await Promise.all(reFindTvl);
      }

      const [poolPriceToUsdNow, poolPriceToUsdDay, poolPriceToUsdYear] = await Promise.all([
        this.getPoolToUsd(decChainId, findPool, now),
        this.getPoolToUsd(decChainId, findPool, oneDayBefore),
        this.getPoolToUsd(decChainId, findPool, tvlYear.timestamp),
      ])

      tvlNow.price = SafeMath.toCurrencyUint(SafeMath.plus(this.calculateTokenValume(tvlNow.token0Amount, poolPriceToUsdNow.token0ToEth), this.calculateTokenValume(tvlNow.token1Amount, poolPriceToUsdNow.token1ToEth)), 18);
      tvlDay.price = tvlDay.tvl
        ? tvlDay.tvl
        : SafeMath.toCurrencyUint(SafeMath.plus(this.calculateTokenValume(tvlDay.token0Amount, poolPriceToUsdDay.token0ToEth), this.calculateTokenValume(tvlDay.token1Amount, poolPriceToUsdDay.token1ToEth)), 18);
      tvlYear.price = tvlYear.tvl
        ? tvlYear.tvl
        : SafeMath.toCurrencyUint(SafeMath.plus(this.calculateTokenValume(tvlYear.token0Amount, poolPriceToUsdYear.token0ToEth), this.calculateTokenValume(tvlYear.token1Amount, poolPriceToUsdYear.token1ToEth)), 18);
      poolSwapVolume24hr.totalValue = SafeMath.gte(SafeMath.mult(poolPriceToUsdNow.token0ToEth, poolSwapVolume24hr.token0Volume), SafeMath.mult(poolPriceToUsdNow.token1ToEth, poolSwapVolume24hr.token1Volume))
        ? SafeMath.toCurrencyUint(SafeMath.mult(poolPriceToUsdNow.token0ToEth, poolSwapVolume24hr.token0Volume), 18)
        : SafeMath.toCurrencyUint(SafeMath.mult(poolPriceToUsdNow.token1ToEth, poolSwapVolume24hr.token1Volume), 18);
      poolSwapVolume48hr.totalValue = SafeMath.gte(SafeMath.mult(poolPriceToUsdDay.token0ToEth, poolSwapVolume48hr.token0Volume), SafeMath.mult(poolPriceToUsdDay.token1ToEth, poolSwapVolume48hr.token1Volume))
        ? SafeMath.toCurrencyUint(SafeMath.mult(poolPriceToUsdDay.token0ToEth, poolSwapVolume48hr.token0Volume), 18)
        : SafeMath.toCurrencyUint(SafeMath.mult(poolPriceToUsdDay.token1ToEth, poolSwapVolume48hr.token1Volume), 18);
      poolSwapVolumeToday.totalValue = SafeMath.gte(SafeMath.mult(poolPriceToUsdNow.token0ToEth, poolSwapVolumeToday.token0Volume), SafeMath.mult(poolPriceToUsdNow.token1ToEth, poolSwapVolumeToday.token1Volume))
        ? SafeMath.toCurrencyUint(SafeMath.mult(poolPriceToUsdNow.token0ToEth, poolSwapVolumeToday.token0Volume), 18)
        : SafeMath.toCurrencyUint(SafeMath.mult(poolPriceToUsdNow.token1ToEth, poolSwapVolumeToday.token1Volume), 18);

      let irr = '0';
      let tvlChange = '0';
      if (tvlYear.price !== '0' && tvlNow.timestamp - tvlYear.timestamp > 0) {
        tvlChange = SafeMath.div(SafeMath.minus(tvlNow.price, tvlYear.price), tvlYear.price);
        // tvlChange * (1 year time / time througnt)
        irr = SafeMath.mult(tvlChange, SafeMath.div(ONE_YEAR_SECONDS, SafeMath.minus(tvlNow.timestamp, tvlYear.timestamp)));
      }

      const vChange = (poolSwapVolume48hr.totalValue !== '0' ) ? SafeMath.div(SafeMath.minus(poolSwapVolume24hr.totalValue, poolSwapVolume48hr.totalValue), poolSwapVolume48hr.totalValue) : '0';
  
      return new ResponseFormat({
        message: 'Pool Detail',
        payload:{
          volume: {
            value: poolSwapVolume24hr.totalValue,
            value24hrBefore: poolSwapVolume48hr.totalValue,
            change: vChange.startsWith('-') ? vChange : `+${vChange}`,
            today: poolSwapVolumeToday.totalValue,
          },
          tvl: {
            value: tvlNow.price,
            value24hrBefore: tvlDay.price,
            change: tvlChange.startsWith('-') ? tvlChange : `+${tvlChange}`,
          },
          irr,
          interest24: SafeMath.div(tvlNow.price, SafeMath.toCurrencyUint(findPool.totalSupply, findPool.decimals)),
          fee24: { //++ because now swap contract doesn't take fee, after change contract must modify
            value: '0',
            value24hrBefore: '0',
            change: '0',
          },
        }
      })
    } catch (error) {
      console.log(error)
      return new ResponseFormat({
        message: 'Pool Detail Fail',
        code: '',
      })
    }
  }

  async _getTokenDetail(chainId, tokenAddress) {
    const decChainId = parseInt(chainId).toString();
    const now = Math.floor(Date.now()/1000);
    const oneDayBefore = now - ONE_DAY_SECONDS;
    const twoDayBefore = oneDayBefore - ONE_DAY_SECONDS;
    const sevenDayBefore = now - ONE_DAY_SECONDS * 7;
    const todayStart = Math.floor(now / ONE_DAY_SECONDS) * ONE_DAY_SECONDS;

    const [findToken, tokenPriceToUsdNow, tokenPriceToUsdBefore, tokenSwapVolumn24hr, tokenSwapVolumn48hr, tokenSwapVolumn7Day, tokenSwapVolumeToday, poolList, tokenTvlHistory24hr] = await Promise.all([
      this._findToken(decChainId, tokenAddress),
      this.calculateTokenPriceToUsd(decChainId, tokenAddress, now),
      this.calculateTokenPriceToUsd(decChainId, tokenAddress, oneDayBefore),
      this.calculateTokenSwapVolume(decChainId, tokenAddress, oneDayBefore, now),
      this.calculateTokenSwapVolume(decChainId, tokenAddress, twoDayBefore, oneDayBefore),
      this.calculateTokenSwapVolume(decChainId, tokenAddress, sevenDayBefore, now),
      this.calculateTokenSwapVolume(decChainId, tokenAddress, todayStart, now),
      this._findPoolListByToken(decChainId, tokenAddress),
      this._findTokenTvlHistory(decChainId, tokenAddress, oneDayBefore),
    ]);

    let tvlNow = '0';
    let tvl24hr = '0';
    const reserveIndexs = [];
    poolList.forEach(pool => {
      if (tokenAddress === pool.token0Contract) {
        tvlNow = SafeMath.plus(tvlNow, pool.reserve0);
        reserveIndexs.push(0);
      }
      if (tokenAddress === pool.token1Contract) {
        tvlNow = SafeMath.plus(tvlNow, pool.reserve1);
        reserveIndexs.push(1);
      }
    });
    tvlNow = SafeMath.toCurrencyUint(this.calculateTokenValume(tvlNow, tokenPriceToUsdNow.priceToEth), 18);

    if (tokenTvlHistory24hr) {
      tvl24hr = tokenTvlHistory24hr.tvl;
    } else {
      const tvlList24hr = await Promise.all(poolList.map(pool => this.getPoolTvl(decChainId, {contract: pool.poolContract}, oneDayBefore)));
      tvlList24hr.forEach((tvl, i) => {
        if (reserveIndexs[i] === 0) {
          tvl24hr = SafeMath.plus(tvl24hr, tvl.token0Amount);
        }
        if (reserveIndexs[i] === 1) {
          tvl24hr = SafeMath.plus(tvl24hr, tvl.token1Amount);
        }
      });
      tvl24hr = SafeMath.toCurrencyUint(this.calculateTokenValume(tvl24hr, tokenPriceToUsdBefore.priceToEth), 18);
    }

    const pChange = (tokenPriceToUsdBefore.price !== '0' && tokenPriceToUsdBefore.price !== '') ? SafeMath.div(SafeMath.minus(tokenPriceToUsdNow.price, tokenPriceToUsdBefore.price), tokenPriceToUsdBefore.price) : '0';
    const pEChange = (tokenPriceToUsdBefore.priceToEth !== '0' && tokenPriceToUsdBefore.priceToEth !== '') ? SafeMath.div(SafeMath.minus(tokenPriceToUsdNow.priceToEth, tokenPriceToUsdBefore.priceToEth), tokenPriceToUsdBefore.priceToEth) : '0';
    const s24Change = (tokenSwapVolumn24hr !== '0' ) ? SafeMath.div(SafeMath.minus(tokenSwapVolumn24hr, tokenSwapVolumn48hr), tokenSwapVolumn24hr) : '0';
    const tvlChange = (tvl24hr !== '0') ? SafeMath.div(SafeMath.minus(tvlNow, tvl24hr), tvl24hr) : '0';

    return new ResponseFormat({
      message: 'Token Detail',
      payload: {
        price: {
          value: tokenPriceToUsdNow.price,
          change: pChange.startsWith('-') ? pChange : `+${pChange}`,
        },
        priceToEth: {
          value: tokenPriceToUsdNow.priceToEth,
          change: pEChange.startsWith('-') ? pEChange : `+${pEChange}`,
        },
        volume: {
          value: this.calculateTokenValume(tokenSwapVolumn24hr, tokenPriceToUsdNow.priceToEth),
          change: s24Change.startsWith('-') ? s24Change : `+${s24Change}`,
          today: this.calculateTokenValume(tokenSwapVolumeToday, tokenPriceToUsdNow.priceToEth),
        },
        swap7Day: this.calculateTokenValume(tokenSwapVolumn7Day, tokenPriceToUsdNow.priceToEth),
        fee24: { //++ because now swap contract doesn't take fee, after change contract must modify
          value: '0',
          change: '0'
        },
        poolList,
        tvl: {
          value: tvlNow,
          change: tvlChange.startsWith('-') ? tvlChange : `+${tvlChange}`,
        }
      }
    });
  }

  _getOverview(chainId) {
    const decChainId = parseInt(chainId).toString();

    const details = this._poolDetails[decChainId];
    const keys = Object.keys(details);
    const volume = {
      value: '0',
      value24hrBefore: '0',
      change: '0',
      today: '0',
    };
    const tvl = {
      value: '0',
      value24hrBefore: '0',
      change: '0',
    }
    let fee24 = { //++ because now swap contract doesn't take fee, after change contract must modify
      value: '0',
      value24hrBefore: '0',
      change: '0',
    };

    keys.forEach(key => {
      if (details[key].success) {
        const detail = details[key].payload;
        volume.value = SafeMath.plus(volume.value, detail.volume.value);
        volume.value24hrBefore = SafeMath.plus(volume.value24hrBefore, detail.volume.value24hrBefore);
        volume.today = SafeMath.plus(volume.today, detail.volume.today);
        tvl.value = SafeMath.plus(tvl.value, detail.tvl.value);
        tvl.value24hrBefore = SafeMath.plus(tvl.value24hrBefore, detail.tvl.value24hrBefore);
        fee24.value = SafeMath.plus(fee24.value, detail.fee24.value);
        fee24.value24hrBefore = SafeMath.plus(fee24.value24hrBefore, detail.fee24.value24hrBefore);
      }
    });
    volume.change = (volume.value24hrBefore !== '' && volume.value24hrBefore !== '0') ? SafeMath.div(SafeMath.minus(volume.value, volume.value24hrBefore), volume.value24hrBefore) : '0';
    tvl.change = (tvl.value24hrBefore !== '' && tvl.value24hrBefore !== '0') ? SafeMath.div(SafeMath.minus(tvl.value, tvl.value24hrBefore), tvl.value24hrBefore) : '0';
    fee24.change = (fee24.value24hrBefore !== '' && fee24.value24hrBefore !== '0') ? SafeMath.div(SafeMath.minus(fee24.value, fee24.value24hrBefore), fee24.value24hrBefore) : '0';
    return new ResponseFormat({
      message: 'Overview',
      payload:{
        volume,
        tvl,
        fee24,
      }
    });
  }

  async _findToken(chainId, tokenAddress) {
    let findToken;
    tokenAddress = tokenAddress.toLowerCase();
    try {
      findToken = await this.database.tokenDao.findToken(chainId.toString(), tokenAddress);
    } catch (error) {
      console.trace(error);
    }

    if(!findToken) {
      const tokenDetailByContract = await this.getTokenByContract(chainId, tokenAddress);
      if (!tokenDetailByContract.name || !tokenDetailByContract.symbol
        || !tokenDetailByContract.decimals || !tokenDetailByContract.totalSupply) {
        throw new Error(`contract: ${tokenAddress} is not erc20 token`);
      }

      let priceToEth;
      try {
        const tideBitSwapData = this.TideBitSwapDatas.find((v) => v.chainId.toString() === chainId.toString())
        const { weth } = tideBitSwapData;

        if (findToken.contract.toLowerCase() === weth.toLowerCase()) {
          priceToEth = '1';
        } else {
          const findPool = await this._findPoolByToken(chainId, findToken.contract, weth);
          if (findPool) {
            priceToEth = findPool.token0Contract === weth ? SafeMath.div(findPool.reserve0, findPool.reserve1) : SafeMath.div(findPool.reserve1, findPool.reserve0);
          }
        }
      } catch (error) {
        // console.warn(error);
      }

      const icon = await this._getIconBySymbol(tokenDetailByContract.symbol);
      const tokenEnt = this.database.tokenDao.entity({
        chainId: chainId.toString(),
        contract: tokenAddress,
        name: tokenDetailByContract.name,
        symbol: tokenDetailByContract.symbol,
        decimals: tokenDetailByContract.decimals,
        totalSupply: tokenDetailByContract.totalSupply,
        priceToEth,
        timestamp: Math.floor(Date.now() / 1000),
        icon,
      });
      await this.database.tokenDao.insertToken(tokenEnt);
      findToken = await this.database.tokenDao.findToken(chainId.toString(), tokenAddress);
      if(!findToken) throw new Error('still not found token');
    }

    if (!findToken.priceToEth) {
      try {
        const tideBitSwapData = this.TideBitSwapDatas.find((v) => v.chainId.toString() === chainId.toString())
        const { weth } = tideBitSwapData;
        if (findToken.contract.toLowerCase() === weth.toLowerCase()) {
          findToken.priceToEth = '1';
          findToken.timestamp = Math.floor(Date.now() / 1000);
          await this.database.tokenDao.updateToken(findToken);
        } else {
          const findPool = await this._findPoolByToken(chainId, findToken.contract, weth);
          if (findPool) {
            const priceToEth = findPool.token0Contract === weth ? SafeMath.div(findPool.reserve0, findPool.reserve1) : SafeMath.div(findPool.reserve1, findPool.reserve0);
            findToken.priceToEth = priceToEth;
            findToken.timestamp = Math.floor(Date.now() / 1000);
            await this.database.tokenDao.updateToken(findToken);
          }
        }
      } catch (error) {
        // console.warn(error);
      }
    }

    if (!findToken.icon) {
      try {
        const icon = await this._getIconBySymbol(findToken.symbol);
        findToken.icon = icon;
        await this.database.tokenDao.updateToken(findToken);
      } catch (error) {
        // console.warn(error);
      }
    }

    return findToken;
  }

  async _findPool(chainId, contract) {
    contract = contract.toLowerCase();
    const findPool = await this.database.poolDao.findPool(chainId, contract);
    return findPool;
  }

  async _findPoolList(chainId) {
    try {
      const result = [];
      const findPoolList = await this.database.poolDao.listPool(chainId.toString());
      await Promise.all(findPoolList.map(async (pool, i) => {
        let findPoolPrice = await this._findPoolPrice(chainId, pool.contract);
        if (!findPoolPrice) {
          const blockchain = Blockchains.findByChainId(chainId);
          const reserves = await eceth.getData({ contract: pool.contract, func: 'getReserves()', params: [], dataType: ['uint112', 'uint112', 'uint32'], server: blockchain.rpcUrls[0] });
          findPoolPrice = {
            token0Amount: reserves[0],
            token1Amount: reserves[1],
          }
        }
        findPoolList[i].reserve0 = findPoolPrice.token0Amount;
        findPoolList[i].reserve1 = findPoolPrice.token1Amount;
        result.push({
          poolContract: pool.contract,
          token0Contract: pool.token0Contract,
          token1Contract: pool.token1Contract,
          reserve0: findPoolPrice.token0Amount,
          reserve1: findPoolPrice.token1Amount,
          decimals: pool.decimals,
          totalSupply: pool.totalSupply
        });
      }));
      return result;
    } catch (error) {
      console.trace(error)
    }
  }

  async _findPoolListByToken(chainId, tokenContract) {
    try {
      const result = [];
      const [token0Pools, token1Pools] = await Promise.all([
        this.database.poolDao.listPoolByToken0(chainId.toString(), tokenContract),
        this.database.poolDao.listPoolByToken1(chainId.toString(), tokenContract),
      ]);

      const findPoolList = token0Pools.concat(token1Pools);
      await Promise.all(findPoolList.map(async (pool, i) => {
        let findPoolPrice = await this._findPoolPrice(chainId, pool.contract);
        if (!findPoolPrice) {
          const blockchain = Blockchains.findByChainId(parseInt(chainId.toString()));
          const reserves = await eceth.getData({ contract: pool.contract, func: 'getReserves()', params: [], dataType: ['uint112', 'uint112', 'uint32'], server: blockchain.rpcUrls[0] });
          findPoolPrice = {
            token0Amount: reserves[0],
            token1Amount: reserves[1],
          }
        }
        findPoolList[i].reserve0 = findPoolPrice.token0Amount;
        findPoolList[i].reserve1 = findPoolPrice.token1Amount;
        result.push({
          poolContract: pool.contract,
          token0Contract: pool.token0Contract,
          token1Contract: pool.token1Contract,
          reserve0: findPoolPrice.token0Amount,
          reserve1: findPoolPrice.token1Amount,
          decimals: pool.decimals,
          totalSupply: pool.totalSupply
        });
      }));
      return result;
    } catch (error) {
      console.trace(error)
    }
  }

  async _findPoolPrice(chainId, contract) {
    const findPoolPrice = await this.database.poolPriceDao.findPoolPrice(chainId, contract);
    return findPoolPrice;
  }

  async _findPoolPriceByTime(chainId, contract, timestamp) {
    let findPoolPrice = await this.database.poolPriceDao.findPoolPriceByTimeBefore(chainId, contract, timestamp);
    if (!findPoolPrice) {
      findPoolPrice = await this.database.poolPriceDao.findPoolPriceByTimeAfter(chainId, contract, timestamp);
      if (findPoolPrice) findPoolPrice.isFindAfter = true;
    }
    return findPoolPrice;
  }

  async _findPoolByToken(chainId, token0Contract, token1Contract, create = false) {
    let result;
    token0Contract = token0Contract.toLowerCase();
    token1Contract = token1Contract.toLowerCase();

    const poolAddress = await this.getPoolAddressByToken(chainId, token0Contract, token1Contract);
    if (!poolAddress) {
      throw new Error(`pool not found by token0: ${token0Contract}, token1: ${token1Contract}`);
    }

    let findPool = await this.database.poolDao.findPool(chainId, poolAddress);
    if (!findPool) {
      if (create) {
        // pool already create but not in db
        await this.syncPool(chainId, poolAddress);
        findPool = await this.database.poolDao.findPool(chainId, poolAddress);
        if (!findPool) {
          throw new Error(`pool not found in db by token0: ${token0Contract}, token1: ${token1Contract}`);
        }
      } else {
        throw new Error(`pool not found in db by token0: ${token0Contract}, token1: ${token1Contract}`);
      }
    }

    let findPoolPrice = await this._findPoolPrice(chainId, findPool.contract);
    if (!findPoolPrice) {
      const blockchain = Blockchains.findByChainId(chainId);
      const reserves = await eceth.getData({ contract: findPool.contract, func: 'getReserves()', params: [], dataType: ['uint112', 'uint112', 'uint32'], server: blockchain.rpcUrls[0] });
      findPoolPrice = {
        token0Amount: reserves[0],
        token1Amount: reserves[1],
      }
    }

    result = {
      poolContract: findPool.contract,
      token0Contract: findPool.token0Contract,
      token1Contract: findPool.token1Contract,
      reserve0: findPoolPrice.token0Amount,
      reserve1: findPoolPrice.token1Amount,
      decimals: findPool.decimals,
      totalSupply: findPool.totalSupply
    }

    return result;
  }

  async _findTxsByCaller(chainId, myAddress) {
    myAddress = myAddress.toLowerCase();
    const findTxHistory = await this.database.transactionHistoryDao.listTxByCaller(chainId.toString(), myAddress);
    return findTxHistory;
  }

  async _findTxsByToken0(chainId, contract, type, startTime, endTime) {
    contract = contract.toLowerCase();
    const findTxs = await this.database.transactionHistoryDao.listTxByToken0(chainId.toString(), contract, type, startTime, endTime);
    return findTxs;
  }

  async _findTxsByToken1(chainId, contract, type = null, startTime, endTime) {
    contract = contract.toLowerCase();
    const findTxs = await this.database.transactionHistoryDao.listTxByToken1(chainId.toString(), contract, type, startTime, endTime);
    return findTxs;
  }

  async _findTxsByPool(chainId, contract, type = null, startTime, endTime) {
    contract = contract.toLowerCase();
    const findTxs = await this.database.transactionHistoryDao.listTxByPool(chainId.toString(), contract, type, startTime, endTime);
    return findTxs;
  }

  async _findPoolPriceList(chainId, poolContract, startTime, endTime) {
    poolContract = poolContract.toLowerCase();
    const findPoolPrices = await this.database.poolPriceDao.listPoolPriceByTime(chainId.toString(), poolContract, startTime, endTime);
    return findPoolPrices;
  }

  async _insertPoolDetail(chainId, contract, timestamp, poolDetail) {
    contract = contract.toLowerCase();
    const pdhEntity = this.database.poolDetailHistoryDao.entity({
      chainId: chainId.toString(),
      contract,
      timestamp,
      volumeValue: poolDetail.volume.value,
      volume24hrBefore: poolDetail.volume.value24hrBefore,
      volumeChange: poolDetail.volume.change,
      volumeToday: poolDetail.volume.today,
      tvlValue: poolDetail.tvl.value,
      tvl24hrBefore: poolDetail.tvl.value24hrBefore,
      tvlChange: poolDetail.tvl.change,
      irr: poolDetail.irr,
      interest24: poolDetail.interest24,
      fee24: poolDetail.fee24.value,
    });

    await this.database.poolDetailHistoryDao.insertPoolDetailHistory(pdhEntity);

    return true;
  }

  async _insertTokenDetail(chainId, contract, timestamp, tokenDetail) {
    contract = contract.toLowerCase();
    const tdhEntity = this.database.tokenDetailHistoryDao.entity({
      chainId: chainId.toString(),
      contract,
      timestamp,
      priceValue: tokenDetail.price.value,
      priceChange: tokenDetail.price.change,
      priceToEthValue: tokenDetail.priceToEth.value,
      priceToEthChange: tokenDetail.priceToEth.change,
      volumeValue: tokenDetail.volume.value,
      volumeChange: tokenDetail.volume.change,
      volumeToday: tokenDetail.volume.today,
      swap7Day: tokenDetail.swap7Day,
      fee24: tokenDetail.fee24.value,
      tvlValue: tokenDetail.tvl.value,
      tvlChange: tokenDetail.tvl.change,
    });

    await this.database.tokenDetailHistoryDao.insertTokenDetailHistory(tdhEntity);

    return true;
  }

  async _insertOverview(chainId, timestamp, overviewData) {
    const entity = this.database.overviewHistoryDao.entity({
      chainId: chainId.toString(),
      timestamp,
      volumeValue: overviewData.volume.value,
      volume24hrBefore: overviewData.volume.value24hrBefore,
      volumeChange: overviewData.volume.change,
      volumeToday: overviewData.volume.today,
      tvlValue: overviewData.tvl.value,
      tvl24hrBefore: overviewData.tvl.value,
      tvlChange: overviewData.tvl.change,
      fee24: overviewData.fee24.value,
    });

    const res = await this.database.overviewHistoryDao.insertOverviewHistory(entity);
    return res;
  }

  async _insertPoolTvlHistory(chainId, contract, timestamp, poolDetail) {
    const pthEntity = this.database.poolTvlHistoryDao.entity({
      chainId: chainId.toString(),
      contract,
      timestamp,
      tvl: poolDetail.tvl.value,
    });

    await this.database.poolTvlHistoryDao.insertPoolTvlHistory(pthEntity);

    return true;
  }

  async _insertTokenTvlHistory(chainId, contract, timestamp, tokenDetail) {
    const tthEntity = this.database.tokenTvlHistoryDao.entity({
      chainId: chainId.toString(),
      contract,
      timestamp,
      tvl: tokenDetail.tvl.value,
    });

    await this.database.tokenTvlHistoryDao.insertTokenTvlHistory(tthEntity);

    return true;
  }

  async _findTokenPrice(chainId, tokenAddress, timestamp) {
    tokenAddress = tokenAddress.toLowerCase();
    let findTokenPrice = await this.database.tokenPriceDao.findTokenPriceByTimeBefore(chainId.toString(), tokenAddress, timestamp);
    if (!findTokenPrice) {
      findTokenPrice = await this.database.tokenPriceDao.findTokenPriceByTimeBefore(chainId.toString(), tokenAddress, timestamp);
      if (findTokenPrice) findTokenPrice.isFindAfter = true;
    }
    return findTokenPrice;
  }

  async _findCryptoRateToUsd(chainId, timestamp) {
    let findCryptoRate = await this.database.cryptoRateToUsdDao.findRateByTimeBefore(chainId.toString(), timestamp);
    if (!findCryptoRate) {
      findCryptoRate = await this.database.cryptoRateToUsdDao.findRateByTimeAfter(chainId.toString(), timestamp);
    }
    return findCryptoRate;
  }

  async _findOverviewHistory(chainId, startTime, endTime) {
    const findList = this.database.overviewHistoryDao.listOverviewHistory(chainId, startTime, endTime);
    return findList;
  }

  async _findTokenDetailHistory(chainId, contract, startTime, endTime) {
    const findList = this.database.tokenDetailHistoryDao.listTokenDetailHistory(chainId, contract, startTime, endTime);
    return findList;
  }

  async _findPoolDetailHistory(chainId, contract, startTime, endTime) {
    const findList = this.database.poolDetailHistoryDao.listPoolDetailHistory(chainId, contract, startTime, endTime);
    return findList;
  }
  
  async _findPoolTvlHistory(chainId, contract, timestamp) {
    contract = contract.toLowerCase();
    let findPoolTvlHistory = await this.database.poolTvlHistoryDao.findPoolTvlHistoryByTimeBefore(chainId, contract, timestamp);
    if (!findPoolTvlHistory) {
      findPoolTvlHistory = await this.database.poolTvlHistoryDao.findPoolTvlHistoryByTimeAfter(chainId, contract, timestamp);
      if (findPoolTvlHistory) findPoolTvlHistory.isFindAfter = true;
    }

    return findPoolTvlHistory;
  }

  async _findTokenTvlHistory(chainId, contract, timestamp) {
    contract = contract.toLowerCase();
    let findTokenTvlHistory = await this.database.tokenTvlHistoryDao.findTokenTvlHistoryByTimeBefore(chainId, contract, timestamp);
    if (!findTokenTvlHistory) {
      findTokenTvlHistory = await this.database.tokenTvlHistoryDao.findTokenTvlHistoryByTimeAfter(chainId, contract, timestamp);
      if (findTokenTvlHistory) findTokenTvlHistory.isFindAfter = true;
    }

    return findTokenTvlHistory;
  }

  async _getIconBySymbol(symbol) {
    let icon = `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@9ab8d6934b83a4aa8ae5e8711609a70ca0ab1b2b/32/icon/${symbol.toLocaleLowerCase()}.png`;
    try {
      const checkIcon = await Ecrequest.get({
        protocol: 'https:',
        hostname: 'cdn.jsdelivr.net',
        port: '',
        path: `/gh/atomiclabs/cryptocurrency-icons@9ab8d6934b83a4aa8ae5e8711609a70ca0ab1b2b/32/icon/${symbol.toLocaleLowerCase()}.png`,
        timeout: 1000,
      });
      if (checkIcon.data.toString().indexOf('Couldn\'t find') !== -1) throw Error('Couldn\'t find');
    } catch (e) {
      icon = DefaultIcon.erc20;
    }
    return icon;
  }

  async _findStakeList(chainId, factoryContract, from, limit) {
    let factoryIndex = parseInt(from);
    if (!from) {
      const findLastStakeInFactory = await this.database.stakeDao.findLastStakeInFactory(chainId, factoryContract);
      factoryIndex = (findLastStakeInFactory) ? findLastStakeInFactory.factoryIndex : 0;
    }
    let findStakeList = await this.database.stakeDao.listStakeByFactoryIndex(chainId, factoryContract, factoryIndex, limit);
    return findStakeList;
  }
}

module.exports = Explorer;