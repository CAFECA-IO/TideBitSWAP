const { default: BigNumber } = require('bignumber.js');
const path = require('path');

const Bot = require(path.resolve(__dirname, 'Bot.js'));
const eceth = require(path.resolve(__dirname, '../libs/eceth.js'));

// scan pairs
// scan event
// read pair data

class Scanner extends Bot {
  _router = '0x3753A62D7654b072Aa379866391e4a10000Dcc53';
  _pairs = [];
  _tokens = [];
  _exchange = [];

  async start() {
    const router = this._router;
    const factory = await this.getFactoryFromRouter({ router });
    console.log('getFactoryFromRouter', router, '->', factory);

    const pairs = await this.getPairsFromFactory({ factory });
    console.log('getPairsFromFactory', factory);
  }

  async getFactoryFromRouter({ router }) {
    const rs = await eceth.getData({ contract: router, func: 'factory()', params: [], dataType: ['address'] });
    return rs[0];
  }

  async getPairsFromFactory({ factory, index }) {
    let result;
    try {
      if(index > -1) {
        const pairAddress = (await eceth.getData({ contract: factory, func: 'allPairs(uint256)', params: [index], dataType: ['address'] }))[0];
        console.log('getPairDetail', index, pairAddress);
        result = await this.getPairDetail({ pair: pairAddress });
      }
      else {
        const allPairsLength = (await eceth.getData({ contract: factory, func: 'allPairsLength()', params: [], dataType: ['uint8'] }))[0];
        result = await Promise.all(new Array(allPairsLength).fill(0).map((v, i) => {
          return this.getPairsFromFactory({ factory, index: i });
        }));
      }
    }
    catch(e) {
      console.trace(e);
    }
    return result;
  }

  async getPairDetail({ pair }) {
    let result;
    try {
      const decimals = (await eceth.getData({ contract: pair, func: 'decimals()', params: [], dataType: ['uint8'] }))[0];
      const totalSupply = (await eceth.getData({ contract: pair, func: 'totalSupply()', params: [], dataType: ['uint256'] }))[0];
      const token0Address = (await eceth.getData({ contract: pair, func: 'token0()', params: [], dataType: ['address'] }))[0];
      const token1Address = (await eceth.getData({ contract: pair, func: 'token1()', params: [], dataType: ['address'] }))[0];
      const reserves = await eceth.getData({ contract: pair, func: 'getReserves()', params: [], dataType: ['uint112', 'uint112', 'uint32'] });
      const token0 = await this.getErc20Detail({ erc20: token0Address });
      const token1 = await this.getErc20Detail({ erc20: token1Address });
      const token0liquidity = new BigNumber(reserves[0]).dividedBy(new BigNumber(10).pow(token0.decimals));
      const token1liquidity = new BigNumber(reserves[1]).dividedBy(new BigNumber(10).pow(token1.decimals));
      token0.liquidity = token0liquidity.toFixed();
      token1.liquidity = token1liquidity.toFixed();
      token0.price = {
        amount: token1liquidity.dividedBy(token0liquidity).toFixed(),
        unit: token1.symbol
      };
      token1.price = {
        amount: token0liquidity.dividedBy(token1liquidity).toFixed(),
        unit: token0.symbol
      };
      result = { decimals, totalSupply, token0, token1};
      console.log(result);
    }
    catch(e) {
      console.trace(e);
    }
    return result;
  }

  async getErc20Detail({ erc20 }) {
    let result;
    try {
      const name = (await eceth.getData({ contract: erc20, func: 'name()', params: [], dataType: ['string'] }))[0];
      const symbol = (await eceth.getData({ contract: erc20, func: 'symbol()', params: [], dataType: ['string'] }))[0];
      const decimals = (await eceth.getData({ contract: erc20, func: 'decimals()', params: [], dataType: ['uint8'] }))[0];
      const totalSupply = (await eceth.getData({ contract: erc20, func: 'totalSupply()', params: [], dataType: ['uint256'] }))[0];
      result = { contract: erc20, name, symbol, decimals, totalSupply };
    }
    catch(e) {
      console.trace(e);
    }
    return result;
  }
}

module.exports = Scanner;