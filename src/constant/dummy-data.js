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
