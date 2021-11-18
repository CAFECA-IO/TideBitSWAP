const path = require('path');

const Bot = require(path.resolve(__dirname, 'Bot.js'));
const eceth = require(path.resolve(__dirname, '../libs/eceth.js'));

// scan pairs
// scan event
// read pair data

class Scanner extends Bot {
  _router = '0x333cf7C5F2A544cc998d4801e5190BCb9E04003e';
  _pairs = [];

  async start() {
    const router = this._router;
    const factory = await this.getFactoryFromRouter({ router });
    console.log('getFactoryFromRouter', router, '->', factory);

    const pairs = await this.getPairsFromFactory({ factory });
    console.log('getPairsFromFactory', factory, '->', pairs);
  }

  async getFactoryFromRouter({ router }) {
    const rs = await eceth.getData({ contract: router, func: 'factory()', params: [], dataType: ['address'] });
    return rs[0];
  }

  async getPairsFromFactory({ factory, index }) {
    let result;
    if(index > -1) {
      result = (await eceth.getData({ contract: factory, func: 'allPairs(uint256)', params: [index], dataType: ['address'] }))[0];
    }
    else {
      result = [];
      const allPairsLength = (await eceth.getData({ contract: factory, func: 'allPairsLength()', params: [], dataType: ['uint256'] }))[0];
      for(let i = 0; i < allPairsLength; i++) {
        result.push(await this.getPairsFromFactory({ factory, index: i }));
      }
    }
    return result;
  }
}

module.exports = Scanner;