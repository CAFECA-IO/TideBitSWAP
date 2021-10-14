export const uniswapContract_v2 = `0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f`;

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

export const liquidityType = {
  PROVIDE: "Provide",
  TAKE: "Take",
};
