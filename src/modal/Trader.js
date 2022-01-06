import SafeMath from "../Utils/safe-math";

class Trader {
  constructor(communicator) {
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

  async getCryptoRate() {
    try {
      const result = await this._communicator.cryptoRate(this.chainId);
      console.log(`Trader getCryptoRate result`, result);
      this._crypto = {
        cryptoToUSD: result.rate,
        symbol: result.name,
      };
      console.log(`Trader getCryptoRate this._crypto`, this._crypto);
    } catch (error) {
      console.log(error);
    }
  }

  async getFiatToUSDs() {
    try {
      const result = await this._communicator.fiatsRate(this.chainId);
      console.log(`Trader getFiatToUSDs result`, result);
      this._fiatToUSDs = result.map((data) => ({
        symbol: data.name,
        fiatToUSD: data.rate,
      }));
      console.log(`Trader getFiatToUSDs this._fiatToUSDs`, this._fiatToUSDs);
    } catch (error) {
      console.log(error);
    }
  }

  async sync(force = false) {
    const now = Date.now();
    if (now - this.lastTimeSync > this.syncInterval || force) {
      const works = [this.getCryptoRate(), this.getFiatToUSDs()];
      const res = await Promise.all(works);
      return res;
    }
  }

  start(chainId) {
    this.chainId = chainId;
    console.log(`trader start this.chainId`, this.chainId);
    this.sync(true);
    this.timer = setInterval(() => {
      this.sync(false);
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
