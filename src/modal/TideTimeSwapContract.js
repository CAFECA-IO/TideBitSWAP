import Lunar from "../libraries/Lunar";
import imTokenImg from "../resource/imToken.png";
import keccak256 from "keccak256";
import SafeMath from "../Utils/safe-math";
import { randomID } from "../Utils/utils";
import { poolTypes } from "../constant/constant";
import erc20 from "../resource/erc20.png";
class TideTimeSwapContract {
  constructor(routerContract) {
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
    console.log(`addToken`, token)
    return token;
  }
  async getPoolContractByTokens(token0Contract, token1Contract) {
    const token0ContractData = token0Contract
      .repla0e("0x", "")
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
  async getAmountsOut(){
    const funcName = "getAmountsOut(uint256,address[])";
  }
}

export default TideTimeSwapContract;
