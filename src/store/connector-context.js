import React from "react";

const ConnectorContext = React.createContext({
  isInit: false,
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
  notice: null,
  isConnected: false,
  currentNetwork: null,
  supportedNetworks: [],
  supportedPools: [],
  supportedTokens: [],
  supportedStakes: [],
  histories: [],
  overview: [],
  nativeCurrency: null,
  onDisconnect: () => {
    console.log(`onDisconnect`);
  },
  onConnect: async (appName) => {},
  getAssetBalanceOf: async (asset, index) => {},
  getPoolBalanceOf: async (pool, index) => {},
  switchNetwork: async (network) => {},
  searchToken: async (contract) => {},
  searchStake: async (contract) => {},
  getTokenHistory: async (contract) => {},
  getPoolHistory: async (contract) => {},
  searchPoolByPoolContract: async (poolContract) => {},
  searchPoolByTokensContract: async ({ token0Contract, token1Contract }) => {},
  searchPoolByTokens: async ({ token0, token1 }) => {},
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
  isAllowanceEnough: async (contract, amount, decimals, spender) => {},
  approve: async (contract,spender) => {},
  createPair: async (token0Contract, token1Contract) => {},
  formateAddLiquidity: ({
    pool,
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
  provideLiquidity: async ({
    tokenA,
    tokenB,
    amountADesired,
    amountBDesired,
    slippage,
    deadline,
    create,
    reverse,
  }) => {},
  getAmountsIn: async (amountOut, tokens) => {},
  getAmountsOut: async (amountIn, tokens) => {},
  getAmountIn: async (amountOut, tokens, reserveIn, reserveOut) => {},
  getAmountOut: async (amountIn, tokens, reserveIn, reserveOut) => {},
  swap: async (amountIn, amountOut, tokens, slippage, deadline, type) => {},
  takeLiquidity: async (
    poolPair,
    liquidity,
    amount0Min,
    amount1Min,
    slippage,
    deadline
  ) => {},
  removeLiquidityETH: async (
    poolPair,
    token,
    liquidity,
    amountToken,
    amountETH,
    slippage,
    deadline
  ) => {},
  getTokenPriceData: async (contract) => {},
  getPoolPriceData: async (contract) => {},
  deposit: async (to, token, amount) => {},
  withdraw: async (from, token, amount) => {},
});

export default ConnectorContext;
