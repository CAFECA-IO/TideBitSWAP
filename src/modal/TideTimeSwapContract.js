import Lunar from "@cafeca/lunar";
import imTokenImg from "../resources/imToken.png";
import keccak256 from "keccak256";
import SafeMath from "../Utils/safe-math";
import { getTokenBalanceOfContract, randomID, sliceData } from "../Utils/utils";
// import { poolTypes } from "../constant/constant";
import erc20 from "../resources/erc20.png";
import { BinanceSwapRouter, TideBitSwapRouter } from "../constant/constant";
// import { openInNewTab } from "../Utils/utils";

class TideTimeSwapContract {
  constructor() {
    this.lunar = new Lunar();
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
   * @param {integer} index
   */
  set pairIndex(index) {
    this._pairIndex = index;
  }
  get pairIndex() {
    return this._pairIndex;
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
  async getFactoryContract() {
    console.log(`this.routerContract`, this.routerContract);
    const contract = await this.getData(`factory()`, null, this.routerContract);
    this.factoryContract = `0x${contract.slice(26, 66)}`;
    console.log(`this.factoryContract`, this.factoryContract);
  }
  switchContract(contract) {
    this.routerContract = contract;
  }
  async switchNetwork(network) {
    this.isConnected = false;
    try {
      await this.lunar.switchBlockchain({
        blockchain: network,
      });
      this.isConnected = true;
      const contract = this.findContractByNetwork(network);
      this.switchContract(contract);
      this.factoryContract = "";
      this.network = network;
      this.poolList = [];
      this.assetList = [];
    } catch (error) {}
  }
  calculateTokenBalanceOfPools(token) {
    const balanceInPools = token.pools.reduce((acc, curr) => {
      const balance =
        +curr.share > 0 ? SafeMath.mult(curr.share, token.totalSupply) : "0";
      return SafeMath.plus(acc, balance);
    }, "0");
    return balanceInPools;
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
      console.log(`${funcName} error`, error);
      throw error;
    }
  }
  async disconnect() {
    this.connectedAccount = null;
    this.isConnected = false;
    await this.lunar.disconnect();
    this.poolList = [];
    this.assetList = [];
    this.pairIndex = 0;
  }
  async connect(appName, network) {
    this.poolList = [];
    this.assetList = [];
    this.pairIndex = 0;
    const contract = this.findContractByNetwork(network);
    this.switchContract(contract);
    this.network = network;
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
    if (index === -1) {
      const pool = await this.getPoolByTokens(
        active.contract,
        passive.contract
      );
      return pool;
    }
    return supportedPools[index];
  }
  async getTokenByContract(tokenContract, pool) {
    // requestCounts: 1`
    const poolBalanceOfToken = pool
      ? await this.lunar.getBalance({
          contract: tokenContract,
          address: pool.contract,
        })
      : "0";
    console.log(`poolBalanceOfToken`, poolBalanceOfToken);
    // requestCounts: 4
    const { symbol, decimals, totalSupply, name } = await this.lunar.getAsset({
      contract: tokenContract,
    });
    console.log(
      `symbol, decimals, totalSupply, name`,
      symbol,
      decimals,
      totalSupply,
      name
    );
    console.log(`tokenContract`, tokenContract)

    // requestCounts: 1
    const balanceOf = this.connectedAccount
      ? await this.lunar.getBalance({
          contract: tokenContract,
          address: this.connectedAccount,
        })
      : "0";
    return {
      id: randomID(6),
      contract: tokenContract,
      iconSrc: erc20,
      name,
      symbol,
      decimals,
      totalSupply,
      balanceOf,
      pools: [
        {
          ...pool,
          poolBalanceOfToken,
        },
      ],
      balance: "--",
    };
  }
  async updateAssets(token) {
    const index = this.assetList.findIndex(
      (t) => token.contract === t.contract
    );
    if (index === -1) {
      const balanceInPools = this.calculateTokenBalanceOfPools(token);
      const tokenDetail = {
        ...token,
        balanceInPools,
      };
      console.log(`updateAssets tokenDetail`, tokenDetail);
      this.assetList.push(tokenDetail);
      return tokenDetail;
    } else {
      this.assetList[index].pools = [...this.assetList[index].pools].concat(
        token.pools
      );
      this.assetList[index].balanceInPools = this.calculateTokenBalanceOfPools(
        this.assetList[index]
      );
      console.log(`updateAssets  this.assetList[index]`, this.assetList[index]);
      return this.assetList[index];
    }
  }
  // requestCounts: 6
  async addToken(contract) {
    const token = await this.getTokenByContract(contract);
    const tokenDetail = await this.updateAssets(token);
    return tokenDetail;
  }
  // requestCounts: 7
  async getToken(index, pool) {
    // requestCounts: 1
    const tokenContract = await this.getPoolTokenContract(index, pool.contract);
    // requestCounts: 6
    const token = await this.getTokenByContract(tokenContract, pool);
    return token;
  }
  // requestCounts: 3
  async getPoolDetail(poolPair) {
    // requestCounts: 1
    const balanceOfToken0InPool = SafeMath.gt(poolPair.share, "0")
      ? SafeMath.mult(poolPair.share, poolPair.poolBalanceOfToken0)
      : "0";

    const balanceOfToken1InPool = SafeMath.gt(poolPair.share, "0")
      ? SafeMath.mult(poolPair.share, poolPair.poolBalanceOfToken1)
      : "0";
    return {
      ...poolPair,
      balanceOfToken0InPool,
      balanceOfToken1InPool,
    };
  }
  // requestCounts: 11
  async getPoolByTokens(token0Contract, token1Contract) {
    // requestCounts: 1
    const pool = {
      id: randomID(6),
      contract: await this.getPoolContractByTokens(
        token0Contract,
        token1Contract
      ),
    };
    if (!SafeMath.gt(SafeMath.toBn(pool.contract), "0")) return null;
    // requestCounts: 5
    const token0 = await this.getTokenByContract(token0Contract, pool);
    // requestCounts: 5
    const token1 = await this.getTokenByContract(token1Contract, pool);
    // requestCounts: 1
    const decimalsResult = await this.getData(
      `decimals()`,
      null,
      pool.contract
    );
    const decimals = parseInt(decimalsResult, 16);
    // requestCounts: 1
    const totalSupplyResult = await this.getData(
      `totalSupply()`,
      null,
      pool.contract
    );
    const totalSupply = parseInt(totalSupplyResult, 16);
    const poolPair = {
      ...pool,
      decimals,
      totalSupply,
      name: `${token0.symbol}/${token1.symbol}`,
      token0,
      token1,
      poolBalanceOfToken0: token0.pools[0].poolBalanceOfToken,
      poolBalanceOfToken1: token1.pools[0].poolBalanceOfToken,
      liquidity: "--",
      yield: "--",
      volume: "--",
    };
    // requestCounts: 1
    const poolPairDetail = await this.getPoolDetail(poolPair);
    return poolPairDetail;
  }
  // requestCounts: 16
  async getPoolByIndex(index) {
    // requestCounts: 1
    const poolContract = await this.getPoolContractByIndex(index);
    // requestCounts: 1
    // const totalSupplyResult = await this.getData(
    //   `totalSupply()`,
    //   null,
    //   poolContract
    // );
    // const totalSupply = parseInt(totalSupplyResult, 16);
    // requestCounts: 1
    // const decimalsResult = await this.getData(
    //   `decimals()`,
    //   null,
    //   pool.contract
    // );
    // const decimals = parseInt(decimalsResult, 16);
    // const balanceOf = this.connectedAccount
    //   ? await this.lunar.getBalance({
    //       contract: poolContract,
    //       address: this.connectedAccount,
    //     })
    //   : "0";
    const { decimals, balanceOf, totalSupply } =
      await getTokenBalanceOfContract(poolContract, this.connectedAccount);
    const share = SafeMath.gt(totalSupply, "0")
      ? SafeMath.div(balanceOf, totalSupply)
      : "0";
    const pool = {
      id: randomID(6),
      contract: poolContract,
      totalSupply,
      balanceOf,
      share,
    };
    // requestCounts: 7
    const token0 = await this.getToken(0, pool);
    console.log(`getPoolByIndex token0`, token0);
    // requestCounts: 7
    const token1 = await this.getToken(1, pool);
    console.log(`getPoolByIndex token1`, token1);
    const poolPair = {
      ...pool,
      decimals,
      totalSupply,
      name: `${token0.symbol}/${token1.symbol}`,
      token0,
      token1,
      poolBalanceOfToken0: token0.pools[0].poolBalanceOfToken,
      poolBalanceOfToken1: token1.pools[0].poolBalanceOfToken,
      liquidity: "--",
      yield: "--",
      volume: "--",
    };
    // requestCounts: 1
    const poolPairDetail = await this.getPoolDetail(poolPair);
    console.log(`getPoolByIndex poolPairDetail`, poolPairDetail);
    return poolPairDetail;
  }

  async getContractDataLength() {
    console.log(
      `getContractDataLength this.factoryContract`,
      this.factoryContract
    );
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
    // requestCounts: 16
    if (!this.isConnected) {
      console.log(`getContractData this.poolList`, this.poolList);
      return {
        poolList: [],
        assetList: [],
        pairIndex: 0,
      };
    }
    const poolPair = await this.getPoolByIndex(index);
    this.poolList.push(poolPair);
    // requestCounts: 1
    await this.updateAssets(poolPair.token0);
    // requestCounts: 1
    await this.updateAssets(poolPair.token1);
    this.pairIndex = index;
    return {
      poolList: this.poolList,
      assetList: this.assetList,
      pairIndex: this.pairIndex,
    };
  }

  async getAmountsIn(amountOut, amountInToken, amountOutToken) {
    const funcName = "getAmountsIn(uint256,address[])"; // 0xd06ca61f
    const amountOutData = SafeMath.toSmallestUnitHex(
      amountOut,
      amountOutToken.decimals
    )
      .split(".")[0]
      .padStart(64, "0");
    const amountInTokenContractData = amountInToken.contract
      .replace("0x", "")
      .padStart(64, "0");
    const amountOutTokenContractData = amountOutToken.contract
      .replace("0x", "")
      .padStart(64, "0");
    const data =
      amountOutData +
      "0000000000000000000000000000000000000000000000000000000000000040" +
      "0000000000000000000000000000000000000000000000000000000000000002" +
      amountInTokenContractData +
      amountOutTokenContractData;
    const result = await this.getData(funcName, data, this.routerContract);
    console.log(`getAmountsIn result`, result);
    const parsedResult = sliceData(result.replace("0x", ""), 64)[2];
    console.log(`getAmountsIn parsedResult`, parsedResult);
    const amountIn = SafeMath.toCurrencyUint(
      SafeMath.toBn(parsedResult),
      amountInToken.decimals
    );
    console.log(`getAmountsIn amountIn`, amountIn);
    return amountIn;
  }
  async getAmountsOut(amountIn, amountInToken, amountOutToken) {
    const funcName = "getAmountsOut(uint256,address[])"; // 0xd06ca61f
    const amountInData = SafeMath.toSmallestUnitHex(
      amountIn,
      amountInToken.decimals
    )
      .split(".")[0]
      .padStart(64, "0");
    const amountInTokenContractData = amountInToken.contract
      .replace("0x", "")
      .padStart(64, "0");
    const amountOutTokenContractData = amountOutToken.contract
      .replace("0x", "")
      .padStart(64, "0");
    const data =
      amountInData +
      "0000000000000000000000000000000000000000000000000000000000000040" +
      "0000000000000000000000000000000000000000000000000000000000000002" +
      amountInTokenContractData +
      amountOutTokenContractData;
    const result = await this.getData(funcName, data, this.routerContract);
    console.log(`getAmountsOut result`, result);
    const parsedResult = sliceData(result.replace("0x", ""), 64)[3];
    console.log(`getAmountsOut parsedResult`, parsedResult);
    const amountOut = SafeMath.toCurrencyUint(
      SafeMath.toBn(parsedResult),
      amountOutToken.decimals
    );
    console.log(`getAmountsOut amountOut`, amountOut);
    return amountOut;
  }
  async isAllowanceEnough(contract, amount, decimals) {
    const funcName = "allowance(address,address)";
    const ownerData = this.connectedAccount.replace("0x", "").padStart(64, "0");
    const spenderData = this.routerContract.replace("0x", "").padStart(64, "0");
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
          SafeMath.toSmallestUint(amountADesired, tokenA.decimals),
          "0.95"
        )
      )
    ).padStart(64, "0");
    const amountBMinData = SafeMath.toHex(
      Math.floor(
        SafeMath.mult(
          SafeMath.toSmallestUint(amountBDesired, tokenB.decimals),
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
    const result = await this.lunar.send(transaction);
    console.log(`addLiquidity result`, result);
    return result;
  }
  async swap(amountIn, amountOut, amountInToken, amountOutToken) {
    const funcName =
      "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)";
    const funcNameHex = `0x${keccak256(funcName).toString("hex").slice(0, 8)}`;
    const amountInData = SafeMath.toSmallestUnitHex(
      amountIn,
      amountInToken.decimals
    )
      .split(".")[0]
      .padStart(64, "0");
    const amountOutData = SafeMath.toSmallestUnitHex(
      amountOut,
      amountOutToken.decimals
    )
      .split(".")[0]
      .padStart(64, "0");
    const toData = this.connectedAccount.replace("0x", "").padStart(64, "0");
    const dateline = SafeMath.toHex(
      SafeMath.plus(Math.round(SafeMath.div(Date.now(), 1000)), 1800)
    ).padStart(64, "0");
    const addressCount = SafeMath.toHex(2).padStart(64, "0");
    const amountInTokenContractData = amountInToken.contract
      .replace("0x", "")
      .padStart(64, "0");
    const amountOutTokenContractData = amountOutToken.contract
      .replace("0x", "")
      .padStart(64, "0");
    const data =
      funcNameHex +
      amountInData +
      amountOutData +
      "00000000000000000000000000000000000000000000000000000000000000a0" +
      toData +
      dateline +
      addressCount +
      amountInTokenContractData +
      amountOutTokenContractData;
    const value = 0;
    const transaction = {
      to: this.routerContract,
      amount: value,
      data,
    };
    const result = await this.lunar.send(transaction);
    console.log(`swap result`, result);
    return result;
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
    const result = await this.lunar.send(transaction);
    console.log(`takeLiquidity result`, result);
    return result;
  }
}

export default TideTimeSwapContract;
