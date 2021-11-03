import React, { useState, useEffect, useCallback, useMemo } from "react";
import ConnectorContext from "./connector-context";
import TideTimeSwapContract from "../modal/TideTimeSwapContract";
import Lunar from "@cafeca/lunar";
import Config from "../constant/config";

export const ConnectorProvider = (props) => {
  const ttsc = useMemo(
    () => new TideTimeSwapContract(Lunar.Blockchains.BSCTestnet),
    []
  );
  const [connectOptions, setConnectOptions] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [routerContract, setRouterContract] = useState(null);
  const [supportedNetworks, setSupportedNetworks] = useState([]); //Object.keys(Lunar.Blockchains);
  const [currentNetwork, setCurrentNetwork] = useState("EthereumTestnet");
  const [initial, setInitial] = useState(false);
  useEffect(() => {
    setSupportedNetworks(Lunar.listBlockchain({ testnet: Config.isTestnet }));
    return () => {};
  }, []);

  const connectHandler = useCallback(
    async (appName, connectInfo) => {
      try {
        setIsLoading(true);
        const result = await ttsc.connect(appName);
        setIsLoading(false);
        setIsConnected(true);
        setInitial(true);
        setConnectedAccount(result.connectedAccount);
      } catch (error) {
        console.log(`connect error`, error);
        setError({
          hasError: true,
          message: error.message,
        });
        setIsLoading(false);
        throw error;
      }
    },
    [ttsc]
  );

  const disconnectHandler = async () => {
    setIsConnected(false);
  };

  const switchNetwork = useCallback(
    async (network) => {
      console.log(`switchNetwork network`, network);
      try {
        const result = await ttsc.switchNetwork(network);
        console.log(`switchNetwork result`, result);
        // setInitial(true);
        setCurrentNetwork(network);
      } catch (error) {
        console.log(`switchNetwork error`, error);
        setError(error);
      }
      setInitial(true); // test
    },
    [ttsc]
  );

  const getContractDataLength = useCallback(
    async () => await ttsc.getContractDataLength(),
    [ttsc]
  );
  const getContractData = useCallback(
    async (index) => await ttsc.getContractData(index),
    [ttsc]
  );
  const getSelectedPool = useCallback(
    async (supportedPools, active, passive) =>
      await ttsc.getSelectedPool(supportedPools, active, passive),
    [ttsc]
  );
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
  const getAmountsIn = useCallback(
    async (amountOut, amountInToken, amountOutToken) =>
      await ttsc.getAmountsIn(amountOut, amountInToken, amountOutToken),
    [ttsc]
  );
  const getAmountsOut = useCallback(
    async (amountIn, amountInToken, amountOutToken) =>
      await ttsc.getAmountsOut(amountIn, amountInToken, amountOutToken),
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
  }, [ttsc]);

  return (
    <ConnectorContext.Provider
      value={{
        initial,
        isLoading,
        isConnected,
        connectOptions,
        connectedAccount,
        routerContract,
        supportedNetworks,
        currentNetwork,
        error,
        isInit: () => setInitial(false),
        onConnect: connectHandler,
        onDisconnect: disconnectHandler,
        switchNetwork,
        getContractDataLength,
        getContractData,
        getSelectedPool,
        addToken,
        isAllowanceEnough,
        approve,
        createPair,
        provideLiquidity,
        getAmountsIn,
        getAmountsOut,
        swap,
        takeLiquidity,
      }}
    >
      {props.children}
    </ConnectorContext.Provider>
  );
};
