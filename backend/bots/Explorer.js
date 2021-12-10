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

      for (const tokenAddress of tokensAddr) {
        await this._findToken(chainId, tokenAddress);
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
    // try {
    //   const { chainId, poolContract,  timestamp = Math.floor(Date.now() / 1000) } = params;
    //   const decChainId = parseInt(chainId).toString();

    //   const findPoolPrices = await this._findPoolPrices(decChainId, poolContract, timestamp - 2 * 86400);
    //   if (!findPoolPrices) throw new Error('PoolPrice not found');
    //   const findPool = await this._findPool(chainId, poolContract);
    //   if (!findPool) throw new Error('Pool not found');
    //   const findToken0 = await this._findToken(decChainId, findPool.token0Contract);
    //   if (!findToken0) throw new Error('token0 not found');
    //   const findToken1 = await this._findToken(decChainId, findPool.token1Contract);
    //   if (!findToken1) throw new Error('token1 not found');

    //   let token0AmountTotal = '0';
    //   let token1AmountTotal = '0';
    //   let token0AmountTotal24hrBefore = '0';
    //   let token1AmountTotal24hrBefore = '0';
  
    //   findPoolPrices.forEach(poolPrice => {
    //     if (poolPrice.timestamp > timestamp - 86400) {
    //       token0AmountTotal = SafeMath.plus(token0AmountTotal, poolPrice.token0Amount);
    //       token1AmountTotal = SafeMath.plus(token1AmountTotal, poolPrice.token1Amount);
    //     } else {
    //       token0AmountTotal24hrBefore = SafeMath.plus(token0AmountTotal24hrBefore, poolPrice.token0Amount);
    //       token1AmountTotal24hrBefore = SafeMath.plus(token1AmountTotal24hrBefore, poolPrice.token1Amount);
    //     }
    //   });
  
  
    //   return new ResponseFormat({
    //     message: 'Pool Detail',
    //     payload:{
    //       volume: {
    //         value: `${(Math.random() * 10).toFixed(2)}m`,
    //         change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
    //           Math.random() * 1
    //         ).toFixed(2)}`,
    //       },
    //       tvl: {
    //         value: `${(Math.random() * 10).toFixed(2)}m`,
    //         change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
    //           Math.random() * 1
    //         ).toFixed(2)}`,
    //       },
    //       irr: "3",
    //       interest24: `${(Math.random() * 10).toFixed(2)}m`,
    //     }
    //   })

    // } catch (error) {
      
    // }
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
    const oneDayBefore = now - 86400;
    const twoDayBefore = oneDayBefore - 86400;

    const [tokenPriceToUsdNow, tokenPriceToUsdBefore, tokenSwapVolumn24hr, tokenSwapVolumn48hr] = await Promise.all([
      this.calculateTokenPriceToUsd(decChainId, tokenAddress, now, oneDayBefore),
      this.calculateTokenPriceToUsd(decChainId, tokenAddress, oneDayBefore, twoDayBefore),
      this.calculateTokenSwapVolumn(decChainId, tokenAddress, oneDayBefore, now),
      this.calculateTokenSwapVolumn(decChainId, tokenAddress, twoDayBefore, oneDayBefore)
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

  async calculateTokenPriceToUsd(chainId, tokenAddress, startTime, endTime) {
    try {
      let priceToEth;
      const findTokenPrice = await this._findTokenPrice(chainId, tokenAddress, startTime, endTime);
      if(findTokenPrice) {
        priceToEth = findTokenPrice.priceToEth;
      } else {
        const findToken = await this._findToken(chainId, tokenAddress);
        priceToEth = findToken.priceToEth;
      }
      if (!priceToEth) return {
        price: '',
        priceToEth: '',
        rate: ''
      };

      const findCryptoRateToUsd = await this._findCryptoRateToUsd(chainId, endTime);

      const rate = (findCryptoRateToUsd && findCryptoRateToUsd.rate) ? findCryptoRateToUsd.rate : '0';
      return {
        price: SafeMath.mult(priceToEth, rate),
        priceToEth,
        rate
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

  async calculateTokenSwapVolumn(chainId, tokenAddress, startTime, endTime) {
    try {
      const listToken0Txs = await this._findTxsByToken0(chainId, tokenAddress, TYPE_SWAP, startTime, endTime);
      const listToken1Txs = await this._findTxsByToken1(chainId, tokenAddress, TYPE_SWAP, startTime, endTime);
      let totalAmount = '0';
      listToken0Txs.forEach(tx => {
        totalAmount = SafeMath.plus(totalAmount, tx.token0AmountIn);
        totalAmount = SafeMath.plus(totalAmount, tx.token0AmountOut);
      })
      listToken1Txs.forEach(tx => {
        totalAmount = SafeMath.plus(totalAmount, tx.token0AmountIn);
        totalAmount = SafeMath.plus(totalAmount, tx.token0AmountOut);
      })
      return totalAmount;
    } catch (error) {
      console.log(error);
      return '0';
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
        console.warn(error);
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
        console.warn(error);
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

  async _findTokenPrice(chainId, tokenAddress, startTime, endTime) {
    tokenAddress = tokenAddress.toLowerCase();
    const findTokenPrice = await this.database.tokenPriceDao.findTokenPriceByTime(chainId.toString(), tokenAddress, startTime, endTime);
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