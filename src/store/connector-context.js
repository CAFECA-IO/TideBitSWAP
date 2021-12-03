import React from "react";

const ConnectorContext = React.createContext({
  initial: false,
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
  overview: [],
  nativeCurrency: null,
  isInit: () => {},
  onDisconnect: () => {
    console.log(`onDisconnect`);
  },
  onConnect: (connectedAccount) => {
    console.log(`onConnect`, connectedAccount);
  },
  getTokenAAmount:(tokenA, tokenB, amountBDesired)=>{},
  getTokenBmount:(tokenA, tokenB, amountADesired)=>{},
  getAssetBalanceOf: async (asset, index) => {},
  getPoolBalanceOf: async (pool, index) => {},
  switchNetwork: async (network) => {},
  getContractDataLength: async () => {},
  getContractData: async (index) => {},
  getSelectedPool: async (active, passive) => {},
  searchToken: async (contract) => {},
  searchPool: async ({ index, poolContract, token0Contract, token1Contract }) => {},
  isAllowanceEnough: async (contract, amount, decimals) => {},
  approve: async (contract, amount, decimals) => {},
  createPair: async (token0Contract, token1Contract) => {},
  addLiquidityETH: async (pool, token, amountToken, amountNC) => {},
  provideLiquidity: async (
    tokenA,
    tokenB,
    amountADesired,
    amountBDesired
  ) => {},
  getAmountsIn: async (amountOut, tokens) => {},
  getAmountsOut: async (amountIn, tokens) => {},
  swap: async (amountIn, amountOut, tokens) => {},
  swapExactTokensForETH: async (amountIn, amountOut, tokens) => {},
  swapExactETHForTokens: async (amountIn, amountOut, tokens) => {},
  takeLiquidity: async (poolPair, liquidity, amount0Min, amount1Min) => {},
  removeLiquidityETH: async (
    poolPair,
    token,
    liquidity,
    amountToken,
    amountETH
  ) => {},
  setSupportedTokens: (list) => {},
  setSupportedPools: (list) => {},
});

export default ConnectorContext;
