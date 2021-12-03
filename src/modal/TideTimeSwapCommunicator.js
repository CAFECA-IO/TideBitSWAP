import { EXPIRED_ACCESS_TOKEN } from "./Codes";
import { decode } from "jsonwebtoken";
import HTTPAgent from "../Utils/httpAgent";

class TideTimeSwapCommunicator {
  constructor({ apiURL, apiKey, apiSecret }) {
    // if (!apiURL) throw new Error('Invalid apiURL');
    // if (!apiKey) throw new Error('Invalid apiKey');
    // if (!apiSecret) throw new Error('Invalid apiSecret');
    this.apiURL = apiURL;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.httpAgent = new HTTPAgent({ apiURL });

    this.token = null;
    this.tokenSecret = null;
    this.tokenRenewTimeout = null;
    return this;
  }

  // 1. Price Data
  /**
   * priceData
   * @param {*} chainId
   * @param {*} tokenContract
   * @returns [{
   *  x: number,
   *  y: Array(
   *      open *String
   *      high *String
   *      low *String
   *      close *String
   *    ),
   * }]
   */
  async priceData(chainId, tokenContract) {
    try {
      if (!chainId) return { message: "invalid chainId" };
      const res = await this._get(
        this.apiURL +
          `/chainId/${chainId}/explorer/candleStickData/${tokenContract}`
      );
      if (res.success) {
        return res.data;
      }
      return Promise.reject({ message: res.message, code: res.code });
    } catch (error) {
      return Promise.reject({ message: error });
    }
  }

  // 2. TVL History
  /**
   * tvlHistory
   * @param {*} chainId
   * @returns [{
   *  date: number,
   *  value: string,
   * }]
   */
  async tvlHistory(chainId) {
    try {
      if (!chainId) return { message: "invalid chainId" };
      const res = await this._get(
        this.apiURL + `/chainId/${chainId}/explorer/tvlHistory/`
      );
      if (res.success) {
        return res.data;
      }
      return Promise.reject({ message: res.message, code: res.code });
    } catch (error) {
      return Promise.reject({ message: error });
    }
  }

  // 3. Volume 24hr
  /**
   * volume24hr
   * @param {*} chainId
   * @returns [{
   *  date: number,
   *  value: string,
   * }]
   */
  async volume24hr(chainId) {
    try {
      if (!chainId) return { message: "invalid chainId" };
      const res = await this._get(
        this.apiURL + `/chainId/${chainId}/explorer/volume24hr/`
      );
      if (res.success) {
        return res.data;
      }
      return Promise.reject({ message: res.message, code: res.code });
    } catch (error) {
      return Promise.reject({ message: error });
    }
  }

  // 4. Search Token
  /**
   * searchToken
   * @param {*} chainId
   * @param {*} tokenContract
   * @returns {
   *  address: string,
   *  name: string,
   *  symbol: stirng,
   *  decimals: number,
   *  totalSupply: string,
   *  priceToEth: string,
   *  inPoolAmount: string,
   *  timestamp: number,
   * }
   */
  async searchToken(chainId, tokenContract) {
    try {
      if (!chainId || !tokenContract) return { message: "invalid input" };
      const res = await this._get(
        this.apiURL +
          `/chainId/${chainId}/explorer/searchToken/` +
          tokenContract
      );
      if (res.success) {
        return res.data;
      }
      return Promise.reject({ message: res.message, code: res.code });
    } catch (error) {
      return Promise.reject({ message: error });
    }
  }

  // 5. Token List
  /**
   * tokenList
   * @param {*} chainId
   * @returns [{
   *  address: string,
   *  name: string,
   *  symbol: stirng,
   *  decimals: number,
   *  totalSupply: string,
   *  priceToEth: string,
   *  inPoolAmount: string,
   *  timestamp: number,
   * }]
   */
  async tokenList(chainId) {
    try {
      const res = await this._get(
        this.apiURL + `/chainId/${chainId}/explorer/tokenList`
      );
      if (res.success) {
        return res.data;
      }
      return Promise.reject({ message: res.message, code: res.code });
    } catch (error) {
      return Promise.reject({ message: error });
    }
  }

  // 6. Pool List
  /**
   * poolList
   * @param {*} chainId
   * @returns [{
   *  poolContract: string,
   *  token0Contract: string,
   *  token1Contract: stirng,
   *  reserve0: string,
   *  reserve1: string,
   *  decimals: number,
   *  totalSupply: string,
   * }]
   */
  async poolList(chainId) {
    try {
      const res = await this._get(
        this.apiURL + `/chainId/${chainId}/explorer/poolList`
      );
      if (res.success) {
        return res.data;
      }
      return Promise.reject({ message: res.message, code: res.code });
    } catch (error) {
      return Promise.reject({ message: error });
    }
  }

  // 7. Search Pool
  /**
   * searchPool
   * @param {*} chainId
   * @param {*} token0Contract
   * @param {*} token1Contract
   * @returns {
   *  poolContract: string,
   *  token0Contract: string,
   *  token1Contract: stirng,
   *  reserve0: string,
   *  reserve1: string,
   *  decimals: number,
   *  totalSupply: string,
   * }
   */
  async searchPool(chainId, token0Contract, token1Contract) {
    try {
      if (!chainId || !token0Contract || !token1Contract)
        return { message: "invalid input" };
      const body = {
        token0Contract,
        token1Contract,
      };
      const res = await this._post(
        this.apiURL + `/chainId/${chainId}/explorer/searchPool/`,
        body
      );
      if (res.success) {
        return res.data;
      }
      return Promise.reject({ message: res.message, code: res.code });
    } catch (error) {
      return Promise.reject({ message: error });
    }
  }

  // 8. Pool Detail
  /**
   * poolDetail
   * @param {*} chainId
   * @param {*} poolContract
   * @returns {
   *  volume: object {
   *      value: string,
   *      change: string
   *  },
   *  tvl: object {
   *      value: string,
   *      change: string
   *  },
   *  irr: string,
   *  interest24: string,
   * }
   */
  async poolDetail(chainId, poolContract) {
    try {
      if (!chainId || !poolContract) return { message: "invalid input" };
      const res = await this._get(
        this.apiURL + `/chainId/${chainId}/explorer/poolDetail/` + poolContract
      );
      if (res.success) {
        return res.data;
      }
      return Promise.reject({ message: res.message, code: res.code });
    } catch (error) {
      return Promise.reject({ message: error });
    }
  }

  // 10. Token Detail
  /**
   * tokenDetail
   * @param {*} chainId
   * @param {*} tokenContract
   * @returns {
   *  price: object {
   *      value: string,
   *      change: string
   *  },
   *  volume: object {
   *      value: string,
   *      change: string
   *  }
   * }
   */
  async tokenDetail(chainId, tokenContract) {
    try {
      if (!chainId || !tokenContract) return { message: "invalid input" };
      const res = await this._get(
        this.apiURL + `/chainId/${chainId}/explorer/tokenDetail/` + tokenContract
      );
      if (res.success) {
        return res.data;
      }
      return Promise.reject({ message: res.message, code: res.code });
    } catch (error) {
      return Promise.reject({ message: error });
    }
  }

  // 9. Address Transaction History
  /**
   * tokenList
   * @param {*} chainId
   * @param {*} myAddress
   * @returns [{
   *  id: string,
   *  chainId: string,
   *  transactionHash: string,
   *  type: number,
   *  callerAddress: stirng,
   *  poolContract: stirng,
   *  token0Contract: string,
   *  token1Contract: string,
   *  token0AmountIn: string,
   *  token0AmountOut: string,
   *  token1AmountIn: string,
   *  token1AmountOut: string,
   *  timestamp: number,
   * }]
   */
  async addrTransHistory(chainId, myAddress) {
    try {
      const res = await this._get(
        this.apiURL +
          `/chainId/${chainId}/explorer/addrTransHistory/${myAddress}`
      );
      if (res.success) {
        return res.data;
      }
      return Promise.reject({ message: res.message, code: res.code });
    } catch (error) {
      return Promise.reject({ message: error });
    }
  }

  // 10. User Token Renew
  /**
   * accessTokenRenew
   * @returns {
   *  token: string,
   *  tokenSecret: string
   * }
   */
  async accessTokenRenew({ token, tokenSecret }) {
    try {
      const body = {
        token,
        tokenSecret,
      };
      const res = await this.httpAgent.post(this.apiURL + "/token/renew", body);
      if (res.success) {
        this._setInfo(res.data.token, res.data.tokenSecret);
        return res.data;
      }
      return Promise.reject({ message: res.message, code: res.code });
    } catch (error) {
      return Promise.reject({ message: error });
    }
  }

  // use for need jwt request
  async _get(url) {
    try {
      let res = await this.httpAgent.get(url);
      if (res.code === EXPIRED_ACCESS_TOKEN) {
        await this.accessTokenRenew({
          token: this.token,
          tokenSecret: this.tokenSecret,
        });
        res = await this.httpAgent.get(url);
      }
      return res;
    } catch (e) {
      if (e.code === EXPIRED_ACCESS_TOKEN) {
        try {
          await this.accessTokenRenew({
            token: this.token,
            tokenSecret: this.tokenSecret,
          });
          return this.httpAgent.get(url);
        } catch (error) {
          return Promise.reject(e);
        }
      }
      return Promise.reject(e);
    }
  }

  // use for need jwt request
  async _post(url, body) {
    try {
      let res = await this.httpAgent.post(url, body);
      if (res.code === EXPIRED_ACCESS_TOKEN) {
        await this.accessTokenRenew({
          token: this.token,
          tokenSecret: this.tokenSecret,
        });
        res = await this.httpAgent.post(url, body);
      }
      return res;
    } catch (e) {
      if (e.code === EXPIRED_ACCESS_TOKEN) {
        try {
          await this.accessTokenRenew({
            token: this.token,
            tokenSecret: this.tokenSecret,
          });
          return this.httpAgent.post(url, body);
        } catch (error) {
          return Promise.reject(e);
        }
      }
      return Promise.reject(e);
    }
  }

  // use for need jwt request
  async _delete(url, body) {
    try {
      let res = await this.httpAgent.delete(url, body);
      if (res.code === EXPIRED_ACCESS_TOKEN) {
        await this.accessTokenRenew({
          token: this.token,
          tokenSecret: this.tokenSecret,
        });
        res = await this.httpAgent.delete(url, body);
      }
      return res;
    } catch (e) {
      if (e.code === EXPIRED_ACCESS_TOKEN) {
        try {
          await this.accessTokenRenew({
            token: this.token,
            tokenSecret: this.tokenSecret,
          });
          return this.httpAgent.delete(url, body);
        } catch (error) {
          return Promise.reject(e);
        }
      }
      return Promise.reject(e);
    }
  }

  // use for need jwt request
  async _put(url, body) {
    try {
      let res = await this.httpAgent.put(url, body);
      if (res.code === EXPIRED_ACCESS_TOKEN) {
        await this.accessTokenRenew({
          token: this.token,
          tokenSecret: this.tokenSecret,
        });
        res = await this.httpAgent.put(url, body);
      }
      return res;
    } catch (e) {
      if (e.code === EXPIRED_ACCESS_TOKEN) {
        try {
          await this.accessTokenRenew({
            token: this.token,
            tokenSecret: this.tokenSecret,
          });
          return this.httpAgent.put(url, body);
        } catch (error) {
          return Promise.reject(e);
        }
      }
      return Promise.reject(e);
    }
  }

  _setInfo(token, tokenSecret) {
    this.token = token;
    this.tokenSecret = tokenSecret;
    this.httpAgent.setToken(token);
    try {
      const data = decode(token);
      const time = data.exp * 1000 - Date.now() - 5000;
      console.log("renew token timeout", time);
      if (this.tokenRenewTimeout) {
        clearTimeout(this.tokenRenewTimeout);
        this.tokenRenewTimeout = null;
      }
      this.tokenRenewTimeout = setTimeout(async () => {
        await this.accessTokenRenew({ token, tokenSecret });
      }, time);
    } catch (error) {
      this.tokenRenewTimeout = null;
    }
  }
}

export default TideTimeSwapCommunicator;
