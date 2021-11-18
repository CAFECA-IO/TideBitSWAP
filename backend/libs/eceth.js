const Url = require('url');
const Dvalue = require('dvalue');
const Ecrequest = require('ecrequest');
const BigNumber = require('bignumber.js');

const SmartContract = require('./smartContract');

class Eceth {
  static async request({ method, params } = {}, server = 'https://ropsten.tidewallet.io/') {
    const { protocol, host, path } = Url.parse(server);
    const requestData = {
      protocol,
      host,
      path,
      headers: { 'content-type': 'application/json' },
      data: {
        id: Dvalue.randomID(),
        jsonrpc: "2.0",
        method,
        params
      }
    }
console.log(params)
    const raw = await Ecrequest.post(requestData);
    const result = JSON.parse(raw.data);
    return result;
  }

  static async getData({ contract, func, params, pending, dataType }) {
    const data = SmartContract.toContractData({ func, params });
    const method = 'eth_call';
    const requestParams = {
      to: contract,
      data
    }
    const version = !!pending ? "pending" : "latest";
    const res = await this.request({ method, params: [requestParams, version] })
    const raw = SmartContract.removeStartWith(
      res.result,
      '0x'
    );
console.log(res)
    const result = this.parseData({ data: raw, dataType });
    return result;
  }

  static async parseData({ data, dataType }) {
    let result;
    try {
      const chunks = SmartContract.chunkSubstr(data, 64);
      let job;
      result = dataType.map((v, i, arr) => {
        const isArray = v.endsWith('[]');
        if(isArray) {
          const dataFrom = Number(data[i]) / 32;
          const dataLength = Number(data[dataFrom]);
          const splitChunks = new Array(dataLength).fill(0).map((vv, ii) => {
            return data[dataFrom + ii];
          });
          return splitChunks;
        }

        const type = v.toLowerCase();
        let r;
        switch(type) {
          case 'address':
            r = `0x${chunks[i].substr(-40)}`;
            break;
          case 'string':
            break;
          case 'uint256':
            r = new BigNumber(`0x${chunks[i]}`).toFixed();
            break;
          default:
            r = `0x${chunks[i]}`;
        }
        return r;
      }, [])
    }
    catch(e) {
      console.trace(e);
      result = data;
    }
    return result;
  }
}

module.exports = Eceth;