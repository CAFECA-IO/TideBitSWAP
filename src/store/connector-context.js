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
  getAssetBalanceOf: async (asset) => {},
  getPoolBalanceOf: async (pool) => {},
  switchNetwork: async (network) => {},
  getContractDataLength: async () => {},
  getContractData: async (index) => {},
  getSelectedPool: async (supportedPools, active, passive) => {},
  addToken: async (contract) => {},
  isAllowanceEnough: async (contract, amount, decimals) => {},
  approve: async (contract, amount, decimals) => {},
  createPair: async (token0Contract, token1Contract) => {},
  provideLiquidityWithETH: async (pool, token, amountToken, amountNC) => {},
  provideLiquidity: async (
    tokenA,
    tokenB,
    amountADesired,
    amountBDesired
  ) => {},
  getAmountsIn: async (amountOut, amountInToken, amountOutToke) => {},
  getAmountsOut: async (amountIn, amountInToken, amountOutToke) => {},
  swap: async (amountIn, amountOut, amountInToken, amountOutToke) => {},
  takeLiquidity: async (poolPair, liquidity, amount0Min, amount1Min) => {},
});

export default ConnectorContext;
