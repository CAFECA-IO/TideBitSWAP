import Lunar from "@cafeca/lunar";
import imTokenImg from "../resource/imToken.png";
import keccak256 from "keccak256";
import SafeMath from "../Utils/safe-math";
import { randomID, sliceData } from "../Utils/utils";
import { poolTypes } from "../constant/constant";
import erc20 from "../resource/erc20.png";
class TideTimeSwapContract {
  constructor(routerContract, chainId) {
    this.lunar = new Lunar();
    this.chainId = chainId;
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
    this.routerContract = routerContract;
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
   * @param {String} factoryContract
   */
  set factoryContract(factoryContract) {
    this._factoryContract = factoryContract;
  }
  get factoryContract() {
    return this._factoryContract;
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
  async connect(appName) {
    let result;
    switch (appName) {
      case "MetaMask":
        result = await this.lunar.connect({
          wallet: Lunar.Wallets.Metamask,
          blockchain: Lunar.Blockchains.Ropsten,
        });
        break;
      case "imToken":
        result = await this.lunar.connect({
          wallet: Lunar.Wallets[appName],
          blockchain: Lunar.Blockchains.Ropsten,
        });
        break;
      default:
        break;
    }
    this.connectedAccount = result;
    const contract = await this.getData(`factory()`, null, this.routerContract);
    console.log(`connect contract`, contract);

    this.factoryContract = `0x${contract.slice(26, 66)}`;
    return {
      connectedAccount: this.connectedAccount,
      factoryContract: this.factoryContract,
    };
  }
  async addToken(contract) {
    // symbol, decimals, totalSupply
    const tokenDetail = await this.lunar.getAsset({
      contract: contract,
    });
    const connectedAccountBalanceOfToken = await this.lunar.getBalance({
      contract: contract,
      address: this.connectedAccount,
    });
    const token = {
      id: randomID(6),
      ...tokenDetail,
      contract,
      balanceOf: connectedAccountBalanceOfToken,
      iconSrc: erc20,
    };
    console.log(`addToken`, token);
    return token;
  }
  async getPoolContractByTokens(token0Contract, token1Contract) {
    const token0ContractData = token0Contract
      .replace("0x", "")
      .padStart(64, "0");
    const token1ContractData = token1Contract
      .replace("0x", "")
      .padStart(64, "0");
    const result = await this.getData(
      `getPair(address,address)`,
      token0ContractData + token1ContractData,
      this.factoryContract
    );
    return `0x${result.slice(26, 66)}`;
  }
  async getPoolContractByIndex(index) {
    const indexData = index.toString(16).padStart(64, "0");
    const result = await this.getData(
      `allPairs(uint256)`,
      indexData,
      this.factoryContract
    );
    return `0x${result.slice(26, 66)}`;
  }
  async getPoolToken(index, poolContract) {
    const result = await this.getData(`token${index}()`, null, poolContract);
    const token = `0x${result.slice(26, 66)}`;
    return token;
  }
  async getPoolDetailByTokens(token0Contract, token1Contract, poolContract) {
    let _poolContract =
      poolContract ||
      (await this.getPoolContractByTokens(token0Contract, token1Contract));
    // symbol, decimals, totalSupply
    const poolDetail = await this.lunar.getAsset({ contract: _poolContract });
    const connectedAccountBalanceOfPool = await this.lunar.getBalance({
      contract: _poolContract,
      address: this.connectedAccount,
    });
    const share = SafeMath.gt(poolDetail.totalSupply, "0")
      ? SafeMath.div(connectedAccountBalanceOfPool, poolDetail.totalSupply)
      : "0";
    const poolBalanceOfToken0 = await this.lunar.getBalance({
      contract: token0Contract,
      address: _poolContract,
    });
    // symbol, decimals, totalSupply
    const token0Detail = await this.lunar.getAsset({
      contract: token0Contract,
    });
    const connectedAccountBalanceOfToken0InPool = SafeMath.gt(share, "0")
      ? SafeMath.mult(share, poolBalanceOfToken0)
      : "0";
    const connectedAccountBalanceOfToken0 = await this.lunar.getBalance({
      contract: token0Contract,
      address: this.connectedAccount,
    });
    const token0 = {
      id: randomID(6),
      ...token0Detail,
      contract: token0Contract,
      balanceOf: connectedAccountBalanceOfToken0,
      balanceOfPool: poolBalanceOfToken0,
      iconSrc: erc20,
    };
    const poolBalanceOfToken1 = await this.lunar.getBalance({
      contract: token1Contract,
      address: _poolContract,
    });
    const token1Detail = await this.lunar.getAsset({
      contract: token1Contract,
    });
    const connectedAccountBalanceOfToken1InPool = SafeMath.gt(share, "0")
      ? SafeMath.mult(share, poolBalanceOfToken1)
      : "0";
    const connectedAccountBalanceOfToken1 = await this.lunar.getBalance({
      contract: token1Contract,
      address: this.connectedAccount,
    });
    const token1 = {
      id: randomID(6),
      ...token1Detail,
      contract: token1Contract,
      balanceOf: connectedAccountBalanceOfToken1,
      balanceOfPool: poolBalanceOfToken1,
      iconSrc: erc20,
    };
    return {
      id: randomID(6),
      poolContract: _poolContract,
      totalSupply: poolDetail.totalSupply,
      decimals: poolDetail.decimals,
      balanceOf: connectedAccountBalanceOfPool,
      token0,
      token1,
      share,
      connectedAccountBalanceOfToken0InPool,
      connectedAccountBalanceOfToken1InPool,
      name: `${token0.symbol}/${token1.symbol}`,
      iconSrcs: [token0.iconSrc, token1.iconSrc],
      composition: `${token0.balanceOfPool} ${token0.symbol} + ${token1.balanceOfPool} ${token1.symbol}`,
      portion: `${connectedAccountBalanceOfToken0InPool} ${token0.symbol} + ${connectedAccountBalanceOfToken1InPool} ${token1.symbol}`,
      liquidity: "--",
      yield: "--",
      volume: "--",
      poolType: poolTypes.STABLE,
    };
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
      const pool = await this.getPoolDetailByTokens(
        active.contract,
        passive.contract
      );
      if (SafeMath.gt(SafeMath.toBn(pool), "0")) return pool;
    }
    return supportedPools[index];
  }
  async getPoolDetailByIndex(index) {
    const poolContract = await this.getPoolContractByIndex(index);
    const token0Contract = await this.getPoolToken(0, poolContract);
    const token1Contract = await this.getPoolToken(1, poolContract);
    return await this.getPoolDetailByTokens(
      token0Contract,
      token1Contract,
      poolContract
    );
  }
  async getPoolList() {
    const poolList = [];
    const assetList = [];
    // get pair length
    const result = await this.getData(
      `allPairsLength()`,
      null,
      this.factoryContract
    );
    const allPairLength = parseInt(result, 16);
    console.log(`geAllPairsLength allPairLength`, allPairLength);
    // 36519 CTA/CTB
    // 36548 tkb/CTB
    // 36616 tt1/tt0
    // 36629 tt3/tt2
    // for (let i = 36831; i < 36831 + 3; i++) {
    // for (let i = 0; i < 1; i++) {
    for (let i = 0; i < allPairLength; i++) {
      const poolPair = await this.getPoolDetailByIndex(i);
      poolList.push(poolPair);
      console.log(`getPoolList poolPair`, poolPair);
      const ts = [poolPair.token0, poolPair.token1];
      ts.forEach((token) => {
        const index = assetList.findIndex((t) => token.contract === t.contract);
        const balance =
          poolPair.share > 0
            ? SafeMath.mult(poolPair.share, token.totalSupply)
            : "0";
        if (index === -1) {
          assetList.push({
            ...token,
            composition: [token.balanceOf, balance],
            balance: "--",
          });
        } else {
          const updateBalance = SafeMath.plus(
            assetList[index].composition[1],
            balance
          );
          assetList[index].composition[1] = updateBalance;
        }
      });
    }
    console.log(`assetList`, assetList);
    return { poolList, assetList };
  }
  async getAmountsIn(amountOut, amountInToken, amountOutToken) {
    const funcName = "getAmountsIn(uint256,address[])"; // 0xd06ca61f
    const amountOutData = SafeMath.toHex(
      Math.floor(SafeMath.toSmallestUint(amountOut, amountOutToken.decimals))
    ).padStart(64, "0");
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
    const amountInData = SafeMath.toHex(
      Math.floor(SafeMath.toSmallestUint(amountIn, amountInToken.decimals))
    ).padStart(64, "0");
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
      ? SafeMath.toHex(SafeMath.toSmallestUint(amount, decimals)).padStart(
          64,
          "0"
        )
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
    const amountADesiredData = SafeMath.toHex(
      Math.floor(SafeMath.toSmallestUint(amountADesired, tokenA.decimals))
    ).padStart(64, "0");
    const amountBDesiredData = SafeMath.toHex(
      Math.floor(SafeMath.toSmallestUint(amountBDesired, tokenB.decimals))
    ).padStart(64, "0");
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
          0.95
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
    const liquidityData = SafeMath.toHex(
      SafeMath.toSmallestUint(liquidity, poolPair.decimals)
    ).padStart(64, "0");
    const amount0MinData = SafeMath.toHex(
      Math.ceil(
        // SafeMath.mult(
        SafeMath.toSmallestUint(amount0Min, poolPair.token0.decimals)
        //   "0.9"
        // )
      )
    ).padStart(64, "0");
    const amount1MinData = SafeMath.toHex(
      Math.ceil(
        // SafeMath.mult(
        SafeMath.toSmallestUint(amount1Min, poolPair.token1.decimals)
        //   "0.9"
        // )
      )
    ).padStart(64, "0");
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
