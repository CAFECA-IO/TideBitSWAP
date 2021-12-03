import Lunar from "@cafeca/lunar";
import imTokenImg from "../resources/imToken.png";
import keccak256 from "keccak256";
import SafeMath from "../Utils/safe-math";
import {
  dateFormatter,
  hexToAscii,
  randomID,
  sliceData,
  to,
} from "../Utils/utils";
// import { poolTypes } from "../constant/constant";
import erc20 from "../resources/erc20.png";
import {
  BinanceSwapRouter,
  TideBitSwapRouter,
  transactionType,
} from "../constant/constant";
import { eth_call } from "../Utils/ethereum";
import TideTimeSwapCommunicator from "./TideTimeSwapCommunicator";
import { faDesktop } from "@fortawesome/free-solid-svg-icons";
// import { openInNewTab } from "../Utils/utils";

class TideTimeSwapContract {
  constructor(network) {
    this.lunar = new Lunar();
    this.api = {
      apiURL: "",
      apiKey: "",
      apiSecret: "",
    };
    this.communicator = new TideTimeSwapCommunicator(this.api);
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
    const contract = await this.getData(`WETH()`, null, this.routerContract);
    this.nativeCurrency = {
      contract: `0x${contract.slice(26, 66)}`,
      decimals: this.network.nativeCurrency.decimals,
      symbol: this.network.nativeCurrency.symbol,
    };
    if (this.isConnected && this.connectedAccount) {
      const balanceOf = await this.getBalance({
        contract,
        address: this.connectedAccount?.contract,
      });
      this.nativeCurrency = {
        ...this.nativeCurrency,
        balanceOf,
      };
    }
    console.log(`this.getNativeCurrency`, this.nativeCurrency);
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
    this.isConnected = false;
    await this.lunar.disconnect();
    this.poolList = this.poolList.map((pool) => ({
      ...pool,
      balanceOf: 0,
      share: 0,
      balanceOfToken0InPool: 0,
      balanceOfToken1InPool: 0,
    }));
    this.assetList = this.assetList.map((asset) => ({
      ...asset,
      balanceOf: 0,
    }));
  }

  async connect(appName) {
    if (this.nativeCurrency?.contract) {
      await this.getNativeCurrency();
    }
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
      this.connectedAccount = {
        contract: this.lunar.address,
        balanceOf: await this.getBalance({
          address: this.lunar.address,
        }),
      };
      console.log(`connect connectedAccount`, this.connectedAccount);

      let balanceOf = await this.getBalance({
        contract: this.nativeCurrency.contract,
        address: this.connectedAccount?.contract,
      });
      this.nativeCurrency = {
        ...this.nativeCurrency,
        balanceOf,
      };
      console.log(`this.nativeCurrency`, this.nativeCurrency);

      return {
        connectedAccount: this.connectedAccount,
      };
    } catch (error) {
      console.log(`connect in TideTimeSwapContract`, error);
      throw error;
    }
  }
  async getPoolContractByTokens(token0Contract, token1Contract) {
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
      const data = address.replace("0x", "").padStart(64, "0");
      const result = await this.getData(`balanceOf(address)`, data, contract);
      balanceOf = parseInt(result, 16);
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
      console.log(error);
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

  async getPoolBalanceOf(pool, index) {
    let i;
    if (index)
      i =
        this.poolList[index].poolContract === pool.poolContract ? index : null;
    else
      i = this.poolList.findIndex((p) => pool.poolContract === p.poolContract);
    // const result = await this.getBalance({
    //   contract: pool.poolContract,
    //   address: this.connectedAccount?.contract,
    // });
    // const balanceOf = SafeMath.toCurrencyUint(
    //   parseInt(result, 16),
    //   pool.decimals
    // );
    if (this.connectedAccount || this.lunar.address) {
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
      console.log(`balanceOf`, balanceOf);
      const share = SafeMath.gt(pool.totalSupply, "0")
        ? SafeMath.div(balanceOf, pool.totalSupply)
        : "0";
      const balanceOfToken0InPool = SafeMath.gt(share, "0")
        ? SafeMath.mult(share, pool.poolBalanceOfToken0)
        : "0";

      const balanceOfToken1InPool = SafeMath.gt(share, "0")
        ? SafeMath.mult(share, pool.poolBalanceOfToken1)
        : "0";

      const updatePool = {
        ...pool,
        balanceOf,
        share,
        balanceOfToken0InPool,
        balanceOfToken1InPool,
      };

      this.poolList[i] = updatePool;
      return updatePool;
    }
    return pool;
  }

  async getAssetBalanceOf(token, index) {
    const balanceOf = SafeMath.gt(token.contract, 0)
      ? await this.getBalance({
          contract: token.contract,
          address: this.connectedAccount?.contract,
        })
      : await this.getBalance({
          address: this.connectedAccount?.contract,
        });

    const updateAsset = {
      ...token,
      balanceOf,
    };
    this.updateAssets(updateAsset, index);
    return updateAsset;
  }

  async updatePools(pool, index) {
    let i;
    if (index && SafeMath.gt(this.poolList.length, SafeMath.minus(index, 1)))
      i =
        this.poolList[index].poolContract === pool.poolContract ? index : null;
    else
      i = this.poolList.findIndex((t) => pool.poolContract === t.poolContract);
    if (i === -1) {
      this.poolList = this.poolList.concat(pool);
      console.log(`this.poolList`, this.poolList);
    } else {
      this.poolList[i] = pool;
      console.log(`this.poolList`, this.poolList);
    }
  }

  async updateAssets(token, index) {
    let i;
    if (index)
      i = this.assetList[index].contract === token.contract ? index : null;
    else i = this.assetList.findIndex((t) => token.contract === t.contract);
    if (i === -1) {
      this.assetList = this.assetList.concat(token);
    } else {
      this.assetList[i] = token;
    }
  }
  // requestCounts: 6
  async searchToken(contract) {
    let token, symbol, decimals, totalSupply, name;
    const index = this.assetList.findIndex(
      (token) => token.contract.toLowerCase() === contract.toLowerCase()
    );
    if (index !== -1) return this.assetList[index];
    try {
      token = await this.communicator.searchToken(
        this.network.chainId,
        contract
      );
      token.iconSrc = SafeMath.eq(contract, 0)
        ? "https://www.tidebit.one/icons/eth.png"
        : erc20;
      console.log(token);
    } catch (error) {
      console.log(error);
      try {
        const result = await this.lunar.getAsset({
          contract: contract,
        });
        symbol = result.symbol;
        decimals = result.decimals;
        totalSupply = result.totalSupply;
        name = result.name;
      } catch (error) {
        console.log(error);
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
    // token = await this.getTokenByContract(contract);
    const detail = await this.getTokenDetail(token);
    token = { ...token, ...detail };
    await this.updateAssets(token);
    if (this.isConnected && this.connectedAccount) {
      token = await this.getAssetBalanceOf(token);
    }
    // const
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
    console.log(`getPoolDetail`, detail);

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

  // requestCounts: 14
  async getPoolByIndex(index) {
    // requestCounts: 1
    const poolContract = await this.getPoolContractByIndex(index);

    // requestCounts: 11
    const pool = await this.searchPool({ index, poolContract });

    return pool;
  }

  async getContractData(index) {
    await this.getPoolByIndex(index);

    return {
      poolList: this.poolList,
      assetList: this.assetList,
    };
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

  async getPriceData(tokenContract) {
    try {
      const result = await this.communicator.priceData(
        this.network.chainId,
        tokenContract
      );
      const priceData = result.map((data) => ({
        ...data,
        date: new Date(data.x),
      }));
      console.log(`priceData`, priceData);
      return priceData;
    } catch (error) {
      console.log(error);
    }
  }

  async getTVLHistory() {
    try {
      const result = await this.communicator.tvlHistory(this.network.chainId);
      const tvlData = result.map((data) => ({
        ...data,
        date: dateFormatter(data.date).day,
      }));

      return tvlData;
    } catch (error) {
      console.log(error);
    }
  }

  async getVolumeData() {
    try {
      const result = await this.communicator.volume24hr(this.network.chainId);
      const tvlData = result.map((data) => ({
        ...data,
        date: dateFormatter(data.date).day,
      }));

      return tvlData;
    } catch (error) {
      console.log(error);
    }
  }

  async getSupportedTokens() {
    try {
      const tokens = await this.communicator.tokenList(this.network.chainId);
      tokens.forEach(async (token) => {
        const detail = await this.getTokenDetail(token);
        await this.updateAssets({
          ...token,
          ...detail,
          iconSrc: SafeMath.eq(token.contract, 0)
            ? "https://www.tidebit.one/icons/eth.png"
            : erc20,
        });
        return { ...token, ...detail };
      });
      console.log(`getSupportedTokens this.assetList`, this.assetLis);
      return this.assetLis;
    } catch (error) {
      console.log(error);
    }
  }

  async getSupportedPools() {
    try {
      const pools = await this.communicator.poolList(this.network.chainId);
      this.poolList = pools.map(async (pool) => {
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

        const poolBalanceOfToken0 = SafeMath.toCurrencyUint(
          SafeMath.toBn(pool.reserve0),
          token0.decimals
        );
        const poolBalanceOfToken1 = SafeMath.toCurrencyUint(
          SafeMath.toBn(pool.reserve1),
          token1.decimals
        );
        return {
          ...pool,
          token0,
          token1,
          poolBalanceOfToken0,
          poolBalanceOfToken1,
          name: `${token0.symbol}/${token1.symbol}`,
        };
      });
      console.log(`getSupportedPools this.poolList`, this.poolList);
      return this.poolList;
    } catch (error) {
      console.log(error);
    }
  }

  // requestCounts: 6
  async searchPool({ index, poolContract, token0Contract, token1Contract }) {
    //
    let i, poolBalanceOfToken0, poolBalanceOfToken1;

    if (poolContract)
      i = this.poolList.findIndex(
        (pool) => pool.poolContract.toLowerCase() === poolContract.toLowerCase()
      );
    else if (!poolContract && token0Contract && token1Contract) {
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
    }
    console.log(`searchPoo`, i !== -1 ? this.poolList[i] : null);
    if (i !== -1) return this.poolList[i];

    console.log(`poolContract`, poolContract);
    poolContract = !poolContract
      ? await this.getPoolContractByTokens(
          SafeMath.eq(token0Contract, 0)
            ? this.nativeCurrency.contract
            : token0Contract,
          SafeMath.eq(token1Contract, 0)
            ? this.nativeCurrency.contract
            : token1Contract
        )
      : poolContract;
    console.log(`poolContract`, poolContract);
    // requestCounts: 1
    token0Contract = await this.getPoolTokenContract(0, poolContract);
    // requestCounts: 1
    token1Contract = await this.getPoolTokenContract(1, poolContract);

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

    let pool;
    try {
      pool = await this.communicator.searchPool(
        this.network.chainId,
        token0Contract,
        token1Contract
      );
      const poolBalanceOfToken0 = SafeMath.toCurrencyUint(
        SafeMath.toBn(pool.reserve0),
        token0.decimals
      );
      const poolBalanceOfToken1 = SafeMath.toCurrencyUint(
        SafeMath.toBn(pool.reserve1),
        token1.decimals
      );
      pool = {
        ...pool,
        token0,
        token1,
        poolBalanceOfToken0,
        poolBalanceOfToken1,
        name: `${token0.symbol}/${token1.symbol}`,
      };
      console.log(pool);
      throw Error(); // --TEST
    } catch (error) {
      console.log(error);
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
        token0: token0,
        token1: token1,
        poolBalanceOfToken0,
        poolBalanceOfToken1,
        name: `${token0.symbol}/${token1.symbol}`,
        ...detail,
      };
    }

    await this.updatePools(pool, index);
    if (this.isConnected && this.connectedAccount) {
      pool = await this.getPoolBalanceOf(pool);
    }
    return pool;
  }

  async getAmountsIn(amountOut, tokens) {
    const funcName = "getAmountsIn(uint256,address[])"; // 0xd06ca61f
    const amountOutData = SafeMath.toSmallestUnitHex(
      amountOut,
      tokens[tokens.length - 1].decimals
    )
      .split(".")[0]
      .padStart(64, "0");
    const addressCount = SafeMath.toHex(tokens.length).padStart(64, "0");
    // const amountInTokenContractData = tokens[0].contract
    //   .replace("0x", "")
    //   .padStart(64, "0");
    // const nativeCurrencyContractData = this.nativeCurrency.contract
    //   .replace("0x", "")
    //   .padStart(64, "0");
    // const amountOutTokenContractData = tokens[tokens.length - 1].contract
    //   .replace("0x", "")
    //   .padStart(64, "0");
    const tokensContractData = tokens.reduce(
      (acc, token) =>
        acc + SafeMath.gt(token.contract, "0")
          ? token.contract.replace("0x", "").padStart(64, "0")
          : this.nativeCurrency.contract.replace("0x", "").padStart(64, "0"),
      ""
    );
    const data =
      amountOutData +
      "0000000000000000000000000000000000000000000000000000000000000040" +
      addressCount +
      tokensContractData;
    // amountInTokenContractData +
    // nativeCurrencyContractData +
    // amountOutTokenContractData;
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
  }
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
    return SafeMath.gt(allowanceAmount, amount);
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
  async updateAsset(token) {}
  async updateHistory({
    type,
    token0,
    token0AmountChange,
    token1,
    token1AmountChange,
    timestamp,
  }) {
    const history = {
      id: randomID(6),
      type,
      tokenA: {
        symbol: token0.symbol,
        amount: token0AmountChange,
      },
      tokenB: {
        symbol: token1?.symbol || "--",
        amount: token1AmountChange || "--",
      },
      time: dateFormatter(timestamp),
    };
    this.histories.push(history);
    return history;
  }
  async updatePool({
    type,
    poolPair,
    liquidity,
    token0,
    token0AmountChange,
    token1,
    token1AmountChange,
  }) {
    let index, updatePool;
    switch (type) {
      case transactionType.SWAPS:
        break;
      case transactionType.ADDS:
        break;
      case transactionType.REMOVES:
        index = this.poolList.findIndex(
          (pool) => pool.poolContract === poolPair.contract
        );
        updatePool = { ...this.poolList[index] };
        updatePool.balanceOf = SafeMath.minus(poolPair.balanceOf, liquidity);
        updatePool.share = SafeMath.div(
          updatePool.balanceOf,
          updatePool.totalSupply
        );
        updatePool.balanceOfToken0InPool = SafeMath.minus(
          poolPair.balanceOfToken0InPool,
          token0AmountChange
        );
        updatePool.balanceOfToken1InPool = SafeMath.minus(
          poolPair.balanceOfToken1InPool,
          token1AmountChange
        );
        this.poolList[index] = updatePool;
        return updatePool;
      default:
    }
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
  async addLiquidityETH(token, amountToken, amountETH) {
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
          "0.95"
        )
      )
    ).padStart(64, "0");
    console.log(`amountTokenMin`, amountTokenMin);

    const amountETHMin = SafeMath.toSmallestUnitHex(amountETH, 18)
      .split(".")[0]
      .padStart(64, "0");

    console.log(`amountETHMin`, amountETHMin);
    const toData = this.connectedAccount?.contract
      .replace("0x", "")
      .padStart(64, "0");
    const dateline = SafeMath.toHex(
      SafeMath.plus(Math.round(SafeMath.div(Date.now(), 1000)), 1800)
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

    const transaction = {
      to: this.routerContract,
      amount: amountETH,
      data,
    };
    try {
      const result = await this.lunar.send(transaction);
      console.log(`addLiquidityETH result`, result);
    } catch (error) {
      console.log(error);
    }
  }
  getTokenAAmount(tokenA, tokenB, amountBDesired) {
    let pool, amountADesired;
    pool = this.searchPool({
      token0Contract: tokenA.contract,
      token1Contract: tokenB.contract,
    });
    if (pool) {
      amountADesired =
        pool.token0.contract.toLowerCase() === tokenA.contract.toLowerCase()
          ? SafeMath.mult(
              SafeMath.div(pool.poolBalanceOfToken0, pool.poolBalanceOfToken1),
              amountBDesired
            )
          : SafeMath.mult(
              SafeMath.div(pool.poolBalanceOfToken1, pool.poolBalanceOfToken0),
              amountBDesired
            );
    }
    return { pool, amountADesired };
  }
  getTokenBAmount(tokenA, tokenB, amountADesired) {
    let pool, amountBDesired;
    pool = this.searchPool({
      token0Contract: tokenA.contract,
      token1Contract: tokenB.contract,
    });
    if (pool) {
      amountBDesired =
        pool.token0.contract.toLowerCase() === tokenA.contract.toLowerCase()
          ? SafeMath.mult(
              SafeMath.div(pool.poolBalanceOfToken1, pool.poolBalanceOfToken0),
              amountADesired
            )
          : SafeMath.mult(
              SafeMath.div(pool.poolBalanceOfToken0, pool.poolBalanceOfToken1),
              amountADesired
            );
    }
    return { pool, tokenA, tokenB, amountADesired, amountBDesired };
  }
  async addLiquidity(tokenA, tokenB, amountADesired, amountBDesired) {
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
          "0.95"
        )
      )
    ).padStart(64, "0");
    const amountBMinData = SafeMath.toHex(
      Math.floor(
        SafeMath.mult(
          SafeMath.toSmallestUnit(amountBDesired, tokenB.decimals),
          "0.95"
        )
      )
    ).padStart(64, "0");
    const toData = this.connectedAccount?.contract
      .replace("0x", "")
      .padStart(64, "0");
    const dateline = SafeMath.toHex(
      SafeMath.plus(Math.round(SafeMath.div(Date.now(), 1000)), 1800)
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
    const value = 0;
    const transaction = {
      to: this.routerContract,
      amount: value,
      data,
    };
    try {
      const result = await this.lunar.send(transaction);
      console.log(`addLiquidity result`, result);
      return result;
    } catch (error) {
      console.log(error);
    }
  }
  async provideLiquidity(tokenA, tokenB, amountADesired, amountBDesired) {
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
          "0.95"
        )
      )
    ).padStart(64, "0");
    const amountBMinData = SafeMath.toHex(
      Math.floor(
        SafeMath.mult(
          SafeMath.toSmallestUnit(amountBDesired, tokenB.decimals),
          "0.95"
        )
      )
    ).padStart(64, "0");
    const toData = this.connectedAccount?.contract
      .replace("0x", "")
      .padStart(64, "0");
    const dateline = SafeMath.toHex(
      SafeMath.plus(Math.round(SafeMath.div(Date.now(), 1000)), 1800)
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
    const value = 0;
    const transaction = {
      to: this.routerContract,
      amount: value,
      data,
    };
    try {
      const result = await this.lunar.send(transaction);
      console.log(`addLiquidity result`, result);
      return result;
    } catch (error) {
      console.log(error);
    }
  }
  async swapExactTokensForETH(amountIn, amountOut, tokens) {
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
          SafeMath.toSmallestUnit(amountOut, tokens[0].decimals),
          "0.995"
        )
      )
    ).padStart(64, "0");
    const toData = this.connectedAccount?.contract
      .replace("0x", "")
      .padStart(64, "0");
    const dateline = SafeMath.toHex(
      SafeMath.plus(Math.round(SafeMath.div(Date.now(), 1000)), 1800)
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
      console.log(`swapExactETHForTokens result`, result);
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async swapExactETHForTokens(amountIn, amountOut, tokens) {
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
          "0.995"
        )
      )
    ).padStart(64, "0");
    const toData = this.connectedAccount?.contract
      .replace("0x", "")
      .padStart(64, "0");
    const dateline = SafeMath.toHex(
      SafeMath.plus(Math.round(SafeMath.div(Date.now(), 1000)), 1800)
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
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async swap(amountIn, amountOut, tokens) {
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
    const amountOutData = SafeMath.toSmallestUnitHex(
      amountOut,
      tokens[tokens.length - 1].decimals
    )
      .split(".")[0]
      .padStart(64, "0");
    const toData = this.connectedAccount?.contract
      .replace("0x", "")
      .padStart(64, "0");
    const dateline = SafeMath.toHex(
      SafeMath.plus(Math.round(SafeMath.div(Date.now(), 1000)), 1800)
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
      amountOutData +
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
      // TODO
      // updateAsset
      let index = this.assetList.findIndex(
        (asset) => asset.contract === tokens[0].contract
      );
      let updateTokenIn = { ...this.assetList[index] };
      updateTokenIn.balanceOf = SafeMath.minus(tokens[0].balanceOf, amountIn);
      this.assetList[index] = updateTokenIn;
      index = this.assetList.findIndex(
        (asset) => asset.contract === tokens[tokens.length - 1].contract
      );
      let updateTokenOut = { ...this.assetList[index] };
      updateTokenOut.balanceOf = SafeMath.plus(
        tokens[tokens.length - 1].balanceOf,
        amountOut
      );
      this.assetList[index] = updateTokenOut;
      // updatePool

      // updateHistory
      this.updateHistory({
        type: transactionType.SWAPS,
        token0: tokens[0],
        token0AmountChange: `-${amountIn}`,
        token1: tokens[tokens.length - 1],
        token1AmountChange: `${amountOut}`,
        timestamp: Date.now(),
      });
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async removeLiquidityETH(poolPair, token, liquidity, amountToken, amountETH) {
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
          "0.95"
        )
      )
    ).padStart(64, "0");
    const amountETHMinData = SafeMath.toHex(
      Math.floor(SafeMath.mult(SafeMath.toSmallestUnit(amountETH, 18), "0.95"))
    ).padStart(64, "0");
    const toData = this.connectedAccount?.contract
      .replace("0x", "")
      .padStart(64, "0");
    const dateline = SafeMath.toHex(
      SafeMath.plus(Math.round(SafeMath.div(Date.now(), 1000)), 1800)
    ).padStart(64, "0");
    const data =
      funcNameHex +
      tokenContractData +
      liquidityData +
      amountTokenMinData +
      amountETHMinData +
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
      console.log(`removeLiquidityETH result`, result);
      return result;
    } catch (error) {
      console.log(error);
    }
  }
  async takeLiquidity(poolPair, liquidity, amount0Min, amount1Min) {
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
    const amount0MinData = SafeMath.toSmallestUnitHex(
      amount0Min,
      poolPair.token0.decimals
    )
      .split(".")[0]
      .padStart(64, "0");
    const amount1MinData = SafeMath.toSmallestUnitHex(
      amount1Min,
      poolPair.token1.decimals
    )
      .split(".")[0]
      .padStart(64, "0");
    const toData = this.connectedAccount?.contract
      .replace("0x", "")
      .padStart(64, "0");
    const dateline = SafeMath.toHex(
      SafeMath.plus(Math.round(SafeMath.div(Date.now(), 1000)), 1800)
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
      let index = this.assetList.findIndex(
        (asset) => asset.contract === poolPair.token0.contract
      );
      let updateTokenIn = { ...this.assetList[index] };
      updateTokenIn.balanceOf = SafeMath.plus(
        poolPair.token0.balanceOf,
        amount0Min
      );
      this.assetList[index] = updateTokenIn;
      index = this.assetList.findIndex(
        (asset) => asset.contract === poolPair.token1.contract
      );
      let updateTokenOut = { ...this.assetList[index] };
      updateTokenOut.balanceOf = SafeMath.plus(
        poolPair.token1.balanceOf,
        amount1Min
      );
      this.assetList[index] = updateTokenOut;
      // updatePool
      this.updatePool({
        type: transactionType.REMOVES,
        poolPair,
        token0AmountChange: amount0Min,
        token1AmountChange: amount1Min,
      });
      // updateHistory
      this.updateHistory({
        type: transactionType.REMOVES,
        token0: poolPair.token0,
        token0AmountChange: `${amount0Min}`,
        token1:
          poolPair.token1.contract === this.nativeCurrency.contract
            ? null
            : poolPair.token1,
        token1AmountChange:
          poolPair.token1.contract === this.nativeCurrency.contract
            ? null
            : `${amount1Min}`,
        timestamp: Date.now(),
      });
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}

export default TideTimeSwapContract;
