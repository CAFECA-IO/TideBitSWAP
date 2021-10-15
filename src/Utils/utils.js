import { liquidityType, uniswapContract_v2 } from "../constant/constant";
import keccak256 from "keccak256";
import SafeMath from "./safe-math";

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

export const coinPairUpdateHandler = (
  active,
  activeAmount,
  passive,
  passiveAmount,
  options
) => {
  let _passive;
  if (!!passive && active.symbol === passive.symbol)
    _passive = options.find((coin) => coin.symbol !== active.symbol);
  else _passive = passive;
  return {
    active,
    passive: _passive,
    activeAmount: amountUpdateHandler(activeAmount, active?.max),
    passiveAmount: amountUpdateHandler(passiveAmount, _passive?.max),
  };
};

export const coinUpdateHandler = (selectedCoin, coinOptions, prevAmount) => {
  let selectedCoinAmount, isCoinValid, pairCoin;
  selectedCoinAmount = amountUpdateHandler(prevAmount, selectedCoin.max);

  isCoinValid = +selectedCoinAmount === 0 ? null : +selectedCoinAmount > 0;
  if (isCoinValid) {
    // HTTPREQUEST: get pairCoinAmount
    pairCoin = coinOptions
      .filter((coin) => coin.symbol !== selectedCoin.symbol)
      .map((coin) => {
        let amount = 0.1;
        isCoinValid = !amount > coin.max;
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

export const parseData = (option, type, options) => {
  if (!option) {
    return {
      details: getPoolDetail(option, type),
    };
  }
  const coins = option.name
    .split("/")
    .map((symbol) => options.find((coin) => coin.symbol === symbol));
  const combinations = [coins, [coins[0]], [coins[1]]];
  const details = getPoolDetail(option, type);
  // get selected pool max shareAmount
  return {
    selected: option,
    coins: coins,
    combinations: combinations,
    details: details,
    maxShareAmount: "1000",
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
          value: "--",
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

export const toEther = (amount, unit) => {
  switch (unit) {
    case "wei":
      return amount / Math.pow(10, 18);
    case "gwei":
      return amount / Math.pow(10, 9);
    default:
      return amount;
  }
};

export const toWei = (amount, unit) => {
  switch (unit) {
    case "ether":
      return amount * Math.pow(10, 18);
    case "gwei":
      return amount * Math.pow(10, 9);
    default:
      return amount;
  }
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

// Convert a hex string to a byte array
function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

// Convert a byte array to a hex string
function bytesToHex(bytes) {
  for (var hex = [], i = 0; i < bytes.length; i++) {
    var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
    hex.push((current >>> 4).toString(16));
    hex.push((current & 0xf).toString(16));
  }
  return hex.join("");
}

export const connectedStatus = () =>
  Boolean(window.ethereum && window.ethereum.isConnected());

export const isMetaMaskInstalled = () => {
  //Have to check the ethereum binding on the window object to see if it's installed
  return Boolean(window.ethereum && window.ethereum.isMetaMask);
};

export const metaMaskSetup = async (chainId) => {
  let connectedAccounts, currChainId;
  try {
    //get connected account
    connectedAccounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
  } catch (error) {
    // 4001
    // The request was rejected by the user
    // -32602
    // The parameters were invalid
    // -32603
    // Internal error
    console.log(`eth_requestAccounts`, error);
    throw error;
  }
  try {
    // get chainId
    currChainId = await window.ethereum.request({ method: "eth_chainId" });
  } catch (error) {
    console.log(`eth_chainId`, error);
    throw error;
  }
  if (currChainId !== chainId) {
    // switch chainId
    // Hex	Decimal	    Network
    // 0x1	  1	        Ethereum  Main Network (Mainnet)
    // 0x3	  3	        Ropsten Test Network
    // 0x4	  4	        Rinkeby Test Network
    // 0x5	  5	        Goerli Test Network
    // 0x2a	  42	      Kovan Test Network
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainId }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        // try {
        //   await window.ethereum.request({
        //     method: "wallet_addEthereumChain",
        //     params: [tidetime],
        //   });
        // } catch (addError) {
        //   // handle "add" error
        // }
      }
      console.log(`wallet_switchEthereumChain`, switchError);
      // handl
    }
  }
  return connectedAccounts;
};

export const getUniSwapPoolPair = async (index) => {
  const funcNameHex = `0x${keccak256("allPairs(uint256)")
    .toString("hex")
    .slice(0, 8)}`;
  const indexData = index.toString(16).padStart(64, "0");
  // console.log(`getUniSwapPoolParis data`, funcNameHex + indexData);
  try {
    const result = await window.ethereum.request({
      id: randomID(1),
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          from: "0x0000000000000000000000000000000000000000",
          data: `${funcNameHex + indexData}`,
          to: `${uniswapContract_v2}`,
        },
        "latest",
      ],
    });
    return `0x${result.slice(26, 66)}`;
  } catch (error) {
    console.log(`getUniSwapPoolParis error`, error);
    throw error;
  }
};

export const getTokenDecimals = async (tokenContract) => {
  const funcNameHex = `0x${keccak256("decimals()")
    .toString("hex")
    .slice(0, 8)}`;
  // console.log(`getTokenDecimals data`, funcNameHex);
  try {
    const result = await window.ethereum.request({
      id: randomID(1),
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          from: "0x0000000000000000000000000000000000000000",
          data: `${funcNameHex}`,
          to: tokenContract,
        },
        "latest",
      ],
    });
    const parsedResult = parseInt(result, 16);
    // console.log(`getTokenDecimals result`, parsedResult);
    return parsedResult;
  } catch (error) {
    console.log(`getTokenDecimals error`, error);
    throw error;
  }
};

export const sliceData = (data, splitLength = 64) => {
  let _data = data.toString().replace("0x", "");

  let array = [];
  for (let n = 0; n < _data.length; n += splitLength) {
    let _array = _data.slice(n, n + splitLength);
    array.push(_array);
  }
  // console.log(array);
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
  const funcNameHex = `0x${keccak256("name()").toString("hex").slice(0, 8)}`;
  try {
    const result = await window.ethereum.request({
      id: randomID(1),
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          from: "0x0000000000000000000000000000000000000000",
          data: `${funcNameHex}`,
          to: tokenContract,
        },
        "latest",
      ],
    });
    // console.log(`getTokenName result`, result);
    // console.log(`getTokenName sliceData result`, sliceData(result));
    let name = hexToAscii(sliceData(result)[2]);
    // console.log(`getTokenName hexToAscii`, hexToAscii(result));
    return name;
  } catch (error) {
    console.log(`getTokenName error`, error);
    throw error;
  }
};

export const getTokenSymbol = async (tokenContract) => {
  const funcNameHex = `0x${keccak256("symbol()").toString("hex").slice(0, 8)}`;
  // console.log(`getTokenSymbol data`, funcNameHex);
  try {
    const result = await window.ethereum.request({
      id: randomID(1),
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          from: "0x0000000000000000000000000000000000000000",
          data: `${funcNameHex}`,
          to: tokenContract,
        },
        "latest",
      ],
    });
    // console.log(`getTokenSymbol result`, result);
    let symbol = hexToAscii(sliceData(result)[2]);
    // console.log(`getTokenSymbol hexToAscii`, hexToAscii(result));
    return symbol;
  } catch (error) {
    console.log(`getTokenSymbol error`, error);
    throw error;
  }
};

export const getTokenTotalSupply = async (tokenContract) => {
  const funcNameHex = `0x${keccak256("totalSupply()")
    .toString("hex")
    .slice(0, 8)}`;
  // console.log(`getTokenSymbol data`, funcNameHex);
  try {
    const result = await window.ethereum.request({
      id: randomID(1),
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          from: "0x0000000000000000000000000000000000000000",
          data: `${funcNameHex}`,
          to: tokenContract,
        },
        "latest",
      ],
    });
    // console.log(`getTokenTotalSupply result`, result);
    let totalSupply = parseInt(result, 16);
    // console.log(`getTokentotalSupply parseInt`, parseInt(result, 16));
    return totalSupply;
  } catch (error) {
    console.log(`getTokentotalSupply error`, error);
    throw error;
  }
};

export const getTokenBalanceOfContract = async (
  tokenContract,
  poolContract
) => {
  const tokenDecimals = await getTokenDecimals(tokenContract);
  const totalSupply = await getTokenTotalSupply(tokenContract);
  const funcNameHex = `0x${keccak256("balanceOf(address)")
    .toString("hex")
    .slice(0, 8)}`;
  const poolData = poolContract.replace("0x", "").padStart(64, "0");
  // console.log(`getTokenBalanceOfContract data`, funcNameHex + poolData);
  try {
    const result = await window.ethereum.request({
      id: randomID(1),
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          from: "0x0000000000000000000000000000000000000000",
          data: `${funcNameHex + poolData}`,
          to: tokenContract,
        },
        "latest",
      ],
    });
    const parsedResult = parseInt(result, 16);
    // console.log(`getTokenBalanceOfContract result`, parsedResult);
    const balanceOf = SafeMath.toCurrencyUint(parsedResult, tokenDecimals);
    // console.log(`getTokenBalanceOfContract balanceOf`, balanceOf);
    return {
      balanceOf,
      decimals: tokenDecimals,
      totalSupply: SafeMath.toCurrencyUint(totalSupply, tokenDecimals),
    };
  } catch (error) {
    console.log(`getTokenBalanceOfContract error`, error);
    throw error;
  }
};

// export const getPoolToken = async (tokenIndex, poolContract) => {
//   let funcNameHex, token, storageAt;
//   switch (tokenIndex) {
//     case 0:
//       // storageAt = 0x6;
//       break;
//     case 1:
//       // storageAt =0x7
//       break;
//     default:
//       return;
//   }
//   try {
//     token = await window.ethereum.request({
//       id: randomID(1),
//       jsonrpc: "2.0",
//       method: "eth_getStorageAt",
//       params: [poolContract, `${storageAt}`, "latest"],
//     });
//     token = `0x${token.slice(26, 66)}`;
//     console.log(`getPoolToken token`, token);
//     return token;
//   } catch (error) {
//     console.log(`getPoolToken token error`, error);
//     throw error;
//   }
//   console.log(`getPoolToken data`, funcNameHex);
// };

export const getPoolToken = async (tokenIndex, poolContract) => {
  const funcNameHex = `0x${keccak256(`token${tokenIndex}()`)
    .toString("hex")
    .slice(0, 8)}`;
  try {
    const result = await window.ethereum.request({
      id: randomID(1),
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          from: "0x0000000000000000000000000000000000000000",
          data: `${funcNameHex}`,
          to: poolContract,
        },
        "latest",
      ],
    });
    const token = `0x${result.slice(26, 66)}`;
    // console.log(`getPoolToken token`, tokenIndex, token);
    return token;
  } catch (error) {
    console.log(`getPoolToken error`, error);
    throw error;
  }
};

export const getTokenDetail = async (tokenIndex, poolContract) => {
  const contract = await getPoolToken(tokenIndex, poolContract);
  const { balanceOf, decimals, totalSupply } = await getTokenBalanceOfContract(
    contract,
    poolContract
  );
  const symbol = await getTokenSymbol(contract);
  const name = await getTokenName(contract);
  return {
    contract,
    balanceOf,
    decimals,
    symbol,
    name,
    totalSupply,
  };
};

export const getUniSwapPoolDetail = async (index) => {
  const contract = await getUniSwapPoolPair(index);
  const token0 = await getTokenDetail(0, contract);
  const token1 = await getTokenDetail(1, contract);
  console.log(token0);
  console.log(token1);
};
