const path = require('path');
const Ecrequest = require('ecrequest');
const { URL } = require('url');

const Bot = require(path.resolve(__dirname, 'Bot.js'));
const eceth = require(path.resolve(__dirname, '../libs/eceth.js'));
const Blockchains = require(path.resolve(__dirname, '../constants/Blockchain.js'));
const ResponseFormat = require(path.resolve(__dirname, '../libs/ResponseFormat.js'));
const TideBitSwapDatas = require('../constants/TideBitSwapData.js');
const TideWalletBackend = require('../constants/TideWalletBackend.js');
const SafeMath = require('../libs/SafeMath');


const TYPE_SWAP = 0;
const TEN_MIN_MS = 36000000;
const ONE_DAY_SECONDS = 86400;
const ONE_YEAR_SECONDS = 31536000;

class Explorer extends Bot {
  constructor() {
    super();
    this.name = 'Explorer';
  }

  init({ config, database, logger, i18n }) {
    return super.init({ config, database, logger, i18n })
      .then(async () => {
        const t1 = Date.now();
      this._poolList = [];
      
      for(const tidebitSwap of TideBitSwapDatas) {
        const { chainId } = tidebitSwap;
        const findPoolList = await this.database.poolDao.listPool(chainId.toString());
        this._poolList = this._poolList.concat(findPoolList);
      }
      this._poolDetails = {};
      const pds = await Promise.all(this._poolList.map(pool =>
        this._getPoolDetail(pool.chainId, pool.contract)
      ));

      this._poolList.forEach((pool, i) => {
        this._poolDetails[`${pool.chainId}-${pool.contract}`] = pds[i];
      });

      setInterval(async() => {
        for(const tidebitSwap of TideBitSwapDatas) {
          const { chainId } = tidebitSwap;
          const findPoolList = await this.database.poolDao.listPool(chainId.toString());
          const newPool = findPoolList.filter(pool => !this._poolList.includes(pool));
          this._poolList = this._poolList.concat(newPool);
        }
        const pds = await Promise.all(this._poolList.map(pool =>
          this._getPoolDetail(pool.chainId, pool.contract)
        ));
        
        this._poolList.forEach((pool, i) => {
          this._poolDetails[`${pool.chainId}-${pool.contract}`] = pds[i];
        });
      }, TEN_MIN_MS);
      console.log('init Explorer used', Date.now() - t1, 'ms');
      })
      .then(() => this);
  }

  async start() {
    await super.start();
    this.scanToken(TideBitSwapDatas); // do not await
    return this;
  }

  // async getCandleStickData() {
  //   return new ResponseFormat({
  //     message: 'get CandleStickData',
  //     payload: this._getDummyCandleStickData(Utils.randomCandleStickData()),
  //   });
  // }

  // async getFixedDirectionData({ params = {} }) {
  //   const { startTime = new Date(2021, 9, 15), endTime = new Date() } = params;
  //   return new ResponseFormat({
  //     message: 'get FixedDirectionData',
  //     payload: Utils.randomFixedDirectionData(startTime, endTime),
  //   })
  // }

  // async getVolume24hr({ params = {} }) {
  //   const { startTime = new Date(2021, 9, 15), endTime = new Date() } = params;
  //   return new ResponseFormat({
  //     message: 'get Volume 24hr',
  //     payload: Utils.randomData(startTime, endTime),
  //   });
  // }

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
    const TideBitSwapData = TideBitSwapDatas.find((v) => v.chainId.toString() === chainId.toString());
    if (!TideBitSwapData) throw new Error('router not found');

    const factory = await scanner.getFactoryFromRouter({ router: TideBitSwapData.router, server: blockchain.rpcUrls[0] });

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
    const { token0Contract, token1Contract } = body;
    
    try {
      if (!token0Contract || !token1Contract) throw new Error('Invalid input');
      const findPool = await this._findPoolByToken(decChainId, token0Contract, token1Contract);

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
    const scanner = await this.getBot('Scanner');
    for(const tidebitSwap of TideBitSwapDatas) {
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

      const jobs = [];
      for (const tokenAddress of tokensAddr) {
        jobs.push(this._findToken(chainId, tokenAddress));
      }
      await Promise.all(jobs)
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
    const findDetail = this._poolDetails[`${decChainId}-${poolContract.toLowerCase()}`];
    return findDetail ? findDetail : new ResponseFormat({
      message: 'Pool Detail Failed',
      code: '',
    });
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
    const now = Math.floor(Date.now()/1000);
    const oneDayBefore = now - ONE_DAY_SECONDS;
    const twoDayBefore = oneDayBefore - ONE_DAY_SECONDS;

    const [tokenPriceToUsdNow, tokenPriceToUsdBefore, tokenSwapVolumn24hr, tokenSwapVolumn48hr] = await Promise.all([
      this.calculateTokenPriceToUsd(decChainId, tokenAddress, now),
      this.calculateTokenPriceToUsd(decChainId, tokenAddress, oneDayBefore),
      this.calculateTokenSwapVolume(decChainId, tokenAddress, oneDayBefore, now),
      this.calculateTokenSwapVolume(decChainId, tokenAddress, twoDayBefore, oneDayBefore)
    ]);

    const pChange = (tokenPriceToUsdNow.price !== '' && tokenPriceToUsdBefore.price !== '') ? SafeMath.div(SafeMath.minus(tokenPriceToUsdNow.price, tokenPriceToUsdBefore.price), tokenPriceToUsdNow.price) : '0';
    const pEChange = (tokenPriceToUsdNow.priceToEth !== '' && tokenPriceToUsdBefore.priceToEth !== '') ? SafeMath.div(SafeMath.minus(tokenPriceToUsdNow.priceToEth, tokenPriceToUsdBefore.priceToEth), tokenPriceToUsdNow.priceToEth) : '0';
    const vChange = (tokenSwapVolumn24hr !== '0' ) ? SafeMath.div(SafeMath.minus(tokenSwapVolumn24hr, tokenSwapVolumn48hr), tokenSwapVolumn24hr) : '0';

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
          value: (tokenPriceToUsdNow.priceToEth !== '') ? SafeMath.mult(tokenSwapVolumn24hr, tokenPriceToUsdNow.priceToEth) : '0',
          change: vChange.startsWith('-') ? vChange : `+${vChange}`,
        }
      }
    });
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

    return new ResponseFormat({
      message: 'Address Transaction History',
      payload: results,
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
        price: SafeMath.mult(priceToEth, rate),
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
        const blockchain = Blockchains.findByChainId(chainId);
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
  
      return {
        token0ToUsd: t0p,
        token1ToUsd: t1p,
        timestamp: targetTimestamp,
      }
    } catch (error) {
      console.log(error);
      return {
        token0ToUsd: '0',
        token1ToUsd: '0',
        timestamp: 0,
      }
    }
  }

  async _getPoolDetail(chainId, poolContract) {
    try {
      const decChainId = parseInt(chainId).toString();
      const now = Math.floor(Date.now() / 1000);
      const oneDayBefore = now - ONE_DAY_SECONDS;
      const twoDayBefore = oneDayBefore - ONE_DAY_SECONDS;
      const oneYearBefore = now - ONE_YEAR_SECONDS;

      const findPool = await this._findPool(decChainId, poolContract);
      if (!findPool) throw new Error('Pool not found');
      const [findToken0, findToken1, tvlNow, tvlDay, tvlYear, poolSwapVolume24hr, poolSwapVolume48hr] = await Promise.all([
        this._findToken(decChainId, findPool.token0Contract),
        this._findToken(decChainId, findPool.token1Contract),
        this.getPoolTvl(decChainId, findPool, now),
        this.getPoolTvl(decChainId, findPool, oneDayBefore),
        this.getPoolTvl(decChainId, findPool, oneYearBefore),
        this.calculatePoolSwapVolume(decChainId, poolContract, oneDayBefore, now),
        this.calculatePoolSwapVolume(decChainId, poolContract, twoDayBefore, oneDayBefore),
      ]);

      const [poolPriceToUsdNow, poolPriceToUsdDay, poolPriceToUsdYear] = await Promise.all([
        this.getPoolToUsd(decChainId, findPool, now),
        this.getPoolToUsd(decChainId, findPool, oneDayBefore),
        this.getPoolToUsd(decChainId, findPool, tvlYear.timestamp),
      ])

      tvlNow.price = SafeMath.plus(SafeMath.mult(poolPriceToUsdNow.token0ToUsd, SafeMath.toCurrencyUint(tvlNow.token0Amount, findToken0.decimals)), SafeMath.mult(poolPriceToUsdNow.token1ToUsd, SafeMath.toCurrencyUint(tvlNow.token1Amount, findToken1.decimals)));
      tvlDay.price = SafeMath.plus(SafeMath.mult(poolPriceToUsdDay.token0ToUsd, SafeMath.toCurrencyUint(tvlDay.token0Amount, findToken0.decimals)), SafeMath.mult(poolPriceToUsdDay.token1ToUsd, SafeMath.toCurrencyUint(tvlDay.token1Amount, findToken1.decimals)));
      tvlYear.price = SafeMath.plus(SafeMath.mult(poolPriceToUsdYear.token0ToUsd, SafeMath.toCurrencyUint(tvlYear.token0Amount, findToken0.decimals)), SafeMath.mult(poolPriceToUsdYear.token1ToUsd, SafeMath.toCurrencyUint(tvlYear.token1Amount, findToken1.decimals)));
      poolSwapVolume24hr.price = SafeMath.plus(SafeMath.mult(poolPriceToUsdNow.token0ToUsd, SafeMath.toCurrencyUint(poolSwapVolume24hr.token0Volume, findToken0.decimals)), SafeMath.mult(poolPriceToUsdNow.token1ToUsd, SafeMath.toCurrencyUint(poolSwapVolume24hr.token1Volume, findToken1.decimals)));
      poolSwapVolume48hr.price = SafeMath.plus(SafeMath.mult(poolPriceToUsdDay.token0ToUsd, SafeMath.toCurrencyUint(poolSwapVolume48hr.token0Volume, findToken0.decimals)), SafeMath.mult(poolPriceToUsdDay.token1ToUsd, SafeMath.toCurrencyUint(poolSwapVolume48hr.token1Volume, findToken1.decimals)));

      let irr = '0';
      let tvlChange = '0';
      if (tvlYear.price !== '0' && tvlNow.timestamp - tvlYear.timestamp > 0) {
        tvlChange = SafeMath.div(SafeMath.minus(tvlNow.price, tvlYear.price), tvlYear.price);
        // tvlChange * (1 year time / time througnt)
        irr = SafeMath.mult(tvlChange, SafeMath.div(ONE_YEAR_SECONDS, SafeMath.minus(tvlNow.timestamp, tvlYear.timestamp)));
      }

      const vChange = (poolSwapVolume24hr.price !== '0' ) ? SafeMath.div(SafeMath.minus(poolSwapVolume24hr.price, poolSwapVolume48hr.price), poolSwapVolume24hr.price) : '0';
  
      return new ResponseFormat({
        message: 'Pool Detail',
        payload:{
          volume: {
            value: poolSwapVolume24hr.price !== '0' ? poolSwapVolume24hr.price : '',
            change: vChange.startsWith('-') ? vChange : `+${vChange}`,
          },
          tvl: {
            value: tvlNow.price !== '0' ? tvlNow.price : '',
            change: tvlChange.startsWith('-') ? tvlChange : `+${tvlChange}`,
          },
          irr,
          interest24: SafeMath.minus(tvlNow.price, tvlDay.price),
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
        const blockchain = Blockchains.findByChainId(chainId);
        const scanner = await this.getBot('Scanner');
        const router = TideBitSwapDatas.find((v) => v.chainId.toString() === chainId.toString()).router;
        const weth = await scanner.getWETHFromRouter({ router, server: blockchain.rpcUrls[0] });

        const findPool = await this._findPoolByToken(chainId, findToken.contract, weth);
        if (findPool) {
          priceToEth = findPool.token0Contract === weth ? SafeMath.div(findPool.reserve0, findPool.reserve1) : SafeMath.div(findPool.reserve1, findPool.reserve0);
        }
      } catch (error) {
        // console.warn(error);
      }

      const tokenEnt = this.database.tokenDao.entity({
        chainId: chainId.toString(),
        contract: tokenAddress,
        name: tokenDetailByContract.name,
        symbol: tokenDetailByContract.symbol,
        decimals: tokenDetailByContract.decimals,
        totalSupply: tokenDetailByContract.totalSupply,
        priceToEth,
        timestamp: Math.floor(Date.now() / 1000),
      });
      await this.database.tokenDao.insertToken(tokenEnt);
      findToken = await this.database.tokenDao.findToken(chainId.toString(), tokenAddress);
      if(!findToken) throw new Error('still not found token');
    }

    if (!findToken.priceToEth) {
      try {
        const blockchain = Blockchains.findByChainId(chainId);
        const scanner = await this.getBot('Scanner');
        const router = TideBitSwapDatas.find((v) => v.chainId.toString() === chainId.toString()).router;
        const weth = await scanner.getWETHFromRouter({ router, server: blockchain.rpcUrls[0]  });
        const findPool = await this._findPoolByToken(chainId, findToken.contract, weth);
        if (findPool) {
          const priceToEth = findPool.token0Contract === weth ? SafeMath.div(findPool.reserve0, findPool.reserve1) : SafeMath.div(findPool.reserve1, findPool.reserve0);
          findToken.priceToEth = priceToEth;
          findToken.timestamp = Math.floor(Date.now() / 1000);
          await this.database.tokenDao.updateToken(findToken);
        }
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

  async _findPoolByToken(chainId, token0Contract, token1Contract) {
    let result;
    token0Contract = token0Contract.toLowerCase();
    token1Contract = token1Contract.toLowerCase();

    const poolAddress = await this.getPoolAddressByToken(chainId, token0Contract, token1Contract);
    if (!poolAddress) {
      throw new Error(`pool not found by token0: ${token0Contract}, token1: ${token1Contract}`);
    }

    const findPool = await this.database.poolDao.findPool(chainId, poolAddress);
    if (!findPool) {
      throw new Error(`pool not found in db by token0: ${token0Contract}, token1: ${token1Contract}`);
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

  async _findTxsByToken1(chainId, contract, type, startTime, endTime) {
    contract = contract.toLowerCase();
    const findTxs = await this.database.transactionHistoryDao.listTxByToken1(chainId.toString(), contract, type, startTime, endTime);
    return findTxs;
  }

  async _findTxsByPool(chainId, contract, type, startTime, endTime) {
    contract = contract.toLowerCase();
    const findTxs = await this.database.transactionHistoryDao.listTxByPool(chainId.toString(), contract, type, startTime, endTime);
    return findTxs;
  }

  async _findPoolPrices(chainId, poolContract, timestamp) {
    poolContract = poolContract.toLowerCase();
    const findPoolPrices = await this.database.poolPriceDao.listPoolPriceByTime(chainId.toString(), poolContract, timestamp);
    return findPoolPrices;
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

}

module.exports = Explorer;