import Lunar from "@cafeca/lunar";
import imTokenImg from "../resources/imToken.png";
import keccak256 from "keccak256";
import SafeMath from "../Utils/safe-math";
import {
  dateFormatter,
  hexToAscii,
  randomID,
  sliceData,
  toDecimals,
} from "../Utils/utils";
// import { poolTypes } from "../constant/constant";
import erc20 from "../resources/erc20.png";
import {
  BinanceSwapRouter,
  TideBitSwapRouter,
  transactionType,
} from "../constant/constant";
import { eth_call } from "../Utils/ethereum";
// import { openInNewTab } from "../Utils/utils";

class TideTimeSwapContract {
  constructor(network) {
    this.lunar = new Lunar();
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
   * @param {String} account
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
        address: this.connectedAccount,
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
      this.connectedAccount = this.lunar.address;
      console.log(`connect connectedAccount`, this.connectedAccount);
      let balanceOf = await this.getBalance({
        contract: this.nativeCurrency.contract,
        address: this.connectedAccount,
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
  async getSelectedPool(supportedPools, active, passive) {
    if (!active || !passive) return;
    const index = supportedPools.findIndex(
      (pool) =>
        (active.contract === pool.token0.contract ||
          active.contract === pool.token1.contract) &&
        (passive.contract === pool.token0.contract ||
          passive.contract === pool.token1.contract)
    );
    console.log(`getSelectedPool findIndex`, index);
    if (index === -1) {
      const poolContract = await this.getPoolContractByTokens(
        active.contract,
        passive.contract
      );
      if (poolContract) {
        // requestCounts: 1
        const token0Contract = await this.getPoolTokenContract(0, poolContract);
        // requestCounts: 1
        const token1Contract = await this.getPoolTokenContract(1, poolContract);
        const pool = await this.getPoolDetail(
          poolContract,
          token0Contract,
          token1Contract
        );
        return pool;
      } else return null;
    }
    return supportedPools[index];
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

  async getTokenByContract(tokenContract) {
    let symbol, decimals, totalSupply, name;

    let token = this.assetList.find(
      (asset) => asset.contract === tokenContract
    );
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
        balance: "--",
        price: {
          value: `${(Math.random() * 100000).toFixed(2)}m`,
          change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
            Math.random() * 1
          ).toFixed(2)}`,
        },
        volume: {
          value: `${(Math.random() * 10).toFixed(2)}m`,
          change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
            Math.random() * 1
          ).toFixed(2)}`,
        },
      };
    }
    return token;
  }

  async getPoolBalanceOf(pool, index) {
    let i;
    if (index)
      i = this.poolList[index].contract === pool.contract ? index : null;
    else i = this.poolList.findIndex((p) => pool.contract === p.contract);
    // const result = await this.getBalance({
    //   contract: pool.contract,
    //   address: this.connectedAccount,
    // });
    // const balanceOf = SafeMath.toCurrencyUint(
    //   parseInt(result, 16),
    //   pool.decimals
    // );
    if (this.connectedAccount || this.lunar.address) {
      const data = (this.connectedAccount || this.lunar.address)
        .replace("0x", "")
        .padStart(64, "0");
      const result = await eth_call(`balanceOf(address)`, data, pool.contract);
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
    const balanceOf = await this.getBalance({
      contract: token.contract,
      address: this.connectedAccount,
    });

    const updateAsset = {
      ...token,
      balanceOf,
    };
    this.updateAssets(updateAsset, index);
    return updateAsset;
  }

  async updateAssets(token, index) {
    let i;
    if (index)
      i = this.assetList[index].contract === token.contract ? index : null;
    else i = this.assetList.findIndex((t) => token.contract === t.contract);
    if (i === -1) {
      this.assetList = this.assetList.concat(token);
      return token;
    } else {
      this.assetList[i] = token;
      return this.assetList[i];
    }
  }
  // requestCounts: 6
  async addToken(contract) {
    // if (/^0x[a-fA-F0-9]{40}$/.test(contract)) return null;
    const index = this.assetList.findIndex(
      (token) => token.contract === contract
    );
    if (index !== -1) return this.assetList[index];
    let token = await this.getTokenByContract(contract);
    token = await this.updateAssets(token);
    if (this.isConnected && this.connectedAccount) {
      token = await this.getAssetBalanceOf(token);
    }
    // const
    return token;
  }

  // requestCounts: 11
  async getPoolDetail(poolContract, token0Contract, token1Contract) {
    // requestCounts: 1

    if (!poolContract) return null;
    // requestCounts: 5
    const token0 = await this.getTokenByContract(token0Contract);
    console.log(`token0`, token0);

    // requestCounts: 5
    const token1 = await this.getTokenByContract(token1Contract);
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
    const pool = {
      id: randomID(6),
      contract: poolContract,
      decimals,
      totalSupply,
      name: `${token0.symbol}/${token1.symbol}`,
      token0,
      token1,
      poolBalanceOfToken0,
      poolBalanceOfToken1,
      liquidity: "--",
      yield: "--",
      volume: {
        value: `${(Math.random() * 10).toFixed(2)}m`,
        change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
          Math.random() * 1
        ).toFixed(2)}`,
      },
      tvl: {
        value: `${(Math.random() * 10).toFixed(2)}m`,
        change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
          Math.random() * 1
        ).toFixed(2)}`,
      },
      irr: "3",
      interest24: `${(Math.random() * 10).toFixed(2)}m`,
    };
    // requestCounts: 1

    return pool;
  }

  // requestCounts: 14
  async getPoolByIndex(index) {
    // requestCounts: 1
    const poolContract = await this.getPoolContractByIndex(index);
    // requestCounts: 1
    const token0Contract = await this.getPoolTokenContract(0, poolContract);
    // requestCounts: 1
    const token1Contract = await this.getPoolTokenContract(1, poolContract);
    // requestCounts: 11
    const pool = await this.getPoolDetail(
      poolContract,
      token0Contract,
      token1Contract
    );
    return pool;
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
    return allPairLength;
  }

  async getContractData(index) {
    const poolPair = await this.getPoolByIndex(index);
    this.poolList.push(poolPair);
    // requestCounts: 1
    await this.updateAssets(poolPair.token0);
    // requestCounts: 1
    await this.updateAssets(poolPair.token1);

    return {
      poolList: this.poolList,
      assetList: this.assetList,
    };
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
      (acc, token) => acc + token.contract.replace("0x", "").padStart(64, "0"),
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
      (acc, token) => acc + token.contract.replace("0x", "").padStart(64, "0"),
      ""
    );
    const data =
      amountInData +
      "0000000000000000000000000000000000000000000000000000000000000040" +
      addressCount +
      tokensContractData;
    // amountInTokenContractData +
    // nativeCurrencyContractData +
    // amountOutTokenContractData;
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
    const ownerData = this.connectedAccount
      ?.replace("0x", "")
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
  async provideLiquidityWithETH(pool, token, amountToken, amountNC) {
    if (!this.nativeCurrency?.contract) {
      await this.getNativeCurrency();
    }
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
    const amountNCMin = SafeMath.toHex(
      Math.floor(
        SafeMath.mult(
          SafeMath.toSmallestUnit(amountNC, this.nativeCurrency.decimals),
          "0.95"
        )
      )
    ).padStart(64, "0");
    console.log(`amountNCMin`, amountNCMin);
    const toData = this.connectedAccount.replace("0x", "").padStart(64, "0");
    const dateline = SafeMath.toHex(
      SafeMath.plus(Math.round(SafeMath.div(Date.now(), 1000)), 1800)
    ).padStart(64, "0");
    const data =
      funcNameHex +
      tokenContractData +
      amountTokenDesired +
      amountTokenMin +
      amountNCMin +
      toData +
      dateline;

    const transaction = {
      to: this.routerContract,
      amount: toDecimals(amountNC, this.nativeCurrency.decimals),
      data,
    };
    try {
      const result = await this.lunar.send(transaction);
      console.log(`provideLiquidityWithETH result`, result);
      // TODO
      // updateAsset
      let index = this.assetList.findIndex(
        (asset) => asset.contract === token.contract
      );
      const updateAsset = { ...this.assetList[index] };
      updateAsset.balanceOf = SafeMath.minus(token.balanceOf, amountToken);
      this.assetList[index] = updateAsset;
      // updatePool
      if (pool) {
        index = this.poolList.findIndex(
          (_pool) => _pool.contract === pool.contract
        );
        const updatePool = { ...this.poolList[index] };
        updatePool.token0 = updateAsset;
        this.poolList[index] = updatePool;
      } else {
        this.poolList.push({
          id: randomID(6),
          txid: result,
          name: `${token.symbol}/${this.nativeCurrency.symbol}`,
          token0: updateAsset,
          token1: {
            contract: this.nativeCurrency.contract,
          },
          poolBalanceOfToken0: amountTokenMin,
          poolBalanceOfToken1: amountNCMin,
          liquidity: "--",
          yield: "--",
          volume: {
            value: `${(Math.random() * 10).toFixed(2)}m`,
            change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
              Math.random() * 1
            ).toFixed(2)}`,
          },
          tvl: {
            value: `${(Math.random() * 10).toFixed(2)}m`,
            change: `${Math.random() * 1 > 0.5 ? "+" : "-"}${(
              Math.random() * 1
            ).toFixed(2)}`,
          },
          irr: "3",
          interest24: `${(Math.random() * 10).toFixed(2)}m`,
        });
      }

      // updateHistory
      this.updateHistory({
        type: transactionType.ADDS,
        token0: token,
        token0AmountChange: `${amountTokenMin}`,
        token1: null,
        token1AmountChange: null,
        timestamp: Date.now(),
      });
      return result;
    } catch (error) {
      console.log(error);
    }
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
          (pool) => pool.contract === poolPair.contract
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
    const toData = this.connectedAccount.replace("0x", "").padStart(64, "0");
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
      // TODO
      // updateAssets
      // updatePool
      // updateHistory
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
    const toData = this.connectedAccount.replace("0x", "").padStart(64, "0");
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
    const toData = this.connectedAccount.replace("0x", "").padStart(64, "0");
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
      // TODO
      // updateAssets
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
