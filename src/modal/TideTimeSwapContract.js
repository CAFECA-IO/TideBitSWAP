import Lunar from "@cafeca/lunar";
import imTokenImg from "../resources/imToken.png";
import keccak256 from "keccak256";
import SafeMath from "../Utils/safe-math";
import {
  dateFormatter,
  hexToAscii,
  randomCandleStickData,
  randomID,
  sliceData,
} from "../Utils/utils";
import erc20 from "../resources/erc20.png";
import {
  BinanceSwapRouter,
  TideBitSwapRouter,
  transactionType,
} from "../constant/constant";
import { eth_call } from "../Utils/ethereum";
// import TideTimeSwapCommunicator from "./TideTimeSwapCommunicator";
const { Subject } = require("rxjs");

class TideTimeSwapContract {
  constructor(network, communicator) {
    this.setMessenger();
    this.lastTimeSync = 0;
    this.syncInterval = 1 * 30 * 1000;
    this.lunar = new Lunar();
    // this.api = {
    //   apiURL: "",
    //   apiKey: "",
    //   apiSecret: "",
    // };
    this.communicator = communicator;
    this.network = network;
    const contract = this.findContractByNetwork(network);
    this.routerContract = contract;
    this.poolList = [];
    this.assetList = [];
    this.histories = [];
    this.walletList = this.lunar.env.wallets.map((name) => {
      switch (name) {
        case "Metamask":
          return {
            src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/440px-MetaMask_Fox.svg.png",
            name: "MetaMask",
          };
        case "imToken":
          return {
            src: imTokenImg,
            name: "imToken",
          };
        case "TideWallet":
          return {
            src: imTokenImg,
            name: "TideWallet",
          };
        default:
          return [];
      }
    });
  }
  get messenger() {
    return this._messenger;
  }

  setMessenger() {
    if (!this._messenger) this._messenger = new Subject();
  }

  /**
   * @param {Array} walletList
   */
  set walletList(walletList) {
    this._walletList = walletList;
  }
  get walletList() {
    return this._walletList;
  }
  /**
   * @param {string | hex} contract
   */
  set routerContract(contract) {
    this._routerContract = contract;
  }
  get routerContract() {
    return this._routerContract;
  }
  /**
   * @param {Object} network
   */
  set network(network) {
    this._network = network;
  }
  get network() {
    return this._network;
  }

  /**
   * @param {Object} {
   * contract: string,
   * balanceOf: string
   * }
   */
  set connectedAccount(account) {
    this._connectedAccount = account;
  }
  get connectedAccount() {
    return this._connectedAccount;
  }

  /**
   * @param {Object} nativeCurrency
   */
  set nativeCurrency(nativeCurrency) {
    this._nativeCurrency = nativeCurrency;
  }
  get nativeCurrency() {
    return this._nativeCurrency;
  }

  /**
   * @param {Boolean} isConnected
   */
  set isConnected(isConnected) {
    this._isConnected = isConnected;
  }
  get isConnected() {
    return this._isConnected;
  }

  /**
   * @param {String} factoryContract
   */
  set factoryContract(factoryContract) {
    this._factoryContract = factoryContract;
  }

  /**
   * @param {number} pairLength
   */
  set pairLength(pairLength) {
    this._pairLength = pairLength;
  }
  get pairLength() {
    return this._pairLength;
  }
  get factoryContract() {
    return this._factoryContract;
  }
  findContractByNetwork(network) {
    let contract;
    switch (network.key) {
      case "EthereumTestnet":
        contract = TideBitSwapRouter;
        break;
      case "BSCTestnet":
        contract = BinanceSwapRouter;
        break;
      default:
        contract = TideBitSwapRouter;
        break;
    }
    return contract;
  }
  async getData(funcName, data, contract) {
    const funcNameHex = `0x${keccak256(funcName).toString("hex").slice(0, 8)}`;
    try {
      const result = await this.lunar.getData({
        contract,
        data: !!data ? `${funcNameHex + data}` : `${funcNameHex}`,
      });
      return result;
    } catch (error) {
      console.log(`GOT ERROR! ${funcName} ${funcNameHex}`);
      try {
        const result = await eth_call(funcNameHex, data, contract);
        return result;
      } catch (error) {
        console.log(`${funcName} error`, error);
        throw error;
      }
    }
  }
  async getNativeCurrency() {
    if (!this.nativeCurrency?.contract) {
      const contract = await this.getData(`WETH()`, null, this.routerContract);
      this.nativeCurrency = {
        contract: `0x${contract.slice(26, 66)}`,
        decimals: this.network.nativeCurrency.decimals,
        symbol: this.network.nativeCurrency.symbol,
      };
    }
    if (this.isConnected && this.connectedAccount) {
      const balanceOf = await this.getBalance({
        contract: this.nativeCurrency?.contract,
        address: this.connectedAccount?.contract,
      });
      this.nativeCurrency = {
        ...this.nativeCurrency,
        balanceOf,
      };
    } else {
      this.nativeCurrency = {
        ...this.nativeCurrency,
        balanceOf: 0,
      };
    }
    console.log(`this.getNativeCurrency`, this.nativeCurrency);
    const msg = {
      evt: `UpdateNativeCurrency`,
      data: this.nativeCurrency,
    };

    this.messenger.next(msg);
  }

  async getFactoryContract() {
    const contract = await this.getData(`factory()`, null, this.routerContract);
    this.factoryContract = `0x${contract.slice(26, 66)}`;
    console.log(`this.factoryContract`, this.factoryContract);
  }

  async switchNetwork(network) {
    this.isConnected = false;
    try {
      await this.lunar.switchBlockchain({
        blockchain: network,
      });
      this.isConnected = true;
      const contract = this.findContractByNetwork(network);
      this.routerContract = contract;
      this.factoryContract = "";
      this.nativeCurrency = null;
      this.network = network;
      this.poolList = [];
      this.assetList = [];
    } catch (error) {}
  }
  // calculateTokenBalanceOfPools(token) {
  //   const balanceInPools = token.pools.reduce((acc, curr) => {
  //     const balance =
  //       +curr.share > 0 ? SafeMath.mult(curr.share, token.totalSupply) : "0";
  //     return SafeMath.plus(acc, balance);
  //   }, "0");
  //   return balanceInPools;
  // }

  async disconnect() {
    this.connectedAccount = null;
    const accMsg = {
      evt: `UpdateConnectedAccount`,
      data: this.connectedAccount,
    };
    this.messenger.next(accMsg);

    this.isConnected = false;
    const msg = {
      evt: `UpdateConnectedStatus`,
      data: this.isConnected,
    };
    this.messenger.next(msg);

    try {
      await this.lunar.disconnect();
    } catch (error) {
      console.log(`disconnect`, error);
      throw error;
    }
    await this.getNativeCurrency();
    await this.getSupportedTokens();
    await this.getAddrHistory();
    await this.getSupportedPools();
  }

  async connect(appName) {
    let result;
    try {
      switch (appName) {
        case "MetaMask":
          result = await this.lunar.connect({
            wallet: Lunar.Wallets.Metamask,
            blockchain: this.network,
          });
          break;
        case "imToken":
          result = await this.lunar.connect({
            wallet: Lunar.Wallets[appName],
            blockchain: this.network,
          });
          break;
        default:
          break;
      }
      this.isConnected = !!result;
      const msg = {
        evt: `UpdateConnectedStatus`,
        data: this.isConnected,
      };

      this.messenger.next(msg);

      this.connectedAccount = {
        contract: this.lunar.address,
        balanceOf: await this.getBalance({
          address: this.lunar.address,
        }),
      };
      const accMsg = {
        evt: `UpdateConnectedAccount`,
        data: this.connectedAccount,
      };

      this.messenger.next(accMsg);
      console.log(`connect connectedAccount`, this.connectedAccount);

      await this.getNativeCurrency();
      await this.getSupportedTokens();
      await this.getAddrHistory();
      await this.getSupportedPools();

      return {
        connectedAccount: this.connectedAccount,
      };
    } catch (error) {
      console.log(`connect in TideTimeSwapContract`, error);
      throw error;
    }
  }

  async getPoolContractByTokens(token0Contract, token1Contract) {
    console.log(`getPoolContractByTokens token0Contract`, token0Contract);
    console.log(`getPoolContractByTokens token1Contract`, token1Contract);
    const token0ContractData = token0Contract
      .replace("0x", "")
      .padStart(64, "0");
    const token1ContractData = token1Contract
      .replace("0x", "")
      .padStart(64, "0");
    if (!this.factoryContract) {
      await this.getFactoryContract();
    }
    const result = await this.getData(
      `getPair(address,address)`,
      token0ContractData + token1ContractData,
      this.factoryContract
    );
    console.log(`getPoolContractByTokens result`, `0x${result.slice(26, 66)}`);
    return `0x${result.slice(26, 66)}`;
  }

  async getPoolContractByIndex(index) {
    const indexData = index.toString(16).padStart(64, "0");
    if (!this.factoryContract) {
      this.getFactoryContract();
    }
    const result = await this.getData(
      `allPairs(uint256)`,
      indexData,
      this.factoryContract
    );
    return `0x${result.slice(26, 66)}`;
  }
  async getPoolTokenContract(index, poolContract) {
    const result = await this.getData(`token${index}()`, null, poolContract);
    const token = `0x${result.slice(26, 66)}`;
    return token;
  }
  async getSelectedPool(active, passive) {
    if (!active || !passive) return;
    if (!this.nativeCurrency?.contract) {
      await this.getNativeCurrency();
    }
    let _activeContract =
      active.contract === this.nativeCurrency.contract
        ? "0x0000000000000000000000000000000000000000"
        : active.contract;
    let _passiveContract =
      passive.contract === this.nativeCurrency.contract
        ? "0x0000000000000000000000000000000000000000"
        : passive.contract;
    const index = this.poolList.findIndex(
      (pool) =>
        (_activeContract === pool.token0.contract ||
          _activeContract === pool.token1.contract) &&
        (_passiveContract === pool.token0.contract ||
          _passiveContract === pool.token1.contract)
    );
    console.log(`getSelectedPool findIndex`, index);
    if (index === -1) {
      const poolContract = await this.getPoolContractByTokens(
        _activeContract,
        _passiveContract
      );
      console.log(`poolContract `, poolContract);
      if (SafeMath.gt(parseInt(poolContract, 16), "0")) {
        // requestCounts: 1
        const token0Contract = await this.getPoolTokenContract(0, poolContract);
        // requestCounts: 1
        const token1Contract = await this.getPoolTokenContract(1, poolContract);
        const detail = await this.getPoolDetail(poolContract);
        const pool = await this.getPoolByContract({
          poolContract,
          token0Contract,
          token1Contract,
        });
        return { ...pool, ...detail };
      } else return null;
    }
    console.log(`this.poolList[index] `, this.poolList[index]);

    return this.poolList[index];
  }
  async getBalance({ contract, address }) {
    let balanceOf;
    try {
      balanceOf = await this.lunar.getBalance({
        contract: contract,
        address: address,
      });
    } catch (error) {
      console.log(`getBalance error`, error);
      const data = address.replace("0x", "").padStart(64, "0");
      const result = await this.getData(`balanceOf(address)`, data, contract);
      balanceOf = parseInt(result, 16).toString();
    }
    return balanceOf;
  }

  async getTokenDetail(token) {
    let detail;
    try {
      detail = await this.communicator.tokenDetail(
        this.network.chainId,
        token.contract
      );
    } catch (error) {
      console.log(`getTokenDetail error`, error);
    }

    if (!detail)
      detail = {
        priceToEth: {
          value: `${Math.random() * 10000000}`,
          change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
            Math.random() * 1
          ).toFixed(2)}`,
        },
        volume: {
          value: `${Math.random() * 10000000}`,
          change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
            Math.random() * 1
          ).toFixed(2)}`,
        },
      };
    return detail;
  }

  async getTokenByContract(tokenContract) {
    let token, symbol, decimals, totalSupply, name;
    if (tokenContract === this.nativeCurrency.contract)
      token = this.assetList.find((asset) => SafeMath.eq(asset.contract, 0));
    if (!token)
      token = this.assetList.find((asset) => asset.contract === tokenContract);
    if (!token) {
      // requestCounts: 4
      try {
        const result = await this.lunar.getAsset({
          contract: tokenContract,
        });
        symbol = result.symbol;
        decimals = result.decimals;
        totalSupply = result.totalSupply;
        name = result.name;
      } catch (error) {
        console.log(`getTokenByContract error`, error);
        const symbolResult = await this.getData(
          `symbol()`,
          null,
          tokenContract
        );
        symbol = hexToAscii(sliceData(symbolResult)[2]);
        const decimalsResult = await this.getData(
          `decimals()`,
          null,
          tokenContract
        );
        decimals = parseInt(decimalsResult, 16);
        const totalSupplyResult = await this.getData(
          `totalSupply()`,
          null,
          tokenContract
        );
        totalSupply = parseInt(totalSupplyResult, 16);
        const nameResult = await this.getData(`name()`, null, tokenContract);
        name = hexToAscii(sliceData(nameResult)[2]);
      }
      token = {
        id: randomID(6),
        contract: tokenContract,
        iconSrc: erc20,
        name,
        symbol,
        decimals,
        totalSupply,
      };
    }
    return token;
  }

  async getPoolBalanceOf(pool) {
    const data = (this.connectedAccount?.contract || this.lunar.address)
      .replace("0x", "")
      .padStart(64, "0");
    const result = await eth_call(
      `balanceOf(address)`,
      data,
      pool.poolContract
    );
    const balanceOf = SafeMath.toCurrencyUint(
      parseInt(result, 16),
      pool.decimals
    );
    const share = SafeMath.gt(pool.totalSupply, "0")
      ? SafeMath.div(balanceOf, pool.totalSupply)
      : "0";
    const balanceOfToken0InPool = SafeMath.gt(share, "0")
      ? SafeMath.mult(share, pool.poolBalanceOfToken0)
      : "0";

    const balanceOfToken1InPool = SafeMath.gt(share, "0")
      ? SafeMath.mult(share, pool.poolBalanceOfToken1)
      : "0";

    const balance = {
      balanceOf,
      share,
      balanceOfToken0InPool,
      balanceOfToken1InPool,
    };
    return { ...pool, ...balance };
  }

  async getAssetBalanceOf(token, index) {
    const balanceOf = SafeMath.eq(token.contract, 0)
      ? await this.getBalance({
          address: this.connectedAccount?.contract,
        })
      : await this.getBalance({
          contract: token.contract,
          address: this.connectedAccount?.contract,
        });

    if (SafeMath.eq(token.contract, 0)) {
      this.connectedAccount = { ...this.connectedAccount, balanceOf };
      const accMsg = {
        evt: `UpdateConnectedAccount`,
        data: this.connectedAccount,
      };

      this.messenger.next(accMsg);
    }
    return {
      ...token,
      balanceOf,
    };
  }

  async updatePools(pool, index) {
    let i;
    if (index && SafeMath.gt(this.poolList.length, SafeMath.minus(index, 1)))
      i =
        this.poolList[index].poolContract.toLowerCase() ===
        pool.poolContract.toLowerCase()
          ? index
          : null;
    else
      i = this.poolList.findIndex(
        (t) => pool.poolContract.toLowerCase() === t.poolContract.toLowerCase()
      );
    if (i === -1) {
      this.poolList = this.poolList.concat(pool);
      console.log(`this.poolList`, this.poolList);
    } else {
      this.poolList[i] = pool;
      console.log(`this.poolList`, this.poolList);
    }
  }

  updateAssets(token, update) {
    let i = this.assetList.findIndex((t) => token.contract === t.contract);
    if (i === -1) {
      this.assetList = this.assetList.concat(token);
    } else if (i && this.assetList[i].contract === token.contract) {
      if (this.assetList[i]?.update) {
        // TODO
      } else this.assetList[i] = token;
    }

    if (update) {
      const msg = {
        evt: `UpdateSupportedTokens`,
        data: this.assetList,
      };

      this.messenger.next(msg);
    }
  }

  // requestCounts: 6
  async searchToken(contract, update) {
    let i, token, symbol, decimals, totalSupply, name;
    if (!update) {
      i = this.assetList.findIndex(
        (token) => token.contract.toLowerCase() === contract.toLowerCase()
      );
      token = i !== -1 ? this.assetList[i] : null;
    }
    if (token) return this.assetList[i];
    if (!token) {
      try {
        token = await this.communicator.searchToken(
          this.network.chainId,
          contract
        );
        token.iconSrc = SafeMath.eq(contract, 0)
          ? "https://www.tidebit.one/icons/eth.png"
          : erc20;
      } catch (error) {
        console.log(`searchToken error`, error);
        try {
          const result = await this.lunar.getAsset({
            contract: contract,
          });
          symbol = result.symbol;
          decimals = result.decimals;
          totalSupply = result.totalSupply;
          name = result.name;
        } catch (error) {
          console.log(` this.lunar.getAsset error`, error);
          try {
            const symbolResult = await this.getData(`symbol()`, null, contract);
            symbol = hexToAscii(sliceData(symbolResult)[2]);
            const decimalsResult = await this.getData(
              `decimals()`,
              null,
              contract
            );
            decimals = parseInt(decimalsResult, 16);
            const totalSupplyResult = await this.getData(
              `totalSupply()`,
              null,
              contract
            );
            totalSupply = parseInt(totalSupplyResult, 16);
            const nameResult = await this.getData(`name()`, null, contract);
            name = hexToAscii(sliceData(nameResult)[2]);
          } catch (error) {
            console.log(error);
            return null;
          }
        }
        token = {
          id: `${this.network.chainId}-${contract}`,
          contract,
          iconSrc: SafeMath.eq(contract, 0)
            ? "https://www.tidebit.one/icons/eth.png"
            : erc20,
          name,
          symbol,
          decimals,
          totalSupply,
          chainId: this.network.chainId,
        };
      }
    }
    let balanceOf;
    const detail = await this.getTokenDetail(token);
    if (this.isConnected && this.connectedAccount) {
      const result = await this.getAssetBalanceOf(token);
      balanceOf = result.balanceOf;
    }
    token = { ...token, ...detail, balanceOf };
    this.updateAssets(token);
    return token;
  }

  async getPoolDetail(poolContract) {
    let detail;
    try {
      detail = await this.communicator.poolDetail(
        this.network.chainId,
        poolContract
      );
    } catch (error) {
      console.log(error);
    }

    if (!detail)
      detail = {
        liquidity: "--",
        yield: "--",
        volume: {
          value: `${Math.random() * 10000000}`,
          change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
            Math.random() * 1
          ).toFixed(2)}`,
        },
        tvl: {
          value: `${Math.random() * 10000000}`,
          change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
            Math.random() * 1
          ).toFixed(2)}`,
        },
        irr: "3",
        interest24: `${Math.random() * 10000000}`,
      };
    return detail;
  }

  // requestCounts: 11
  async getPoolByContract({ poolContract, token0Contract, token1Contract }) {
    // requestCounts: 5
    let token0;
    if (token0Contract === this.nativeCurrency.contract)
      token0 = this.assetList.find((asset) => SafeMath.eq(asset.contract, 0));
    if (!token0) token0 = await this.searchToken(token0Contract);
    console.log(`token0`, token0);

    // requestCounts: 5
    let token1;
    if (token1Contract === this.nativeCurrency.contract)
      token1 = this.assetList.find((asset) => SafeMath.eq(asset.contract, 0));
    if (!token1) token1 = await this.searchToken(token1Contract);
    console.log(`token1`, token1);

    const reserveData = await this.getData(`getReserves()`, null, poolContract);
    const reserve = sliceData(reserveData.replace("0x", ""), 64);
    const poolBalanceOfToken0 = SafeMath.toCurrencyUint(
      SafeMath.toBn(reserve[0]),
      token0.decimals
    );
    const poolBalanceOfToken1 = SafeMath.toCurrencyUint(
      SafeMath.toBn(reserve[1]),
      token1.decimals
    );
    console.log(`reserve`, reserve);
    console.log(`poolBalanceOfToken0`, poolBalanceOfToken0);
    console.log(`poolBalanceOfToken1`, poolBalanceOfToken1);

    // requestCounts: 1
    const decimalsResult = await this.getData(`decimals()`, null, poolContract);
    const decimals = parseInt(decimalsResult, 16);
    // requestCounts: 1
    const totalSupplyResult = await this.getData(
      `totalSupply()`,
      null,
      poolContract
    );
    const totalSupply = SafeMath.toCurrencyUint(
      parseInt(totalSupplyResult, 16),
      decimals
    );
    const detail = await this.getPoolDetail(poolContract);
    const pool = {
      id: randomID(6),
      poolContract,
      decimals,
      totalSupply,
      name: `${token0.symbol}/${token1.symbol}`,
      token0: token0,
      token1: token1,
      poolBalanceOfToken0,
      poolBalanceOfToken1,
      ...detail,
    };
    return pool;
  }

  updateHistories(history) {
    let i = this.histories.findIndex(
      (t) =>
        t.transactionHash.toLowerCase() ===
        history.transactionHash.toLowerCase()
    );
    if (i === -1) {
      this.histories = this.histories.concat(history);
      console.log(`this.histories`, this.histories);
    } else {
      this.histories[i] = history;
      console.log(`this.histories`, this.histories);
    }
  }

  async formateHistory(history) {
    if (history.type === 0) {
      const fromToken = await this.searchToken(history.fromTokenContract);
      const toToken = await this.searchToken(history.toTokenContract);
      let fromTokenAmountChange, toTokenAmountChange, _history;
      /// SWAP
      fromTokenAmountChange = SafeMath.toCurrencyUint(
        history.amountIn,
        fromToken.decimals
      );
      toTokenAmountChange = SafeMath.toCurrencyUint(
        history.amountOut,
        toToken.decimals
      );
      _history = this.updateHistory({
        id: history.id,
        type: transactionType.SWAPS,
        transactionHash: history.transactionHash,
        chainId: history.chainId,
        token0: fromToken,
        token1: toToken,
        token0AmountChange: fromTokenAmountChange,
        token1AmountChange: toTokenAmountChange,
        timestamp: history.timestamp * 1000,
      });
      // this.updateHistories(_history);
      return _history;
    } else if (history.type === 1) {
      const token0 = await this.searchToken(history.token0Contract);
      const token1 = await this.searchToken(history.token1Contract);
      let token0AmountIn, token1AmountIn, _history;
      token0AmountIn = SafeMath.toCurrencyUint(
        history.token0AmountIn,
        token0.decimals
      );
      token1AmountIn = SafeMath.toCurrencyUint(
        history.token1AmountIn,
        token1.decimals
      );
      _history = this.updateHistory({
        id: history.id,
        type: transactionType.ADDS,
        transactionHash: history.transactionHash,
        chainId: history.chainId,
        token0,
        token1,
        token0AmountChange: token0AmountIn,
        token1AmountChange: token1AmountIn,
        timestamp: history.timestamp * 1000,
      });
      // this.updateHistories(_history);
      return _history;
    } else if (history.type === 2) {
      const token0 = await this.searchToken(history.token0Contract);
      const token1 = await this.searchToken(history.token1Contract);
      let token0AmountOut, token1AmountOut, _history;
      token0AmountOut = SafeMath.toCurrencyUint(
        history.token0AmountOut,
        token0.decimals
      );
      token1AmountOut = SafeMath.toCurrencyUint(
        history.token1AmountOut,
        token1.decimals
      );
      _history = this.updateHistory({
        id: history.id,
        type: transactionType.REMOVES,
        transactionHash: history.transactionHash,
        chainId: history.chainId,
        token0,
        token1,
        token0AmountChange: token0AmountOut,
        token1AmountChange: token1AmountOut,
        timestamp: history.timestamp * 1000,
      });
      // this.updateHistories(_history);
      return _history;
    } else {
      throw Error("history type is not allowed");
    }
  }
  async getAddrHistory() {
    if (this.isConnected && this.connectedAccount) {
      let histories = await this.communicator.addrTransHistory(
        this.network.chainId,
        this.connectedAccount.contract
      );
      console.log(`getAddrHistory.histories`, histories);
      histories = await Promise.all(
        histories.map(
          (history) =>
            new Promise(async (resolve, reject) => {
              const _formatedHistory = await this.formateHistory(history);
              this.updateHistories(_formatedHistory);
              resolve(_formatedHistory);
            })
        )
      );
    } else {
      this.histories = [];
    }
    const msg = {
      evt: `UpdateHistories`,
      data: this.histories,
    };

    this.messenger.next(msg);
    console.log(`this.histories`, this.histories);
  }

  async getPoolHistory(contract) {
    let histories = await this.communicator.poolTransHistory(
      this.network.chainId,
      contract
    );
    console.log(`getPoolHistory.histories`, histories);
    histories = await Promise.all(
      histories.map(
        (history) =>
          new Promise(async (resolve, reject) => {
            const _formatedHistory = await this.formateHistory(history);
            resolve(_formatedHistory);
          })
      )
    );
    return histories;
  }

  async getTokenHistory(contract) {
    let histories = await this.communicator.tokenTransHistory(
      this.network.chainId,
      contract
    );
    console.log(`getTokenHistory histories`, histories);
    histories = await Promise.all(
      histories.map(
        (history) =>
          new Promise(async (resolve, reject) => {
            const _formatedHistory = await this.formateHistory(history);
            resolve(_formatedHistory);
          })
      )
    );
    if (SafeMath.eq(contract, "0")) {
      let _histories = await this.communicator.tokenTransHistory(
        this.network.chainId,
        this.nativeCurrency.contract
      );
      console.log(`getTokenHistory _histories`, _histories);
      _histories = await Promise.all(
        _histories.map(
          (history) =>
            new Promise(async (resolve, reject) => {
              const _formatedHistory = await this.formateHistory(history);
              resolve(_formatedHistory);
            })
        )
      );
      histories = histories.concat(_histories);
      console.log(`getTokenHistory histories`, histories);
    }
    return histories;
  }

  // requestCounts: 14
  async getPoolByIndex(index, update) {
    // requestCounts: 1
    // const poolContract = await this.getPoolContractByIndex(index);
    // requestCounts: 11
    // const pool = await this.searchPool({ index, poolContract, update });
    // return pool;
  }

  async getContractData(force = false) {
    const now = Date.now();
    if (now - this.lastTimeSync > this.syncInterval || force) {
      if (!this.nativeCurrency?.contract) {
        await this.getNativeCurrency();
      }
      if (!this.factoryContract) {
        await this.getFactoryContract();
      }
      const overview = await this.getOverviewData();
      const msg = {
        evt: `UpdateOveriew`,
        data: overview,
      };
      this.messenger.next(msg);

      const tvl = await this.getTVLHistory();
      const volume = await this.getVolumeData();
      const chartMsg = {
        evt: `UpdateChart`,
        data: {
          tvl,
          volume,
        },
      };

      this.messenger.next(chartMsg);
      await this.getSupportedTokens();
      await this.getAddrHistory();
      await this.getSupportedPools();

      this.lastTimeSync = Date.now();
    }
  }

  async start() {
    await this.getContractData(true);

    this.timer = setInterval(() => {
      console.log(`sync`);
      this.getContractData(false);
    }, this.syncInterval);
  }

  async getContractDataLength() {
    if (!this.nativeCurrency?.contract) {
      await this.getNativeCurrency();
    }
    if (!this.factoryContract) {
      await this.getFactoryContract();
    }
    const result = await this.getData(
      `allPairsLength()`,
      null,
      this.factoryContract
    );

    const allPairLength = parseInt(result, 16);
    console.log(`getContractDataLength`, allPairLength);
    return allPairLength;
  }

  async getTokenPriceData(tokenContract) {
    try {
      const result = await this.communicator.tokenPriceData(
        this.network.chainId,
        tokenContract
      );
      const priceData = result.map((data) => ({
        ...data,
        // date: new Date(data.x),
        x: new Date(parseInt(data.x)), // -- test
      }));
      console.log(`getTokenPriceData priceData`, priceData);
      return priceData;
    } catch (error) {
      const priceData = randomCandleStickData();
      console.log(`getTokenPriceData error`, error);
      return priceData;
    }
  }

  async getPoolPriceData(poolContract) {
    try {
      const result = await this.communicator.poolPriceData(
        this.network.chainId,
        poolContract
      );
      const priceData = result.map((data) => ({
        ...data,
        // date: new Date(data.x),
        x: new Date(parseInt(data.x)), // -- test
      }));
      console.log(`getPoolPriceData priceData`, priceData);
      return priceData;
    } catch (error) {
      const priceData = randomCandleStickData();
      console.log(`getPoolPriceData error`, error);
      return priceData;
    }
  }

  async getTVLHistory() {
    try {
      const result = await this.communicator.tvlHistory(this.network.chainId);
      console.log(`getTVLHistory result`, result);
      const tvlData = result.map((data) => ({
        ...data,
        // date: dateFormatter(data.date).day,
        date: dateFormatter(parseInt(data.date)).day, // -- test
      }));
      console.log(`getTVLHistory tvlData`, tvlData);
      return tvlData;
    } catch (error) {
      console.log(`getTVLHistory error`, error);
    }
  }

  async getVolumeData() {
    try {
      const result = await this.communicator.volume24hr(this.network.chainId);
      console.log(`getVolumeData result`, result);
      const volumeData = result.map((data) => ({
        ...data,
        // date: dateFormatter(data.date).day,
        date: dateFormatter(parseInt(data.date)).day, // -- test
      }));
      console.log(`getVolumeData volumeData`, volumeData);
      return volumeData;
    } catch (error) {
      console.log(`getVolumeData error`, error);
    }
  }

  async getOverviewData() {
    try {
      const result = await this.communicator.overview(this.network.chainId);
      console.log(`getOverviewData`, result);
      const overviewData = [
        {
          title: "Volume 24H",
          data: {
            value: result.volume.value,
            change:
              !result?.volume?.change || isNaN(result.volume.change)
                ? "0"
                : SafeMath.mult(result.volume.change, "100"),
          },
        },
        {
          title: "Fees 24H",
          data: {
            value: result.fee24?.value,
            change:
              !result?.fee24?.change || isNaN(result.fee24.change)
                ? "0"
                : SafeMath.mult(result.fee24.change, "100"),
          },
        },
        {
          title: "TVL",
          data: {
            value: result.tvl.value,
            change:
              !result?.tvl?.change || isNaN(result.tvl.change)
                ? "0"
                : SafeMath.mult(result.tvl.change, "100"),
          },
        },
      ];
      return overviewData;
    } catch (error) {
      console.log(`getOverviewData error`, error);
      return await new Promise((resolve) => {
        const id = setTimeout(() => {
          // dummyOverview
          resolve([
            {
              title: "Volume 24H",
              data: {
                value: "1.65",
                change: "-0.0557",
              },
            },
            {
              title: "Fees 24H",
              data: {
                value: "3.36",
                change: "-0.0442",
              },
            },
            {
              title: "TVL",
              data: {
                value: "3.84",
                change: "+0.0071",
              },
            },
          ]);
          clearTimeout(id);
        }, 500);
      });
    }
  }

  async getSupportedTokens() {
    try {
      let balance = "0";
      let tokens = await this.communicator.tokenList(this.network.chainId);
      tokens = await Promise.all(
        tokens.map(
          (token) =>
            new Promise(async (resolve, reject) => {
              const detail = await this.getTokenDetail(token);
              const updateToken = {
                ...token,
                ...detail,
                iconSrc: SafeMath.eq(token.contract, 0)
                  ? "https://www.tidebit.one/icons/eth.png"
                  : erc20,
              };
              if (this.isConnected && this.connectedAccount) {
                const result = await this.getAssetBalanceOf(updateToken);
                if (SafeMath.gt(result.balanceOf, "0"))
                  // balance = SafeMath.plus(balance, SafeMath.mult(result.balanceOf, result.priceToEth.value));
                  balance = SafeMath.plus(balance, result.balanceOf);
                this.updateAssets(result);
                resolve(result);
              } else {
                this.updateAssets(updateToken);
                resolve(updateToken);
              }
            })
        )
      );
      const balanceMsg = {
        evt: `UpdateTotalBalance`,
        data: balance,
      };
      this.messenger.next(balanceMsg);

      this.assetList = tokens;
      console.log(`getSupportedTokens this.assetList`, this.assetList);

      const msg = {
        evt: `UpdateSupportedTokens`,
        data: this.assetList,
      };

      this.messenger.next(msg);
      return this.assetList;
    } catch (error) {
      console.log(`getSupportedTokens error`, error);
    }
  }

  async getSupportedPools() {
    try {
      let pools = await this.communicator.poolList(this.network.chainId);
      pools = await Promise.all(
        pools.map((pool) => {
          return new Promise(async (resolve, reject) => {
            let token0;
            if (pool.token0Contract === this.nativeCurrency.contract)
              token0 = this.assetList.find((asset) =>
                SafeMath.eq(asset.contract, 0)
              );
            if (!token0) token0 = await this.searchToken(pool.token0Contract);
            let token1;
            if (pool.token1Contract === this.nativeCurrency.contract)
              token1 = this.assetList.find((asset) =>
                SafeMath.eq(asset.contract, 0)
              );
            if (!token1) token1 = await this.searchToken(pool.token1Contract);

            let poolBalanceOfToken0 = SafeMath.toCurrencyUint(
              SafeMath.toBn(pool.reserve0),
              token0.decimals
            );
            let poolBalanceOfToken1 = SafeMath.toCurrencyUint(
              SafeMath.toBn(pool.reserve1),
              token1.decimals
            );
            const totalSupply = SafeMath.toCurrencyUint(
              pool.totalSupply,
              pool.decimals
            );
            const detail = await this.getPoolDetail(pool.poolContract);
            const updatePool = {
              ...pool,
              token0,
              token1,
              poolBalanceOfToken0,
              poolBalanceOfToken1,
              name: `${token0.symbol}/${token1.symbol}`,
              ...detail,
              totalSupply,
              reverse: false,
            };
            if (this.isConnected && this.connectedAccount) {
              const result = await this.getPoolBalanceOf(updatePool);
              resolve(result);
            } else resolve(updatePool);
          });
        })
      );
      this.poolList = pools; // -- backend is not ready
      console.log(`getSupportedPools this.poolList`, this.poolList);
      const msg = {
        evt: `UpdateSupportedPools`,
        data: this.poolList,
      };

      this.messenger.next(msg);
    } catch (error) {
      console.log(`UpdateSupportedPools error`, error);
      // if (!this.poolList.length) {
      //   const allPairLength = await this.getContractDataLength();
      //   this.pairLength = allPairLength;
      //   const jobs = [];
      //   for (let i = 25; i < allPairLength; i++) {
      //     jobs.push(this.getPoolByIndex(i));
      //     // if (!isConnected) break;
      //   }
      //   await Promise.all(jobs);
      //   return this.poolList;
      // } else {
      //   this.pairLength = this.poolList.length;
      //   return this.poolList;
      // }
    }
  }

  findPoolIndex({ poolContract, token0Contract, token1Contract }) {
    let i;
    if (poolContract) {
      i = this.poolList.findIndex(
        (pool) => pool.poolContract.toLowerCase() === poolContract.toLowerCase()
      );
    } else if (!poolContract && token0Contract && token1Contract) {
      i = this.poolList.findIndex(
        (pool) =>
          (pool.token0.contract.toLowerCase() ===
            (token0Contract.toLowerCase() ===
            this.nativeCurrency.contract.toLowerCase()
              ? "0x0000000000000000000000000000000000000000"
              : token0Contract) &&
            pool.token1.contract.toLowerCase() ===
              (token1Contract.toLowerCase() ===
              this.nativeCurrency.contract.toLowerCase()
                ? "0x0000000000000000000000000000000000000000"
                : token1Contract)) ||
          (pool.token1.contract.toLowerCase() ===
            (token0Contract.toLowerCase() ===
            this.nativeCurrency.contract.toLowerCase()
              ? "0x0000000000000000000000000000000000000000"
              : token0Contract) &&
            pool.token0.contract.toLowerCase() ===
              (token1Contract.toLowerCase() ===
              this.nativeCurrency.contract.toLowerCase()
                ? "0x0000000000000000000000000000000000000000"
                : token1Contract))
      );
    } else i = -1;
    return i;
  }

  // requestCounts: 6
  async searchPoolByPoolContract(poolContract) {
    console.log(`searchPoolByPoolContract poolContract`, poolContract);
    if (!poolContract) return null;
    //

    let i = this.findPoolIndex({
      poolContract,
    });
    console.log(`searchPoolByPoolContract i`, i);

    if (i !== -1) {
      console.log(
        `searchPoolByPoolContract this.poolList[i]`,
        this.poolList[i]
      );
      return this.poolList[i];
    }
  }

  // requestCounts: 6
  async searchPoolByTokens({ token0, token1 }) {
    if (!token0?.id || !token1?.id) return null;
    //
    let pool, poolBalanceOfToken0, poolBalanceOfToken1;
    // let i, pool, poolBalanceOfToken0, poolBalanceOfToken1;

    // if (!update) {
    //   console.log(`searchPoolByTokens !update`, !update);
    //   i = this.findPoolIndex({
    //     token0Contract: token0.contract,
    //     token1Contract: token1.contract,
    //   });
    //   console.log(`searchPoolByTokens i`, i);

    //   if (i !== -1) {
    //     console.log(`searchPoolByTokens this.poolList[i]`, this.poolList[i]);
    //     return this.poolList[i];
    //   }
    // }

    // try {
    //   pool = await this.communicator.searchPool(
    //     this.network.chainId,
    //     SafeMath.eq(token0.contract, 0)
    //       ? this.nativeCurrency.contract
    //       : token0.contract,
    //     SafeMath.eq(token1.contract, 0)
    //       ? this.nativeCurrency.contract
    //       : token1.contract
    //   );
    //   if (pool) {
    //     console.log(`searchPoolByTokens pool`, pool);
    //     poolBalanceOfToken0 = SafeMath.toCurrencyUint(
    //       SafeMath.toBn(pool.reserve0),
    //       token0.decimals
    //     );
    //     poolBalanceOfToken1 = SafeMath.toCurrencyUint(
    //       SafeMath.toBn(pool.reserve1),
    //       token1.decimals
    //     );
    //     pool = {
    //       ...pool,
    //       token0,
    //       token1,
    //       poolBalanceOfToken0,
    //       poolBalanceOfToken1,
    //       name: `${token0.symbol}/${token1.symbol}`,
    //     };
    //     return pool;
    //   }
    // } catch (error) {
    //   console.log(`searchPool api throw error`, error);

    try {
      let poolContract = await this.getPoolContractByTokens(
        SafeMath.eq(token0.contract, 0)
          ? this.nativeCurrency.contract
          : token0.contract,
        SafeMath.eq(token1.contract, 0)
          ? this.nativeCurrency.contract
          : token1.contract
      );
      if (!SafeMath.eq(poolContract, "0")) {
        const token0Contract = await this.getData(
          `token0()`,
          null,
          poolContract
        );
        const token1Contract = await this.getData(
          `token1()`,
          null,
          poolContract
        );
        const reserveData = await this.getData(
          `getReserves()`,
          null,
          poolContract
        );
        const reserve = sliceData(reserveData.replace("0x", ""), 64);
        poolBalanceOfToken0 = SafeMath.toCurrencyUint(
          SafeMath.toBn(reserve[0]),
          token0.decimals
        );

        poolBalanceOfToken1 = SafeMath.toCurrencyUint(
          SafeMath.toBn(reserve[1]),
          token1.decimals
        );
        // requestCounts: 1
        const decimalsResult = await this.getData(
          `decimals()`,
          null,
          poolContract
        );
        const decimals = parseInt(decimalsResult, 16);
        // requestCounts: 1
        const totalSupplyResult = await this.getData(
          `totalSupply()`,
          null,
          poolContract
        );
        const totalSupply = SafeMath.toCurrencyUint(
          parseInt(totalSupplyResult, 16),
          decimals
        );
        const detail = await this.getPoolDetail(poolContract);

        pool = {
          id: randomID(6),
          poolContract,
          decimals,
          totalSupply,
          token0Contract,
          token1Contract,
          token0,
          token1,
          poolBalanceOfToken0,
          poolBalanceOfToken1,
          name: `${token0.symbol}/${token1.symbol}`,
          ...detail,
          reverse:
            token0Contract.toLowerCase() === SafeMath.eq(token1.contract, "0")
              ? this.nativeCurrency.contract.toLowerCase()
              : token1.contract.toLowerCase() ||
                token1Contract.toLowerCase() ===
                  SafeMath.eq(token0.contract, "0")
              ? this.nativeCurrency.contract.toLowerCase()
              : token0.contract.toLowerCase(),
        };
        console.log(`searchPoolByTokens pool`, pool);
        if (this.isConnected && this.connectedAccount) {
          pool = await this.getPoolBalanceOf(pool);
        }
        console.log(`searchPoolByTokens pool`, pool);
        return pool;
      } else return null;
    } catch (error) {
      console.log(`searchPoolByTokens error`, error);
      return null;
    }
    // }
  }

  async getAmountIn(amountOut, tokens, reserveIn, reserveOut) {
    const funcName = "getAmountIn(uint256,uint256,uint256)"; // 0x85f8c259
    const amountOutData = SafeMath.toSmallestUnitHex(
      amountOut,
      tokens[tokens.length - 1].decimals
    ).padStart(64, "0");
    const reserveInData = SafeMath.toSmallestUnitHex(
      reserveIn,
      tokens[0].decimals
    ).padStart(64, "0");
    const reserveOutData = SafeMath.toSmallestUnitHex(
      reserveOut,
      tokens[tokens.length - 1].decimals
    ).padStart(64, "0");
    const data = amountOutData + reserveInData + reserveOutData;
    console.log(`getAmountIn data`, data);
    try {
      const result = await this.getData(funcName, data, this.routerContract);
      console.log(`getAmountIn result`, result);
      const amountIn = SafeMath.toCurrencyUint(
        SafeMath.toBn(result),
        tokens[0].decimals
      );
      console.log(`getAmountIn amountIn`, amountIn);
      return amountIn;
    } catch (error) {
      console.log(`getAmountIn error`, error);
      throw error;
    }
  }
  /**
   * 0x054d50d4
   * 0000000000000000000000000000000000000000000000000de0b6b3a7640000
   * 000000000000000000000000000000000000000000000000640f034826801d7e
   * 000000000000000000000000000000000000000000000078666691b7748c37a4
   *
   */
  async getAmountOut(amountIn, tokens, reserveIn, reserveOut) {
    console.log(`getDetails=>getAmountOut amountIn`, amountIn);
    console.log(`getDetails=>getAmountOut tokens`, tokens);
    console.log(`getDetails=>getAmountOut reserveIn`, reserveIn);
    console.log(`getDetails=>getAmountOut reserveOut`, reserveOut);
    const funcName = "getAmountOut(uint256,uint256,uint256)"; // 0x054d50d4
    const amountInData = SafeMath.toSmallestUnitHex(
      amountIn,
      tokens[0].decimals
    ).padStart(64, "0");
    const reserveInData = SafeMath.toSmallestUnitHex(
      reserveIn,
      tokens[0].decimals
    ).padStart(64, "0");
    const reserveOutData = SafeMath.toSmallestUnitHex(
      reserveOut,
      tokens[tokens.length - 1].decimals
    ).padStart(64, "0");
    console.log(`getDetails=>getAmountOut amountInData`, amountInData);
    console.log(`getDetails=>getAmountOut reserveInData`, reserveInData);
    console.log(`getDetails=>getAmountOut reserveOutData`, reserveOutData);

    const data = amountInData + reserveInData + reserveOutData;
    console.log(`getDetails=>getAmountOut data`, data);
    try {
      const result = await this.getData(funcName, data, this.routerContract);
      console.log(`getAmountOut result`, result);
      const amountIn = SafeMath.toCurrencyUint(
        SafeMath.toBn(result),
        tokens[tokens.length - 1].decimals
      );
      console.log(`getAmountOut amountIn`, amountIn);
      return amountIn;
    } catch (error) {
      console.log(`getAmountIn error`, error);
      throw error;
    }
  }

  async getAmountsIn(amountOut, tokens) {
    console.log(`getAmountsIn tokens`, tokens);
    const funcName = "getAmountsIn(uint256,address[])"; // 0xd06ca61f
    const amountOutData = SafeMath.toSmallestUnitHex(
      amountOut,
      tokens[tokens.length - 1].decimals
    )
      .split(".")[0]
      .padStart(64, "0");
    const addressCount = SafeMath.toHex(tokens.length).padStart(64, "0");
    const nativeCurrencyContractData = this.nativeCurrency.contract
      .replace("0x", "")
      .padStart(64, "0");
    const amountInTokenContractData = SafeMath.gt(tokens[0].contract, "0")
      ? tokens[0].contract.replace("0x", "").padStart(64, "0")
      : nativeCurrencyContractData;
    const amountOutTokenContractData = SafeMath.gt(
      tokens[tokens.length - 1].contract,
      "0"
    )
      ? tokens[tokens.length - 1].contract.replace("0x", "").padStart(64, "0")
      : nativeCurrencyContractData;
    // const tokensContractData = tokens.reduce(
    //   (acc, token) =>
    //     acc + SafeMath.gt(token.contract, "0")
    //       ? token.contract.replace("0x", "").padStart(64, "0")
    //       : this.nativeCurrency.contract.replace("0x", "").padStart(64, "0"),
    //   ""
    // );
    const data =
      amountOutData +
      "0000000000000000000000000000000000000000000000000000000000000040" +
      addressCount +
      // tokensContractData;
      amountInTokenContractData +
      // nativeCurrencyContractData +
      amountOutTokenContractData;
    console.log(`getAmountsIn data`, data);
    try {
      const result = await this.getData(funcName, data, this.routerContract);
      console.log(`getAmountsIn result`, result);
      const parsedResult = sliceData(result.replace("0x", ""), 64)[2];
      console.log(`getAmountsIn parsedResult`, parsedResult);
      const amountIn = SafeMath.toCurrencyUint(
        SafeMath.toBn(parsedResult),
        tokens[0].decimals
      );
      console.log(`getAmountsIn amountIn`, amountIn);
      return amountIn;
    } catch (error) {
      console.log(`getAmountsIn error`, error);
      throw error;
    }
  }
  async getAmountsOut(amountIn, tokens) {
    const funcName = "getAmountsOut(uint256,address[])"; // 0xd06ca61f
    const amountInData = SafeMath.toSmallestUnitHex(
      amountIn,
      tokens[0].decimals
    )
      .split(".")[0]
      .padStart(64, "0");
    const addressCount = SafeMath.toHex(tokens.length).padStart(64, "0");
    const nativeCurrencyContractData = this.nativeCurrency.contract
      .replace("0x", "")
      .padStart(64, "0");
    const amountInTokenContractData = SafeMath.gt(tokens[0].contract, "0")
      ? tokens[0].contract.replace("0x", "").padStart(64, "0")
      : nativeCurrencyContractData;
    const amountOutTokenContractData = SafeMath.gt(
      tokens[tokens.length - 1].contract,
      "0"
    )
      ? tokens[tokens.length - 1].contract.replace("0x", "").padStart(64, "0")
      : nativeCurrencyContractData;
    // const tokensContractData = tokens.reduce(
    //   (acc, token) =>
    //     acc + SafeMath.gt(token.contract, "0")
    //       ? token.contract.replace("0x", "").padStart(64, "0")
    //       : this.nativeCurrency.contract.replace("0x", "").padStart(64, "0"),
    //   ""
    // );
    const data =
      amountInData +
      "0000000000000000000000000000000000000000000000000000000000000040" +
      addressCount +
      // tokensContractData;
      amountInTokenContractData +
      // nativeCurrencyContractData +
      amountOutTokenContractData;
    console.log(`getAmountsOut data`, data);
    try {
      const result = await this.getData(funcName, data, this.routerContract);
      console.log(`getAmountsOut result`, result);
      const slicedData = sliceData(result.replace("0x", ""), 64);
      const parsedResult = slicedData[slicedData.length - 1];
      console.log(`getAmountsOut parsedResult`, parsedResult);
      const amountOut = SafeMath.toCurrencyUint(
        SafeMath.toBn(parsedResult),
        tokens[tokens.length - 1].decimals
      );
      console.log(`getAmountsOut amountOut`, amountOut);
      return amountOut;
    } catch (error) {
      console.log(`getAmountsOut error`, error);
      throw error;
    }
  }
  /**
   * @typedef {Object} AllowanceResult
   * @property {Boolean} isEnough
   * @property {string} allowanceAmount
   */
  /**
   *
   * @param {string} contract
   * @param {string} amount
   * @param {number} decimals
   * @returns {Promise<AllowanceResult>}
   */
  async isAllowanceEnough(contract, amount, decimals) {
    const funcName = "allowance(address,address)";
    const ownerData = this.connectedAccount?.contract
      .replace("0x", "")
      .padStart(64, "0");
    const spenderData = this.routerContract
      ?.replace("0x", "")
      .padStart(64, "0");
    const data = ownerData + spenderData;
    const result = await this.getData(funcName, data, contract);
    console.log(`allowance result`, result);
    const allowanceAmount = SafeMath.toCurrencyUint(
      SafeMath.toBn(result),
      decimals
    );
    console.log(`allowance amount`, allowanceAmount);
    return { isEnough: SafeMath.gt(allowanceAmount, amount), allowanceAmount };
  }
  async approve(contract, amount, decimals) {
    const funcName = "approve(address,uint256)";
    const funcNameHex = `0x${keccak256(funcName).toString("hex").slice(0, 8)}`;
    const spenderData = this.routerContract.replace("0x", "").padStart(64, "0");
    const amountData = amount
      ? SafeMath.toSmallestUnitHex(amount, decimals)
          .split(".")[0]
          .padStart(64, "0")
      : "".padEnd(64, "f");
    const data = funcNameHex + spenderData + amountData;
    const value = 0;
    // send transaction
    const transaction = {
      to: contract,
      amount: value,
      data,
    };
    const result = await this.lunar.send(transaction);
    console.log(`approve result`, result);
    return result;
  }
  updateHistory({
    id,
    type,
    chainId,
    transactionHash,
    token0,
    token0AmountChange,
    token1,
    token1AmountChange,
    timestamp,
    pending,
  }) {
    const history = {
      id,
      transactionHash,
      type,
      tokenA: {
        ...token0,
        amount: token0AmountChange,
      },
      tokenB: {
        ...token1,
        amount: token1AmountChange || "--",
      },
      dateTime: dateFormatter(timestamp),
      pending,
    };
    return history;
  }

  async createPair(token0Contract, token1Contract) {
    const funcName = "createPair(address,address)"; //c9c65396
    const funcNameHex = `0x${keccak256(funcName).toString("hex").slice(0, 8)}`;
    const token0Data = token0Contract.replace("0x", "").padStart(64, "0");
    const token1Data = token1Contract.replace("0x", "").padStart(64, "0");
    const data = funcNameHex + token0Data + token1Data;
    const value = 0;
    // send transaction
    if (!this.factoryContract) {
      await this.getFactoryContract();
    }
    const transaction = {
      to: this.factoryContract,
      amount: value,
      data,
    };
    const result = await this.lunar.send(transaction);
    console.log(`createPair result`, result);
    return result;
  }

  async getLatestPool(index) {
    // let newPairLength;
    // const id = setInterval(async () => {
    // if (!index) {
    //   newPairLength = await this.getContractDataLength();
    //   if (newPairLength >= this.pairLength) {
    //     clearInterval(id);
    //     const jobs = [];
    //     for (let i = this.pairLength; i < newPairLength; i++) {
    //       jobs.push(this.getPoolByIndex(i, true));
    //     }
    //     await Promise.all(jobs);
    //     await this.getAddrHistory();
    //   }
    // } else {
    //   const updatePool = await this.getPoolByIndex(index, true);
    //   console.log(`updatePool`, updatePool.poolContract, updatePool);
    //   console.log(
    //     `this.poolList[index]`,
    //     this.poolList[index].poolContract,
    //     this.poolList[index]
    //   );
    //   if (updatePool.poolContract !== this.poolList[index].poolContract)
    //     clearInterval(id);
    //   if (
    //     updatePool.balanceOfToken0InPool !==
    //     this.poolList[index].poolBalanceOfToken0
    //   ) {
    //     clearInterval(id);
    //     this.poolList[index] = updatePool;
    //     await this.getAddrHistory();
    //   }
    // }
    // }, 5000);
  }

  async addLiquidityETH(token, amountToken, amountETH, slippage, deadline) {
    console.log(`addLiquidityETH token`, token);
    console.log(`addLiquidityETH amountToken`, amountToken);
    console.log(`addLiquidityETH amountETH`, amountETH);
    const funcName =
      "addLiquidityETH(address,uint256,uint256,uint256,address,uint256)";
    const funcNameHex = `0x${keccak256(funcName).toString("hex").slice(0, 8)}`;
    const tokenContractData = token.contract
      .replace("0x", "")
      .padStart(64, "0");
    const amountTokenDesired = SafeMath.toSmallestUnitHex(
      amountToken,
      token.decimals
    )
      .split(".")[0]
      .padStart(64, "0");

    const amountTokenMin = SafeMath.toHex(
      Math.floor(
        SafeMath.mult(
          SafeMath.toSmallestUnit(amountToken, token.decimals),
          SafeMath.minus("1", SafeMath.div(slippage || "0.5", "100"))
        )
      )
    ).padStart(64, "0");
    console.log(`amountTokenMin`, amountTokenMin);

    const amountETHMin = SafeMath.toHex(
      Math.floor(
        SafeMath.mult(
          SafeMath.toSmallestUnit(amountETH, 18),
          SafeMath.minus("1", SafeMath.div(slippage || "0.5", "100"))
        )
      )
    ).padStart(64, "0");
    // SafeMath.toSmallestUnitHex(amountETH, 18)
    //   .split(".")[0]
    //   .padStart(64, "0");

    console.log(`amountETHMin`, amountETHMin);
    const toData = this.connectedAccount?.contract
      .replace("0x", "")
      .padStart(64, "0");
    const dateline = SafeMath.toHex(
      SafeMath.plus(
        Math.round(SafeMath.div(Date.now(), 1000)),
        SafeMath.mult(deadline || "30", 60)
      )
    ).padStart(64, "0");

    const data =
      funcNameHex +
      tokenContractData +
      amountTokenDesired +
      amountTokenMin +
      amountETHMin +
      toData +
      dateline;
    console.log(`data`, data);
    /**
     *
     * 0xf305d719
     * 000000000000000000000000550443fa736c1881a7522d5a4a2e3f57afe06825
     * 0000000000000000000000000000000000000000000000022a4762638919fdb0
     * 0000000000000000000000000000000000000000000000020e909d7828a58000
     * 0000000000000000000000000000000000000000000000000de0b6b3a7640000
     * 000000000000000000000000fc657daf7d901982a75ee4ecd4bdcf93bd767ca4
     * 0000000000000000000000000000000000000000000000000000000061b0794f
     *
   
     */

    let splitChunk = `${amountETH}`.split(".");
    console.log(`splitChunk`, splitChunk);

    const transaction = {
      to: this.routerContract,
      amount:
        splitChunk.length > 1 && splitChunk[1].length > 18
          ? `${splitChunk[0]}.${splitChunk[1].substring(0, 18)}`
          : amountETH,
      data,
    };
    try {
      console.log(`addLiquidityETH transaction`, transaction);
      const result = await this.lunar.send(transaction);
      const history = this.updateHistory({
        id: `${this.network.chainId}-${result.toString()}`,
        type: transactionType.ADDS,
        transactionHash: result.toString(),
        chainId: this.network.chainId,
        token0: token,
        token1: this.assetList.find((asset) =>
          SafeMath.eq(asset.contract, "0")
        ),
        token0AmountChange: SafeMath.mult(
          amountToken,
          SafeMath.minus("1", SafeMath.div(slippage || "0.5", "100"))
        ),
        token1AmountChange: SafeMath.mult(
          amountETH,
          SafeMath.minus("1", SafeMath.div(slippage || "0.5", "100"))
        ),
        timestamp: Date.now(),
        pending: true,
      });
      this.updateHistories(history);
      const msg = {
        evt: `UpdateHistories`,
        data: this.histories,
      };

      this.messenger.next(msg);
      console.log(`addLiquidityETH result`, result);
    } catch (error) {
      console.log(`addLiquidityETH error`, error);
    }
  }
  formateAddLiquidity({
    pool,
    tokenA,
    tokenB,
    amountADesired,
    amountBDesired,
    type,
  }) {
    // console.log(`formateAddLiquidity tokenA`, tokenA);
    // console.log(`formateAddLiquidity tokenB`, tokenB);
    // console.log(`formateAddLiquidity amountADesired`, amountADesired);
    // console.log(`formateAddLiquidity amountBDesired`, amountBDesired);
    // console.log(`formateAddLiquidity type`, type);
    console.log(`formateAddLiquidity pool`, pool);

    if (pool) {
      let amountA, amountB;
      switch (type) {
        case "selected":
          amountB = amountADesired
            ? SafeMath.mult(
                !pool.reverse
                  ? SafeMath.div(
                      pool.poolBalanceOfToken1,
                      pool.poolBalanceOfToken0
                    )
                  : SafeMath.div(
                      pool.poolBalanceOfToken0,
                      pool.poolBalanceOfToken1
                    ),
                amountADesired
              )
            : "0";
          return {
            tokenA: pool.token0,
            tokenB: pool.token1,
            amountADesired,
            amountBDesired: amountB,
            pool,
          };
        case "paired":
          console.log(`formateAddLiquidity`, amountBDesired);
          amountA = amountBDesired
            ? SafeMath.mult(
                !pool.reverse
                  ? SafeMath.div(
                      pool.poolBalanceOfToken0,
                      pool.poolBalanceOfToken1
                    )
                  : SafeMath.div(
                      pool.poolBalanceOfToken1,
                      pool.poolBalanceOfToken0
                    ),
                amountBDesired
              )
            : "0";
          return {
            tokenA: pool.token0,
            tokenB: pool.token1,
            amountADesired: amountA,
            amountBDesired,
            pool,
          };
        default:
          throw Error("type cannot be null");
      }
    } else {
      return {
        tokenA,
        tokenB,
        amountADesired: amountADesired,
        amountBDesired: amountBDesired,
      };
    }
  }

  async addLiquidity(
    tokenA,
    tokenB,
    amountADesired,
    amountBDesired,
    slippage,
    deadline
  ) {
    const funcName =
      "addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)";
    const funcNameHex = `0x${keccak256(funcName).toString("hex").slice(0, 8)}`;
    const tokenAContractData = tokenA.contract
      .replace("0x", "")
      .padStart(64, "0");
    const tokenBContractData = tokenB.contract
      .replace("0x", "")
      .padStart(64, "0");
    const amountADesiredData = SafeMath.toSmallestUnitHex(
      amountADesired,
      tokenA.decimals
    )
      .split(".")[0]
      .padStart(64, "0");
    const amountBDesiredData = SafeMath.toSmallestUnitHex(
      amountBDesired,
      tokenB.decimals
    )
      .split(".")[0]
      .padStart(64, "0");
    const amountAMinData = SafeMath.toHex(
      Math.floor(
        SafeMath.mult(
          SafeMath.toSmallestUnit(amountADesired, tokenA.decimals),
          SafeMath.minus("1", SafeMath.div(slippage || "0.5", "100"))
        )
      )
    ).padStart(64, "0");
    const amountBMinData = SafeMath.toHex(
      Math.floor(
        SafeMath.mult(
          SafeMath.toSmallestUnit(amountBDesired, tokenB.decimals),
          SafeMath.minus("1", SafeMath.div(slippage || "0.5", "100"))
        )
      )
    ).padStart(64, "0");
    const toData = this.connectedAccount?.contract
      .replace("0x", "")
      .padStart(64, "0");
    const dateline = SafeMath.toHex(
      SafeMath.plus(
        Math.round(SafeMath.div(Date.now(), 1000)),
        SafeMath.mult(deadline || "30", 60)
      )
    ).padStart(64, "0");
    const data =
      funcNameHex +
      tokenAContractData +
      tokenBContractData +
      amountADesiredData +
      amountBDesiredData +
      amountAMinData +
      amountBMinData +
      toData +
      dateline;
    /**
     * 0xe8e33700
     * 000000000000000000000000b4925d3386fbf607b60692627eccaa79cab6114c
     * 000000000000000000000000e25abb063e7e2ad840e16e100bffeb3dd303d04e
     * 0000000000000000000000000000000000000000000000000de0b6b3a7640000
     * 00000000000000000000000000000000000000000000003063ff414a17af3818
     * 0000000000000000000000000000000000000000000000000d2f13f7789f0000
     * 00000000000000000000000000000000000000000000002df898e46cc9b42d80
     * 000000000000000000000000fc657daf7d901982a75ee4ecd4bdcf93bd767ca4
     * 0000000000000000000000000000000000000000000000000000000061b82376
     *
     */
    const value = 0;
    const transaction = {
      to: this.routerContract,
      amount: value,
      data,
    };
    try {
      console.log(`addLiquidity transaction`, transaction);
      const result = await this.lunar.send(transaction);
      console.log(`addLiquidity result`, result);
      const history = this.updateHistory({
        id: `${this.network.chainId}-${result.toString()}`,
        type: transactionType.ADDS,
        transactionHash: result.toString(),
        chainId: this.network.chainId,
        token0: tokenA,
        token1: tokenB,
        token0AmountChange: SafeMath.mult(
          amountADesired,
          SafeMath.minus("1", SafeMath.div(slippage || "0.5", "100"))
        ),
        token1AmountChange: SafeMath.mult(
          amountBDesired,
          SafeMath.minus("1", SafeMath.div(slippage || "0.5", "100"))
        ),
        timestamp: Date.now(),
        pending: true,
      });
      this.updateHistories(history);
      const msg = {
        evt: `UpdateHistories`,
        data: this.histories,
      };
      this.messenger.next(msg);
      // update tokenA, tokenB balanceOf
      // update pool balanceOf
      // update pool share
      //
      return result;
    } catch (error) {
      console.log(`addLiquidity error`, error);
    }
  }
  async provideLiquidity({
    tokenA,
    tokenB,
    amountADesired,
    amountBDesired,
    slippage,
    deadline,
    create,
  }) {
    console.log(
      `submitHandler tokenA`,
      tokenA,
      `SafeMath.eq(tokenA?.contract, 0)`,
      SafeMath.eq(tokenA?.contract, 0)
    );
    console.log(
      `submitHandler tokenB`,
      tokenB,
      `SafeMath.eq(tokenB?.contract, 0)`,
      SafeMath.eq(tokenB?.contract, 0)
    );
    console.log(`submitHandler amountADesired`, amountADesired);
    console.log(`submitHandler amountBDesired`, amountBDesired);
    let result;
    if (SafeMath.eq(tokenA?.contract, 0)) {
      // tokenB && ETH
      result = await this.addLiquidityETH(
        tokenB,
        amountBDesired,
        amountADesired,
        slippage,
        deadline
      );
    } else if (SafeMath.eq(tokenB?.contract, 0)) {
      // tokenA && ETH
      result = await this.addLiquidityETH(
        tokenA,
        amountADesired,
        amountBDesired,
        slippage,
        deadline
      );
    }
    let pool = this.poolList.find(
      (pool) =>
        pool.token0Contract.toLowerCase() === tokenA?.contract.toLowerCase() &&
        pool.token1Contract.toLowerCase() === tokenB?.contract.toLowerCase()
    );
    console.log(`submitHandler pool`, pool);
    if (pool) {
      // tokenA && tokenB
      result = await this.addLiquidity(
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired,
        slippage,
        deadline
      );
    } else {
      let reservePool = this.poolList.find(
        (pool) =>
          pool.token1Contract.toLowerCase() ===
            tokenA?.contract.toLowerCase() &&
          pool.token0Contract.toLowerCase() === tokenB?.contract.toLowerCase()
      );
      console.log(`submitHandler reservePool`, reservePool);
      if (reservePool) {
        // tokenB && tokenA
        result = await this.addLiquidity(
          tokenB,
          tokenA,
          amountBDesired,
          amountADesired,
          slippage,
          deadline
        );
      } else {
        result = await this.addLiquidity(
          tokenA,
          tokenB,
          amountADesired,
          amountBDesired,
          slippage,
          deadline
        );
      }
    }
  }
  async swapExactTokensForETH(amountIn, amountOut, tokens, slippage, deadline) {
    if (!this.nativeCurrency?.contract) {
      await this.getNativeCurrency();
    }
    const funcName =
      "swapExactTokensForETH(uint256,uint256,address[],address,uint256)";
    const funcNameHex = `0x${keccak256(funcName).toString("hex").slice(0, 8)}`;
    const amountInData = SafeMath.toSmallestUnitHex(
      amountIn,
      tokens[0].decimals
    )
      .split(".")[0]
      .padStart(64, "0");
    const amountOutMin = SafeMath.toHex(
      Math.floor(
        SafeMath.mult(
          SafeMath.toSmallestUnit(
            amountOut,
            tokens[tokens.length - 1].decimals
          ),
          SafeMath.minus("1", SafeMath.div(slippage || "0.5", "100"))
        )
      )
    ).padStart(64, "0");
    const toData = this.connectedAccount?.contract
      .replace("0x", "")
      .padStart(64, "0");
    const dateline = SafeMath.toHex(
      SafeMath.plus(
        Math.round(SafeMath.div(Date.now(), 1000)),
        SafeMath.mult(deadline || "30", 60)
      )
    ).padStart(64, "0");
    const addressCount = SafeMath.toHex(tokens.length + 1).padStart(64, "0");
    const tokensContractData = [...tokens, this.nativeCurrency].reduce(
      (acc, token) => acc + token.contract.replace("0x", "").padStart(64, "0"),
      ""
    );

    const data =
      funcNameHex +
      amountInData +
      amountOutMin +
      "00000000000000000000000000000000000000000000000000000000000000a0" +
      toData +
      dateline +
      addressCount +
      tokensContractData;
    const value = 0;
    const transaction = {
      to: this.routerContract,
      amount: value,
      data,
    };
    try {
      const result = await this.lunar.send(transaction);
      const history = this.updateHistory({
        id: `${this.network.chainId}-${result.toString()}`,
        type: transactionType.SWAPS,
        transactionHash: result.toString(),
        chainId: this.network.chainId,
        token0: tokens[0],
        token1: this.assetList.find((asset) =>
          SafeMath.eq(asset.contract, "0")
        ),
        token0AmountChange: SafeMath.mult(
          amountIn,
          SafeMath.minus("1", SafeMath.div(slippage || "0.5", "100"))
        ),
        token1AmountChange: SafeMath.mult(
          amountOut,
          SafeMath.minus("1", SafeMath.div(slippage || "0.5", "100"))
        ),
        timestamp: Date.now(),
        pending: true,
      });
      this.updateHistories(history);
      const msg = {
        evt: `UpdateHistories`,
        data: this.histories,
      };

      this.messenger.next(msg);
      console.log(`swapExactETHForTokens result`, result);
      return result;
    } catch (error) {
      console.log(`swapExactETHForTokens error`, error);
    }
  }

  async swapExactETHForTokens(amountIn, amountOut, tokens, slippage, deadline) {
    if (!this.nativeCurrency?.contract) {
      await this.getNativeCurrency();
    }
    const funcName = "swapExactETHForTokens(uint256,address[],address,uint256)";
    const funcNameHex = `0x${keccak256(funcName).toString("hex").slice(0, 8)}`;
    const amountOutMin = SafeMath.toHex(
      Math.floor(
        SafeMath.mult(
          SafeMath.toSmallestUnit(
            amountOut,
            tokens[tokens.length - 1].decimals
          ),
          SafeMath.minus("1", SafeMath.div(slippage || "0.5", "100"))
        )
      )
    ).padStart(64, "0");
    const toData = this.connectedAccount?.contract
      .replace("0x", "")
      .padStart(64, "0");
    const dateline = SafeMath.toHex(
      SafeMath.plus(
        Math.round(SafeMath.div(Date.now(), 1000)),
        SafeMath.mult(deadline || "30", 60)
      )
    ).padStart(64, "0");
    const addressCount = SafeMath.toHex(tokens.length + 1).padStart(64, "0");
    const tokensContractData = [this.nativeCurrency, ...tokens].reduce(
      (acc, token) => acc + token.contract.replace("0x", "").padStart(64, "0"),
      ""
    );
    const data =
      funcNameHex +
      amountOutMin +
      "0000000000000000000000000000000000000000000000000000000000000080" +
      toData +
      dateline +
      addressCount +
      tokensContractData;

    const transaction = {
      to: this.routerContract,
      amount: amountIn,
      data,
    };
    try {
      const result = await this.lunar.send(transaction);
      console.log(`swapExactETHForTokens result`, result);
      const history = this.updateHistory({
        id: `${this.network.chainId}-${result.toString()}`,
        type: transactionType.SWAPS,
        transactionHash: result.toString(),
        chainId: this.network.chainId,
        token0: this.assetList.find((asset) =>
          SafeMath.eq(asset.contract, "0")
        ),
        token1: tokens[tokens.length - 1],
        token0AmountChange: SafeMath.mult(
          amountIn,
          SafeMath.minus("1", SafeMath.div(slippage || "0.5", "100"))
        ),
        token1AmountChange: SafeMath.mult(
          amountOut,
          SafeMath.minus("1", SafeMath.div(slippage || "0.5", "100"))
        ),
        timestamp: Date.now(),
        pending: true,
      });
      this.updateHistories(history);
      const msg = {
        evt: `UpdateHistories`,
        data: this.histories,
      };

      this.messenger.next(msg);
      console.log(`swapExactETHForTokens result`, result);
      return result;
    } catch (error) {
      console.log(`swapExactETHForTokens error`, error);
    }
  }

  async swap(amountIn, amountOut, tokens, slippage, deadline) {
    if (!this.nativeCurrency?.contract) {
      await this.getNativeCurrency();
    }
    const funcName =
      "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)";
    const funcNameHex = `0x${keccak256(funcName).toString("hex").slice(0, 8)}`;
    const amountInData = SafeMath.toSmallestUnitHex(
      amountIn,
      tokens[0].decimals
    )
      .split(".")[0]
      .padStart(64, "0");
    const amountOutMin = SafeMath.toHex(
      Math.floor(
        SafeMath.mult(
          SafeMath.toSmallestUnit(
            amountOut,
            tokens[tokens.length - 1].decimals
          ),
          SafeMath.minus("1", SafeMath.div(slippage || "0.5", "100"))
        )
      )
    ).padStart(64, "0");
    const toData = this.connectedAccount?.contract
      .replace("0x", "")
      .padStart(64, "0");
    const dateline = SafeMath.toHex(
      SafeMath.plus(
        Math.round(SafeMath.div(Date.now(), 1000)),
        SafeMath.mult(deadline || "30", 60)
      )
    ).padStart(64, "0");
    const addressCount = SafeMath.toHex(tokens.length).padStart(64, "0");
    const tokensContractData = tokens.reduce(
      (acc, token) => acc + token.contract.replace("0x", "").padStart(64, "0"),
      ""
    );
    // const amountInTokenContractData = amountInToken.contract
    //   .replace("0x", "")
    //   .padStart(64, "0");
    // const nativeCurrencyContractData = this.nativeCurrency.contract
    //   .replace("0x", "")
    //   .padStart(64, "0");
    // const amountOutTokenContractData = amountOutToken.contract
    //   .replace("0x", "")
    //   .padStart(64, "0");
    const data =
      funcNameHex +
      amountInData +
      amountOutMin +
      "00000000000000000000000000000000000000000000000000000000000000a0" +
      toData +
      dateline +
      addressCount +
      tokensContractData;
    const value = 0;
    const transaction = {
      to: this.routerContract,
      amount: value,
      data,
    };
    try {
      const result = await this.lunar.send(transaction);
      console.log(`swap result`, result);
      const history = this.updateHistory({
        id: `${this.network.chainId}-${result.toString()}`,
        type: transactionType.SWAPS,
        transactionHash: result.toString(),
        chainId: this.network.chainId,
        token0: tokens[0],
        token1: tokens[tokens.length - 1],
        token0AmountChange: SafeMath.mult(
          amountIn,
          SafeMath.minus("1", SafeMath.div(slippage || "0.5", "100"))
        ),
        token1AmountChange: SafeMath.mult(
          amountOut,
          SafeMath.minus("1", SafeMath.div(slippage || "0.5", "100"))
        ),
        timestamp: Date.now(),
        pending: true,
      });
      this.updateHistories(history);
      const msg = {
        evt: `UpdateHistories`,
        data: this.histories,
      };

      this.messenger.next(msg);
      console.log(`swapExactETHForTokens result`, result);
      return result;
    } catch (error) {
      console.log(`swapExactTokensForTokens error`, error);
    }
  }

  async removeLiquidityETH(
    poolPair,
    token,
    liquidity,
    amountToken,
    amountETH,
    slippage,
    deadline
  ) {
    console.log(`removeLiquidityETH slippage`, slippage);
    console.log(`removeLiquidityETH deadline`, deadline);
    const funcName =
      "removeLiquidityETH(address,uint256,uint256,uint256,address,uint256)";
    const funcNameHex = `0x${keccak256(funcName).toString("hex").slice(0, 8)}`;
    const tokenContractData = token.contract
      .replace("0x", "")
      .padStart(64, "0");
    const liquidityData = SafeMath.toSmallestUnitHex(
      liquidity,
      poolPair.decimals
    )
      .split(".")[0]
      .padStart(64, "0");
    const amountTokenMinData = SafeMath.toHex(
      Math.floor(
        SafeMath.mult(
          SafeMath.toSmallestUnit(amountToken, token.decimals),
          SafeMath.minus("1", SafeMath.div(slippage || "5", "100"))
        )
      )
    ).padStart(64, "0");
    const amountETHMinData = SafeMath.toHex(
      Math.floor(
        SafeMath.mult(
          SafeMath.toSmallestUnit(amountETH, 18),
          SafeMath.minus("1", SafeMath.div(slippage || "5", "100"))
        )
      )
    ).padStart(64, "0");
    const toData = this.connectedAccount?.contract
      .replace("0x", "")
      .padStart(64, "0");
    const dateline = SafeMath.toHex(
      SafeMath.plus(
        Math.round(SafeMath.div(Date.now(), 1000)),
        SafeMath.mult(deadline || "30", 60)
      )
    ).padStart(64, "0");
    const data =
      funcNameHex +
      tokenContractData +
      liquidityData +
      amountTokenMinData +
      amountETHMinData +
      toData +
      dateline;
    /**
     * 0x02751cec
     * 0000000000000000000000006c7723e2af31834e32c528305f68ef235e9117d1
     * 0000000000000000000000000000000000000000000000000de0b6b3a7640000
     * 0000000000000000000000000000000000000000000000007b4555e9e17d0820
     * 000000000000000000000000000000000000000000000000019568d142f70b12
     * 000000000000000000000000fc657daf7d901982a75ee4ecd4bdcf93bd767ca4
     * 0000000000000000000000000000000000000000000000000000000061b87fb0
     */
    const value = 0;
    const transaction = {
      to: this.routerContract,
      amount: value,
      data,
    };
    try {
      const result = await this.lunar.send(transaction);
      console.log(`removeLiquidityETH result`, result);
      const history = this.updateHistory({
        id: `${this.network.chainId}-${result.toString()}`,
        type: transactionType.REMOVES,
        transactionHash: result.toString(),
        chainId: this.network.chainId,
        token0: token,
        token1: this.assetList.find((asset) =>
          SafeMath.eq(asset.contract, "0")
        ),
        token0AmountChange: SafeMath.mult(
          amountToken,
          SafeMath.minus("1", SafeMath.div(slippage || "5", "100"))
        ),
        token1AmountChange: SafeMath.mult(
          amountETH,
          SafeMath.minus("1", SafeMath.div(slippage || "5", "100"))
        ),
        timestamp: Date.now(),
        pending: true,
      });
      console.log(`removeLiquidityETH result`, result);
      this.updateHistories(history);
      const msg = {
        evt: `UpdateHistories`,
        data: this.histories,
      };

      this.messenger.next(msg);
      return result;
    } catch (error) {
      console.log(`removeLiquidityETH error`, error);
    }
  }

  async takeLiquidity(
    poolPair,
    liquidity,
    amount0,
    amount1,
    slippage,
    deadline
  ) {
    console.log(`removeLiquidityETH slippage`, slippage);
    console.log(`removeLiquidityETH deadline`, deadline);
    const funcName =
      "removeLiquidity(address,address,uint256,uint256,uint256,address,uint256)";
    const funcNameHex = `0x${keccak256(funcName).toString("hex").slice(0, 8)}`;
    const token0ContractData = poolPair.token0.contract
      .replace("0x", "")
      .padStart(64, "0");
    const token1ContractData = poolPair.token1.contract
      .replace("0x", "")
      .padStart(64, "0");
    const liquidityData = SafeMath.toSmallestUnitHex(
      liquidity,
      poolPair.decimals
    )
      .split(".")[0]
      .padStart(64, "0");
    const amount0MinData = SafeMath.toHex(
      Math.floor(
        SafeMath.mult(
          SafeMath.toSmallestUnit(amount0, poolPair.token0.decimals),
          SafeMath.minus("1", SafeMath.div(slippage || "5", "100"))
        )
      )
    ).padStart(64, "0");
    const amount1MinData = SafeMath.toHex(
      Math.floor(
        SafeMath.mult(
          SafeMath.toSmallestUnit(amount1, poolPair.token1.decimals),
          SafeMath.minus("1", SafeMath.div(slippage || "5", "100"))
        )
      )
    ).padStart(64, "0");

    const toData = this.connectedAccount?.contract
      .replace("0x", "")
      .padStart(64, "0");
    const dateline = SafeMath.toHex(
      SafeMath.plus(
        Math.round(SafeMath.div(Date.now(), 1000)),
        SafeMath.mult(deadline || "30", 60)
      )
    ).padStart(64, "0");
    const data =
      funcNameHex +
      token0ContractData +
      token1ContractData +
      liquidityData +
      amount0MinData +
      amount1MinData +
      toData +
      dateline;
    const value = 0;
    const transaction = {
      to: this.routerContract,
      amount: value,
      data,
    };
    try {
      const result = await this.lunar.send(transaction);
      console.log(`takeLiquidity result`, result);
      const history = this.updateHistory({
        id: `${this.network.chainId}-${result.toString()}`,
        type: transactionType.REMOVES,
        transactionHash: result.toString(),
        chainId: this.network.chainId,
        token0: poolPair.token0,
        token1: poolPair.token1,
        token0AmountChange: SafeMath.mult(
          amount0,
          SafeMath.minus("1", SafeMath.div(slippage || "5", "100"))
        ),
        token1AmountChange: SafeMath.mult(
          amount1,
          SafeMath.minus("1", SafeMath.div(slippage || "5", "100"))
        ),
        timestamp: Date.now(),
        pending: true,
      });
      this.updateHistories(history);
      const msg = {
        evt: `UpdateHistories`,
        data: this.histories,
      };

      this.messenger.next(msg);
      return result;
    } catch (error) {
      console.log(`takeLiquidity error`, error);
    }
  }
}

export default TideTimeSwapContract;
