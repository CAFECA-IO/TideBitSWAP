import {
  liquidityType,
  poolTypes,
  // TideBitSwapRouter,
  // uniswapFactory_v2,
  // uniswapRouter_v2,
} from "../constant/constant";
import erc20 from "../resource/erc20.png";
import SafeMath from "./safe-math";
import {
  eth_call,
  eth_chainId,
  eth_requestAccounts,
  eth_sendTransaction,
  wallet_switchEthereumChain,
} from "./ethereum";

export const addressFormatter = (address, showLength = 6) => {
  if (address.length <= showLength * 2) return address;
  const prefix = address.slice(0, showLength);
  const suffix = address.slice(address.length - showLength, address.length);
  return prefix + "..." + suffix;
};

export const formateDecimal = (amount, maxLength = 18, decimalLength = 8) => {
  const splitChunck = amount.split(".");
  if (splitChunck.length > 1) {
    // if (splitChunck[1].length > decimalLength ?? 8) {
    if (amount.length > maxLength)
      splitChunck[1] = splitChunck[1].substring(
        0,
        maxLength - splitChunck[0].length - 1
      );
    // else splitChunck[1] = splitChunck[1].substring(0, decimalLength ?? 8);
    // }
    return splitChunck[1].length > 0
      ? `${splitChunck[0]}.${splitChunck[1]}`
      : splitChunck[0];
  }
  return amount;
};

export const randomID = (n) => {
  var ID = "";
  var text = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  n = parseInt(n);
  if (!(n > 0)) {
    n = 8;
  }
  while (ID.length < n) {
    ID = ID.concat(text.charAt(parseInt(Math.random() * text.length)));
  }
  return ID;
};

export const amountUpdateHandler = (amount, max) =>
  +amount === 0 ? amount : +amount > +max ? max : amount;

export const getSelectedPool = async (supportedPools, active, passive) => {
  if (!active || !passive) return;
  const index = supportedPools.findIndex(
    (pool) =>
      (active.contract === pool.token0.contract ||
        active.contract === pool.token1.contract) &&
      (passive.contract === pool.token0.contract ||
        passive.contract === pool.token1.contract)
  );
  if (index === -1) {
    const pool = await getPoolDetailByTokens(active.contract, passive.contract);
    if (SafeMath.gt(SafeMath.toBn(pool), "0")) return pool;
  }
  return supportedPools[index];
};

export const coinPairUpdateHandler = (
  active,
  passive,
  options,
  activeAmount
  // passiveAmount
) => {
  let _passive;
  if (!!passive && active.symbol === passive.symbol)
    _passive = options.find((coin) => coin.symbol !== active.symbol);
  else _passive = passive;
  let _activeAmount = amountUpdateHandler(activeAmount, active?.balanceOf);
  let _passiveAmount = !!passive
    ? calculateSwapOut(active, _passive, activeAmount)
    : "";
  return {
    active,
    passive: _passive,
    activeAmount: _activeAmount,
    passiveAmount: _passiveAmount,
  };
};

export const coinUpdateHandler = (selectedCoin, coinOptions, prevAmount) => {
  let selectedCoinAmount, isCoinValid, pairCoin;
  selectedCoinAmount = amountUpdateHandler(prevAmount, selectedCoin.balanceOf);

  isCoinValid = +selectedCoinAmount === 0 ? null : +selectedCoinAmount > 0;
  if (isCoinValid) {
    // HTTPREQUEST: get pairCoinAmount
    pairCoin = coinOptions
      .filter((coin) => coin.symbol !== selectedCoin.symbol)
      .map((coin) => {
        // let amount = 0.1;
        let amount = SafeMath.gt(selectedCoin.balanceOfPool, "0")
          ? SafeMath.mult(
              SafeMath.div(coin.balanceOfPool, selectedCoin.balanceOfPool),
              selectedCoinAmount
            )
          : SafeMath.mult(
              SafeMath.div(coin.balanceOf, selectedCoin.balanceOf),
              selectedCoinAmount
            );
        isCoinValid = !(amount > coin.balanceOf);
        return { ...coin, amount: amount };
      });
  } else {
    pairCoin = null;
  }
  return {
    selectedCoinAmount,
    isCoinValid,
    pairCoin,
  };
};

export const parseData = (option, type) => {
  if (!option) {
    return {
      details: getPoolDetail(option, type),
    };
  }
  const coins = [option.token0, option.token1];
  const combinations = [coins, [coins[0]], [coins[1]]];
  const details = getPoolDetail(option, type);
  return {
    selected: option,
    coins: coins,
    combinations: combinations,
    details: details,
    maxShareAmount: option.balanceOf,
  };
};

export const getPoolDetail = (option, type) => {
  switch (type) {
    case liquidityType.PROVIDE:
      return [
        {
          title: "Current pool size",
          value: option?.composition || "--",
        },
        {
          title: "Total yield",
          explain: "*Based on 24hr volume annualized.",
          value: option?.yield || "--",
        },
      ];
    case liquidityType.TAKE:
      return [
        {
          title: "Amount",
          value: "--",
        },
        {
          title: "Price",
          explain:
            "This price is an approximate value, and the final price depends on the amount of tokens in the liquid pool when you remove liquidity.",
          value: "--",
        },
        {
          title: "Portion of the pool",
          explain: "Removed portion/​current total pool portion",
          value: "--",
        },
        {
          title: "Current pool size",
          value: option?.composition || "--",
        },
        {
          title: "Your Current Portion",
          value: option?.portion || "--",
        },
        {
          title: "Current portion composites",
          value: "--",
        },
      ];
    default:
      break;
  }
};

export const getNetworkOptions = (coin, networks) => {
  return [
    ...networks,
    {
      name: coin.name,
      symbol: coin.symbol,
      time: "3 mins",
      fee: {
        crypto: "0.000061",
        fiat: "32.1",
      },
    },
  ];
};

export const openInNewTab = (url) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};

export const to = (promise) => {
  return promise
    .then((data) => {
      return [null, data];
    })
    .catch((err) => [err, null]);
};

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const pad = (n) => {
  return n < 10 ? "0" + n : n;
};
export const dateFormatter = (timestamp) => {
  const dateTime = new Date(timestamp);
  const date = dateTime.getDate();
  const month = dateTime.getMonth();
  const year = dateTime.getFullYear();
  let hours = dateTime.getHours();
  const minutes = dateTime.getMinutes();
  let suffix = "AM";
  if (hours - 12 > 0) {
    hours -= 12;
    suffix = "PM";
  }
  const mmddyyyykkmm =
    monthNames[month] +
    " " +
    pad(date) +
    ", " +
    year +
    " " +
    hours +
    ":" +
    pad(minutes) +
    " " +
    suffix;
  return {
    text: mmddyyyykkmm,
    date: monthNames[month] + " " + pad(date) + ", " + year,
    time: hours + ":" + pad(minutes) + " " + suffix,
    month: monthNames[month],
    dateTime: pad(date),
    year: year,
  };
};

export const isMetaMaskInstalled = () => {
  //Have to check the ethereum binding on the window object to see if it's installed
  // return Boolean(window.ethereum && window.ethereum.isMetaMask);
  return Boolean(window.ethereum);
};

export const metaMaskSetup = async (chainId) => {
  const currChainId = await eth_chainId();
  const connectedAccounts = await eth_requestAccounts();
  if (currChainId !== chainId) {
    await wallet_switchEthereumChain(chainId);
  }
  return connectedAccounts;
};

export const sliceData = (data, splitLength = 64) => {
  let _data = data.toString().replace("0x", "");

  let array = [];
  for (let n = 0; n < _data.length; n += splitLength) {
    let _array = _data.slice(n, n + splitLength);
    array.push(_array);
  }
  return array;
};

/**
 * https://www.codegrepper.com/code-examples/javascript/hex+to+ascii+function+javascript
 * @param {string | hex} hex
 * @returns
 */
export const hexToAscii = (hex) => {
  let _hex = hex.toString().replace("0x", "");
  let str = "";
  for (let n = 0; n < _hex.length; n += 2) {
    if (_hex.substr(n, 2) === "00") continue;
    let _str = String.fromCharCode(parseInt(_hex.substr(n, 2), 16));
    str += _str;
  }
  return str;
};

export const getTokenName = async (tokenContract) => {
  const result = await eth_call(`name()`, null, tokenContract);
  const name = hexToAscii(sliceData(result)[2]);
  return name;
};

export const getTokenSymbol = async (tokenContract) => {
  const result = await eth_call(`symbol()`, null, tokenContract);
  const symbol = hexToAscii(sliceData(result)[2]);
  return symbol;
};

export const getTokenTotalSupply = async (tokenContract) => {
  const result = await eth_call(`totalSupply()`, null, tokenContract);
  const totalSupply = parseInt(result, 16);
  return totalSupply;
};

export const getTokenDecimals = async (tokenContract) => {
  const result = await eth_call(`decimals()`, null, tokenContract);
  const parsedResult = parseInt(result, 16);
  return parsedResult;
};

// myasset in token contract
/**
 *
 * @param {*} tokenContract | token contract
 * @param {*} poolContract  | my ethereum address
 * @returns
 */
export const getTokenBalanceOfContract = async (contract, address) => {
  const tokenDecimals = await getTokenDecimals(contract);
  const totalSupply = await getTokenTotalSupply(contract);
  const data = address.replace("0x", "").padStart(64, "0");
  const result = await eth_call(`balanceOf(address)`, data, contract);
  const balanceOf = parseInt(result, 16);
  return {
    decimals: tokenDecimals,
    balanceOf: SafeMath.toCurrencyUint(balanceOf, tokenDecimals),
    totalSupply: SafeMath.toCurrencyUint(totalSupply, tokenDecimals),
  };
};

export const getPoolToken = async (tokenIndex, poolContract) => {
  const result = await eth_call(`token${tokenIndex}()`, null, poolContract);
  const token = `0x${result.slice(26, 66)}`;
  return token;
};

export const getTokenDetail = async (tokenContract, poolContract) => {
  const { balanceOf, decimals, totalSupply } = await getTokenBalanceOfContract(
    tokenContract,
    poolContract
  );
  const symbol = await getTokenSymbol(tokenContract);
  const name = await getTokenName(tokenContract);
  const iconSrc = erc20;
  return {
    id: randomID(6),
    contract: tokenContract,
    balanceOf,
    decimals,
    symbol,
    name,
    totalSupply,
    iconSrc,
  };
};

export const getPoolContractByIndex = async (index, factoryContract) => {
  const indexData = index.toString(16).padStart(64, "0");
  const result = await eth_call(
    `allPairs(uint256)`,
    indexData,
    factoryContract
  );
  return `0x${result.slice(26, 66)}`;
};

export const geAllPairsLength = async (factoryContract) => {
  const result = await eth_call(`allPairsLength()`, null, factoryContract);
  return parseInt(result, 16);
};

export const getPoolContractByTokens = async (
  token0Contract,
  token1Contract,
  factoryContract
) => {
  const token0ContractData = token0Contract.repla0e("0x", "").padStart(64, "0");
  const token1ContractData = token1Contract.replace("0x", "").padStart(64, "0");
  const result = await eth_call(
    `getPair(address,address)`,
    token0ContractData + token1ContractData,
    factoryContract
  );
  return `0x${result.slice(26, 66)}`;
};

export const getPoolDetailByTokens = async (
  token0Contract,
  token1Contract,
  connectedAccount,
  poolContract,
  factoryContract
) => {
  let _poolContract =
    poolContract ||
    (await getPoolContractByTokens(
      token0Contract,
      token1Contract,
      factoryContract
    ));
  const { balanceOf, totalSupply, decimals } = await getTokenBalanceOfContract(
    _poolContract,
    connectedAccount
  );
  const share = SafeMath.gt(totalSupply, "0")
    ? SafeMath.div(balanceOf, totalSupply)
    : "0";
  const token0Detail = await getTokenDetail(token0Contract, poolContract);
  const connectedAccountBalanceOfToken0InPool = SafeMath.gt(share, "0")
    ? SafeMath.mult(share, token0Detail.balanceOf)
    : "0";
  const connectedAccountBalanceOfToken0 = await getTokenBalanceOfContract(
    token0Contract,
    connectedAccount
  );
  const token1Detail = await getTokenDetail(token1Contract, poolContract);
  const connectedAccountBalanceOfToken1InPool = SafeMath.gt(share, "0")
    ? SafeMath.mult(share, token1Detail.balanceOf)
    : "0";
  const connectedAccountBalanceOfToken1 = await getTokenBalanceOfContract(
    token1Contract,
    connectedAccount
  );
  const token0 = {
    ...token0Detail,
    balanceOfPool: token0Detail.balanceOf,
    contract: token0Contract,
    balanceOf: connectedAccountBalanceOfToken0.balanceOf,
  };
  const token1 = {
    ...token1Detail,
    balanceOfPool: token1Detail.balanceOf,
    contract: token1Contract,
    balanceOf: connectedAccountBalanceOfToken1.balanceOf,
  };
  return {
    id: randomID(6),
    poolContract: _poolContract,
    totalSupply,
    decimals,
    balanceOf,
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
};

export const getPoolDetailByIndex = async (
  index,
  connectedAccount,
  factoryContract
) => {
  const poolContract = await getPoolContractByIndex(index, factoryContract);
  const token0Contract = await getPoolToken(0, poolContract);
  const token1Contract = await getPoolToken(1, poolContract);
  return await getPoolDetailByTokens(
    token0Contract,
    token1Contract,
    connectedAccount,
    poolContract,
    factoryContract
  );
};

export const addToken = async (contract, connectedAccount) => {
  const token = await getTokenDetail(contract, connectedAccount);
  return {
    ...token,
    contract,
    composition: [token.balanceOf, "0"],
    balance: "--",
  };
};

export const getFactoryContract = async (routerContract) => {
  const result = await eth_call(`factory()`, null, routerContract);
  const factoryContract = `0x${result.slice(26, 66)}`;
  return factoryContract;
};

export const getPoolList = async (connectedAccount, factoryContract) => {
  const poolList = [];
  const assetList = [];
  const allPairLength = await geAllPairsLength(factoryContract);
  console.log(`geAllPairsLength allPairLength`, allPairLength);
  // 36519 CTA/CTB
  // 36548 tkb/CTB
  // 36616 tt1/tt0
  // 36629 tt3/tt2
  // for (let i = 36831; i < 36831 + 3; i++) {
  for (let i = 0; i < allPairLength; i++) {
    const poolPair = await getPoolDetailByIndex(
      i,
      connectedAccount,
      factoryContract
    );
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
      console.log(`assetList`, assetList);
    });
  }
  console.log(`assetList`, assetList);
  return { poolList, assetList };
};

export const calculateSwapOut = (tokenA, tokenB, tokenAAmount, fee = 0.03) => {
  const a = SafeMath.div(tokenAAmount, tokenA.balanceOfPool);
  const r = 1 - fee;
  const tokenBAmount = SafeMath.mult(
    SafeMath.div(SafeMath.mult(a, r), SafeMath.plus(1, SafeMath.mult(a, r))),
    tokenB.balanceOfPool
  );
  return tokenBAmount;
};

export const swap = async (
  amountIn,
  amountOut,
  amountInToken,
  amountOutToken,
  connectedAccount,
  chainId,
  routerContract
) => {
  const functionName =
    "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)";
  const amountInData = SafeMath.toHex(
    Math.floor(SafeMath.toSmallestUint(amountIn, amountInToken.decimals))
  ).padStart(64, "0");
  const amountOutData = SafeMath.toHex(
    Math.floor(SafeMath.toSmallestUint(amountOut, amountOutToken.decimals))
  ).padStart(64, "0");
  const toData = connectedAccount.replace("0x", "").padStart(64, "0");
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
    amountInData +
    amountOutData +
    "00000000000000000000000000000000000000000000000000000000000000a0" +
    toData +
    dateline +
    addressCount +
    amountInTokenContractData +
    amountOutTokenContractData;
  const value = 0;
  const result = await eth_sendTransaction(
    functionName,
    connectedAccount,
    routerContract,
    data,
    value,
    chainId
  );
  return result;
};

export const createPair = async (
  token0Contract,
  token1Contract,
  chainId,
  connectedAccount,
  factoryContract
) => {
  const functionName = "createPair(address,address)"; //c9c65396
  const token0Data = token0Contract.replace("0x", "").padStart(64, "0");
  const token1Data = token1Contract.replace("0x", "").padStart(64, "0");
  const data = token0Data + token1Data;
  console.log(`createPool data`, data);
  const value = 0; //SafeMath.toHex(SafeMath.toSmallestUint(value, decimal)),
  const result = await eth_sendTransaction(
    functionName,
    connectedAccount,
    factoryContract,
    data,
    value,
    chainId
  );
  console.log(`createPool result`, result);
  return result;
};

export const takeLiquidity = async (
  poolPair,
  liquidity,
  amount0Min,
  amount1Min,
  connectedAccount,
  chainId,
  routerContract
) => {
  const functionName =
    "removeLiquidity(address,address,uint256,uint256,uint256,address,uint256)";
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
  const toData = connectedAccount.replace("0x", "").padStart(64, "0");
  const dateline = SafeMath.toHex(
    SafeMath.plus(Math.round(SafeMath.div(Date.now(), 1000)), 1800)
  ).padStart(64, "0");
  const data =
    token0ContractData +
    token1ContractData +
    liquidityData +
    amount0MinData +
    amount1MinData +
    toData +
    dateline;
  const value = 0;
  const result = await eth_sendTransaction(
    functionName,
    connectedAccount,
    routerContract,
    data,
    value,
    chainId
  );
  console.log(`takeLiquidity result`, result);
  return result;
};

export const provideLiquidity = async (
  tokenA,
  tokenB,
  amountADesired,
  amountBDesired,
  // amountAMin,
  // amountBMin,
  connectedAccount,
  // to,
  // deadline
  chainId,
  routerContract
) => {
  // FUNCTION TYPE: Add Liquidity
  const functionName =
    "addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)";
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
  const toData = connectedAccount.replace("0x", "").padStart(64, "0");
  const dateline = SafeMath.toHex(
    SafeMath.plus(Math.round(SafeMath.div(Date.now(), 1000)), 1800)
  ).padStart(64, "0");

  const data =
    tokenAContractData +
    tokenBContractData +
    amountADesiredData +
    amountBDesiredData +
    amountAMinData +
    amountBMinData +
    toData +
    dateline;
  const value = 0;
  const result = await eth_sendTransaction(
    functionName,
    connectedAccount,
    routerContract,
    data,
    value,
    chainId
  );
  console.log(`addLiquidity result`, result);
  return result;
};

export const approve = async (
  contract,
  connectedAccount,
  chainId,
  routerContract,
  amount,
  decimals
) => {
  const functionName = "approve(address,uint256)";
  const spenderData = routerContract.replace("0x", "").padStart(64, "0");
  const amountData = amount
    ? SafeMath.toHex(SafeMath.toSmallestUint(amount, decimals)).padStart(
        64,
        "0"
      )
    : "".padEnd(64, "f");
  const data = spenderData + amountData;
  const value = 0;
  const result = await eth_sendTransaction(
    functionName,
    connectedAccount,
    contract,
    data,
    value,
    chainId
  );
  console.log(`approve result`, result);
  return result;
};

export const isAllowanceEnough = async (
  connectedAccount,
  // chainId,
  routerContract,
  contract,
  amount,
  decimals
) => {
  const functionName = "allowance(address,address)";
  // const ownerData = contract.replace("0x", "").padStart(64, "0");
  const ownerData = connectedAccount.replace("0x", "").padStart(64, "0");
  const spenderData = routerContract.replace("0x", "").padStart(64, "0");
  const data = ownerData + spenderData;
  const result = await eth_call(functionName, data, contract);
  console.log(`allowance result`, result);
  const allowanceAmount = SafeMath.toCurrencyUint(
    SafeMath.toBn(result),
    decimals
  );
  console.log(`allowance amount`, allowanceAmount);
  return SafeMath.gt(allowanceAmount, amount);
};
