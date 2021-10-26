import React, { useState, useEffect, useCallback, useMemo } from "react";
import { TideBitSwapRouter, uniswapRouter_v2 } from "../constant/constant";
import { wallet_switchEthereumChain } from "../Utils/ethereum";
import { openInNewTab } from "../Utils/utils";
import ConnectorContext from "./connector-context";
import TideTimeSwapContract from "../modal/TideTimeSwapContract";

export const ConnectorProvider = (props) => {
  const ttsc = useMemo(
    () => new TideTimeSwapContract(TideBitSwapRouter, "0x3"),
    []
  );
  const [connectOptions, setConnectOptions] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [factoryContract, setFactoryContract] = useState(null);
  const [routerContract, setRouterContract] = useState(null);
  const [chainId, setChainId] = useState(null);

  const connectHandler = useCallback(
    async (appName, connectInfo) => {
      try {
        const result = await ttsc.connect(appName);
        setIsConnected(true);
        setConnectedAccount(result.connectedAccount);
        setFactoryContract(result.factoryContract);
      } catch (error) {
        console.log(`connect error`, error);
        throw error;
      }
    },
    [ttsc]
  );

  const switchChainHandler = async (chainId) => {
    await wallet_switchEthereumChain(chainId);
    setChainId(chainId);
  };

  const disconnectHandler = async () => {
    setIsConnected(false);
  };

  const getPoolList = useCallback(async () => await ttsc.getPoolList(), [ttsc]);
  const addToken = useCallback(
    async (contract) => await ttsc.addToken(contract),
    [ttsc]
  );
  const isAllowanceEnough = useCallback(
    async (contract, amount, decimals) =>
      await ttsc.isAllowanceEnough(contract, amount, decimals),
    [ttsc]
  );
  const approve = useCallback(
    async (contract, amount, decimals) =>
      await ttsc.approve(contract, amount, decimals),
    [ttsc]
  );
  const createPair = useCallback(
    async (token0Contract, token1Contract) =>
      await ttsc.createPair(token0Contract, token1Contract),
    [ttsc]
  );
  const provideLiquidity = useCallback(
    async (tokenA, tokenB, amountADesired, amountBDesired) =>
      await ttsc.provideLiquidity(
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired
      ),
    [ttsc]
  );
  const swap = useCallback(
    async (amountIn, amountOut, amountInToken, amountOutToken) =>
      await ttsc.swap(amountIn, amountOut, amountInToken, amountOutToken),
    [ttsc]
  );
  const takeLiquidity = useCallback(
    async (poolPair, liquidity, amount0Min, amount1Min) =>
      await ttsc.takeLiquidity(poolPair, liquidity, amount0Min, amount1Min),
    [ttsc]
  );

  useEffect(() => {
    setRouterContract(ttsc.routerContract);
    setConnectOptions(ttsc.walletList);
    setChainId(ttsc.chainId);
  }, [ttsc]);

  return (
    <ConnectorContext.Provider
      value={{
        isConnected,
        connectOptions,
        connectedAccount,
        chainId,
        routerContract,
        factoryContract,
        onConnect: connectHandler,
        onDisconnect: disconnectHandler,
        onSwitch: switchChainHandler,
        getPoolList,
        addToken,
        isAllowanceEnough,
        approve,
        createPair,
        provideLiquidity,
        swap,
        takeLiquidity,
      }}
    >
      {props.children}
    </ConnectorContext.Provider>
  );
};
