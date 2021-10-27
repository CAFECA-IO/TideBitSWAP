import React from "react";

const ConnectorContext = React.createContext({
  chainId: null,
  connectOptions: [],
  connectedAccount: null,
  routerContract: null,
  factoryContract: null,
  isLoading: false,
  isConnected: false,
  onDisconnect: () => {
    console.log(`onDisconnect`);
  },
  onConnect: (connectedAccount) => {
    console.log(`onConnect`, connectedAccount);
  },
  getPoolList: async () => {},
  getSelectedPool: async (supportedPools, active, passive) => {},
  addToken: async (contract) => {},
  isAllowanceEnough: async (contract, amount, decimals) => {},
  approve: async (contract, amount, decimals) => {},
  createPair: async (token0Contract, token1Contract) => {},
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
