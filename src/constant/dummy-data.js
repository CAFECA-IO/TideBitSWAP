import { randomID } from "../Utils/utils";

export const dummyOptions = [
  {
    iconSrc: "https://www.tidebit.one/icons/btc.png",
    name: "Bitcoin",
    symbol: "BTC",
    max: 0.1,
  },
  {
    iconSrc: "https://www.tidebit.one/icons/eth.png",
    name: "Ethereum",
    symbol: "ETH",
    max: 1,
  },
  {
    iconSrc: "https://www.tidebit.one/icons/bch.png",
    name: "Bitcoin Cash",
    symbol: "BCH",
    max: 0,
  },
  {
    iconSrc: "https://www.tidebit.one/icons/usdt.png",
    name: "TetherUS",
    symbol: "USDT",
    max: 0,
  },
];

export const dummyDetails = [
  {
    title: "Price",
    value: "--",
  },
  {
    title: "Slippage",
    value: "--",
  },
  {
    title: "Fee",
    value: "--",
  },
];

export const buttonOptions = [
  {
    value: "0.05%",
    detail: "Best for stable pairs.",
  },
  {
    value: "0.3%",
    detail: "Best for most pairs.",
  },
  {
    value: "1%",
    detail: "Best for exotic pairs.",
  },
];

export const historyData = [
  {
    id: randomID(6),
    type: "deposite",
    coin: "Bitcoin",
    iconSrc: "https://www.tidebit.one/icons/btc.png",
    amount: "0.1 BTC",
    date: Date.now(),
  },
  {
    id: randomID(6),
    type: "deposite",
    coin: "Ethereum",
    iconSrc: "https://www.tidebit.one/icons/eth.png",
    amount: "1 ETH",
    date: Date.now(),
  },
  {
    id: randomID(6),
    type: "create-pool",
    pair: "BTC/ETH",
    iconSrcs: [
      "https://www.tidebit.one/icons/btc.png",
      "https://www.tidebit.one/icons/eth.png",
    ],
    amount: "0.1 BTC + 1 ETH",
    date: Date.now(),
  },
  {
    id: randomID(6),
    type: "add-liquidity",
    pair: "BTC/ETH",
    iconSrcs: [
      "https://www.tidebit.one/icons/btc.png",
      "https://www.tidebit.one/icons/eth.png",
    ],
    amount: "0.1 BTC + 1 ETH",
    date: Date.now(),
  },
  {
    id: randomID(6),
    type: "take-liquidity",
    pair: "BTC/ETH",
    iconSrcs: [
      "https://www.tidebit.one/icons/btc.png",
      "https://www.tidebit.one/icons/eth.png",
    ],
    amount: "0.1 BTC + 1 ETH",
    date: Date.now(),
  },
  {
    id: randomID(6),
    type: "swap",
    pair: "BTC/ETH",
    iconSrcs: [
      "https://www.tidebit.one/icons/btc.png",
      "https://www.tidebit.one/icons/eth.png",
    ],
    amount: "0.1 BTC / 1 ETH",
    date: Date.now(),
  },
];

export const assetsData = [
  {
    id: randomID(6),
    coin: "Bitcoin",
    iconSrc: "https://www.tidebit.one/icons/btc.png",
    composition: ["0.1 BTC", "0 BTC"],
    balance: "$57,911.20",
  },
  {
    id: randomID(6),

    coin: "Ethereum",
    iconSrc: "https://www.tidebit.one/icons/eth.png",
    composition: ["1 ETH", "0 ETH"],
    balance: "$24,532.23",
  },
];

export const connectOptions = [
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/440px-MetaMask_Fox.svg.png",
    name: "Metamask",
  },
];

export const dummyPools = [
  {
    id: randomID(6),
    name: "ETH/BTC",
    iconSrcs: [
      "https://www.tidebit.one/icons/eth.png",
      "https://www.tidebit.one/icons/btc.png",
    ],
    liquidity: "6,211,860 USD",
    composition: "5,326.1 ETH + 139.21 BTC",
    yield: "14.3%",
    rewardIconSrc: "https://www.tidebit.one/icons/usdt.png",
    rewardCoinSymbol: "USDT",
    volume: "9,173,505 USD",
  },
  {
    id: randomID(6),
    name: "USTD/BTC",
    iconSrcs: [
      "https://www.tidebit.one/icons/usdt.png",
      "https://www.tidebit.one/icons/btc.png",
    ],
    liquidity: "6,211,860 USD",
    composition: "5,326.1 USTD + 139.21 BTC",
    yield: "14.3%",
    rewardIconSrc: "https://www.tidebit.one/icons/usdt.png",
    rewardCoinSymbol: "USDT",
    volume: "9,173,505 USD",
  },
  {
    id: randomID(6),
    name: "ETH/USDT",
    iconSrcs: [
      "https://www.tidebit.one/icons/eth.png",
      "https://www.tidebit.one/icons/usdt.png",
    ],
    liquidity: "6,211,860 USD",
    composition: "5,326.1 ETH + 139.21 USDT",
    yield: "14.3%",
    rewardIconSrc: "https://www.tidebit.one/icons/usdt.png",
    rewardCoinSymbol: "USDT",
    volume: "9,173,505 USD",
  },
];
