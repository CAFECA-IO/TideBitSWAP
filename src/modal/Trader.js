import SafeMath from "../Utils/safe-math";

class Trader {
  constructor({ communicator }) {
    this.syncInterval = 24 * 60 * 60 * 1000;
    this._lastSyncTime = 0;
    this._crypto = {
      cryptoToUSD: "4678.229083048072",
      symbol: "ETH",
    };
    this._fiat = {
      dollarSign: "$",
      symbol: "USD",
    };
    this._fiatToUSDs = [];
    this._communicator = communicator;
  }

  async getCryptoRate(chainId) {
    try {
      const result = await this._communicator.cryptoRate(chainId);
      console.log(`Trader getCryptoRate result`, result);
      this._crypto = {
        cryptoToUSD: result.rate,
        symbol: result.name,
      };
      console.log(`Trader getCryptoRate this._crypto`, this._crypto);
    } catch (error) {
      const result = {
        name: "ETH",
        rate: "4678.229083048072",
      };
      this._crypto = {
        cryptoToUSD: result.rate,
        symbol: result.name,
      };
      console.log(error);
    }
  }

  async getFiatToUSDs(chainId) {
    try {
      const result = await this._communicator.fiatsRate(chainId);
      console.log(`Trader getFiatToUSDs result`, result);
      this._fiatToUSDs = result.map((data) => ({
        symbol: data.name,
        fiatToUSD: data.rate,
      }));
      console.log(`Trader getFiatToUSDs this._fiatToUSDs`, this._fiatToUSDs);
    } catch (error) {
      const result = [
        {
          name: "USD",
          rate: "1",
        },
        {
          name: "CNY",
          rate: "0.15649972880130175375",
        },
        {
          name: "TWD",
          rate: "0.0361598264328331224",
        },
        {
          name: "HKD",
          rate: "0.1273549086964382571",
        },
        {
          name: "JPY",
          rate: "0.00876152594467546556",
        },
        {
          name: "EUR",
          rate: "1.12746338817573675646",
        },
      ];
      this._fiatToUSDs = result.map((data) => ({
        symbol: data.name,
        fiatToUSD: data.rate,
      }));
      console.log(error);
    }
  }

  async sync(force = false) {
    const now = Date.now();
    if (now - this.lastTimeSync > this.syncInterval || force) {
      const works = [
        this.getCryptoRate(this.chainId),
        this.getFiatToUSDs(this.chainId),
      ];
      const res = await Promise.all(works);
      return res;
    }
  }

  start(chainId) {
    console.log(`trader start chainId`, chainId);
    this.sync(true);
    this.chainId = chainId;
    this.timer = setInterval(() => {
      console.log(`trader sync`);
      console.log(`trader this.chainId`, this.chainId);

      this.sync(chainId, false);
    }, this.syncInterval);
  }

  stop() {
    if (this.timer !== null) clearInterval(this.timer);
  }

  //cryptoToCrypto: erc20 to ETH
  getPrice(cryptoToCrypto) {
    const rate =
      this._fiatToUSDs.find((fiat) => fiat.symbol === this._fiat.symbol)
        ?.fiatToUSD || "1";
    return SafeMath.div(
      SafeMath.mult(cryptoToCrypto, this._crypto.cryptoToUSD),
      rate
    );
  }
}

export default Trader;
