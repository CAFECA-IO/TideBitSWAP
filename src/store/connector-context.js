import React from "react";

const ConnectorContext = React.createContext({
  initial: false,
  totalBalance: 0.0,
  totalReward: 0.0,
  fiat: {
    dollarSign: "$",
    symbol: "USD",
    exchangeRate: "1",
  },
  tvlChartData: [],
  volumeChartData: [],
  connectOptions: [],
  connectedAccount: null,
  routerContract: null,
  isLoading: true,
  error: null,
  isConnected: false,
  currentNetwork: null,
  supportedNetworks: [],
  supportedPools: [],
  supportedTokens: [],
  histories: [],
  overview: [],
  nativeCurrency: null,
  isInit: () => {},
  onDisconnect: () => {
    console.log(`onDisconnect`);
  },
  onConnect: (connectedAccount) => {
    console.log(`onConnect`, connectedAccount);
  },
  getTokenAAmount: (tokenA, tokenB, amountBDesired) => {},
  getTokenBmount: (tokenA, tokenB, amountADesired) => {},
  getAssetBalanceOf: async (asset, index) => {},
  getPoolBalanceOf: async (pool, index) => {},
  switchNetwork: async (network) => {},
  getContractDataLength: async () => {},
  getContractData: async (index) => {},
  getSelectedPool: async (active, passive) => {},
  searchToken: async (contract) => {},
  searchPool: async ({
    index,
    poolContract,
    token0Contract,
    token1Contract,
  }) => {},
  /**
   * @typedef {Object} AllowanceResult
   * @property {Boolean} isEnough
   * @property {string} allowanceAmount
   */
  /**
   *
   * @param {string} contract
   * @param {string} amount
   * @param {number} decimals
   * @returns {Promise<AllowanceResult>}
   */
  isAllowanceEnough: async (contract, amount, decimals) => {},
  approve: async (contract, amount, decimals) => {},
  createPair: async (token0Contract, token1Contract) => {},
  formateAddLiquidity: ({
    tokenA,
    tokenB,
    amountADesired,
    amountBDesired,
    type,
  }) => {},
  // addLiquidity: async (
  //   tokenA,
  //   tokenB,
  //   amountADesired,
  //   amountBDesired
  // ) => {},
  // addLiquidityETH: async (token, amountADesired, amountBDesired) => {},
  provideLiquidity: async (
    tokenA,
    tokenB,
    amountADesired,
    amountBDesired
  ) => {},
  getAmountsIn: async (amountOut, tokens) => {},
  getAmountsOut: async (amountIn, tokens) => {},
  swap: async (amountIn, amountOut, tokens, slippage, deadline) => {},
  swapExactTokensForETH: async (
    amountIn,
    amountOut,
    tokens,
    slippage,
    deadline
  ) => {},
  swapExactETHForTokens: async (
    amountIn,
    amountOut,
    tokens,
    slippage,
    deadline
  ) => {},
  takeLiquidity: async (poolPair, liquidity, amount0Min, amount1Min) => {},
  removeLiquidityETH: async (
    poolPair,
    token,
    liquidity,
    amountToken,
    amountETH
  ) => {},
  getPriceData: async (contract) => {},
});

export default ConnectorContext;
