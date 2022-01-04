export const uniswapFactory_v2 = `0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f`;
export const uniswapRouter_v2 = `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D`;
export const TideBitSwapRouter = `0xDDBCB302A16f27D12Ef1cA491b4791a7b3d67c04`;
// export const TideBitSwapRouter = `0x3753a62d7654b072aa379866391e4a10000dcc53`;
export const BinanceSwapRouter = `0x214798a5ca2Fc1cD0d9E4020eCA384406AB67755`;
export const tidetime = {
  chainId: "0x1f51",
  chainName: "Tidetime",
  nativeCurrency: {
    name: "Tidetime Token",
    symbol: "TTT",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.tidebit.network"],
  iconUrls: ["https://iconape.com/wp-content/png_logo_vector/tidebit.png"],
};
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

export const connectOptions = [
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/440px-MetaMask_Fox.svg.png",
    name: "MetaMask",
  },
];

export const poolTypes = {
  ALL: "All Pools",
  STABLE: "Stable Pools",
  INNOVATION: "Innovation Pools",
};

export const sortingConditions = {
  YIELD: "Total Yield (Hight to Low)",
  LIQUIDITY: "Liuqidity (Hight to Low)",
  VOLUME: "Volume in 24 hr (Hight to Low)",
};


export const stakeSorting = {
  HOT: "Hot",
  APR: "APR",
  EARNED: "Earned",
  TOTALSTAKED: "Total staked",
};

export const liquidityType = {
  PROVIDE: "Provide",
  TAKE: "Take",
};

export const transactionType = {
  ALL: "All",
  SWAPS: "Swaps",
  ADDS: "Adds",
  REMOVES: "Removes",
};
