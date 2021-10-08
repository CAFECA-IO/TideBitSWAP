import { randomID } from "../Utils/utils";

export const dummyCoins = [
  {
    id:randomID(6),
    iconSrc: "https://www.tidebit.one/icons/btc.png",
    name: "Bitcoin",
    symbol: "BTC",
    max: 0.1,
  },
  {
    id:randomID(6),
    iconSrc: "https://www.tidebit.one/icons/eth.png",
    name: "Ethereum",
    symbol: "ETH",
    max: 1,
  },
  {
    id:randomID(6),
    iconSrc: "https://www.tidebit.one/icons/bch.png",
    name: "Bitcoin Cash",
    symbol: "BCH",
    max: 0,
  },
  {
    id:randomID(6),
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
    explain:
      "Estimated price of the swap, not the final price that the swap is executed.",
  },
  {
    title: "Slippage",
    value: "--",
    explain:
      "The estimated percentage that the ultimate executed price of the swap deviates from current price due to trading amount.",
  },
  {
    title: "Fee",
    value: "--",
    explain: "Trade transaction fee collected by liquidity providers.",
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
    type: "Deposit",
    coin: "Bitcoin",
    iconSrc: "https://www.tidebit.one/icons/btc.png",
    amount: "0.1 BTC",
    date: Date.now(),
  },
  {
    id: randomID(6),
    type: "Deposit",
    coin: "Ethereum",
    iconSrc: "https://www.tidebit.one/icons/eth.png",
    amount: "1 ETH",
    date: Date.now(),
  },
  {
    id: randomID(6),
    type: "Create Pool",
    name: "BTC/ETH",
    iconSrcs: [
      "https://www.tidebit.one/icons/btc.png",
      "https://www.tidebit.one/icons/eth.png",
    ],
    amount: "0.1 BTC + 1 ETH",
    date: Date.now(),
  },
  {
    id: randomID(6),
    type: "Deposit",
    coin: "Ethereum",
    iconSrc: "https://www.tidebit.one/icons/eth.png",
    amount: "1 ETH",
    date: Date.now(),
  },
  {
    id: randomID(6),
    type: "Swap",
    name: "BTC/USDT",
    iconSrcs: [
      "https://www.tidebit.one/icons/btc.png",
      "https://www.tidebit.one/icons/usdt.png",
    ],
    amount: "0.1 BTC / 1 USDT",
    date: Date.now(),
  },
  {
    id: randomID(6),
    type: "Add Liquidity",
    name: "ETH/USDT",
    iconSrcs: [
      "https://www.tidebit.one/icons/eth.png",
      "https://www.tidebit.one/icons/usdt.png",
    ],
    amount: "1 ETH + 100 USDT",
    date: Date.now(),
  },
  {
    id: randomID(6),
    type: "Take Liquidity",
    name: "BTC/ETH",
    iconSrcs: [
      "https://www.tidebit.one/icons/btc.png",
      "https://www.tidebit.one/icons/eth.png",
    ],
    amount: "0.1 BTC + 1 ETH",
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
    name: "USDT/BTC",
    iconSrcs: [
      "https://www.tidebit.one/icons/usdt.png",
      "https://www.tidebit.one/icons/btc.png",
    ],
    liquidity: "6,211,860 USD",
    composition: "5,326.1 USDT + 139.21 BTC",
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

export const dummyNetworks = [
  {
    name: "TideTan Chain",
    symbol: "TTT",
    time: "2 mins",
    fee: {
      crypto: '0.000061',
      fiat: "0.218014",
    }
  },
  {
    name: "TideBit Smart Contract",
    symbol: "TSC",
    time: "1 min",
    fee: {
      crypto: '0.000061',
      fiat: "0.000021",
    }
  },
  {
    name: "Ethereum(ERC20)",
    symbol: "ETH",
    time: "3 min",
    fee: {
      crypto: '0.00051',
      fiat: "28.12",
    }
  }
]
