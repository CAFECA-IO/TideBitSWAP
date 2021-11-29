import React, { useState, useEffect, useCallback, useMemo } from "react";
import ConnectorContext from "./connector-context";
import TideTimeSwapContract from "../modal/TideTimeSwapContract";
import Lunar from "@cafeca/lunar";
const { Config } = require("../constant/config");

const dummyOverview = [
  {
    title: "Volume 24H",
    data: {
      value: "1.65b",
      change: "-5.57%",
    },
  },
  {
    title: "Fees 24H",
    data: {
      value: "3.36m",
      change: "-4.42%",
    },
  },
  {
    title: "TVL",
    data: {
      value: "3.84b",
      change: "+0.71%",
    },
  },
];

export const ConnectorProvider = (props) => {
  const [currentNetwork, setCurrentNetwork] = useState(
    Lunar.Blockchains.EthereumTestnet
  );
  const ttsc = useMemo(
    () => new TideTimeSwapContract(Lunar.Blockchains.EthereumTestnet),
    []
  );
  const [connectOptions, setConnectOptions] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [routerContract, setRouterContract] = useState(null);
  const [nativeCurrency, setNativeCurrency] = useState(null);
  const [supportedNetworks, setSupportedNetworks] = useState([]);
  const [supportedPools, setSupportedPools] = useState([]);
  const [supportedTokens, setSupportedTokens] = useState([]);
  const [overview, setOverView] = useState([]);

  const [initial, setInitial] = useState(false);

  const getDatas = useCallback(async () => {
    const allPairLength = await ttsc.getContractDataLength();
    setNativeCurrency(ttsc.nativeCurrency);
    console.log(`allPairLength`, allPairLength);
    console.log(`ttsc.nativeCurrency`, ttsc.nativeCurrency);
    const supportedTokens = await ttsc.getSupportedTokens();
    console.log(`supportedTokens`, supportedTokens);
    // setSupportedTokens(supportedTokens);
    // -- TEST
    setIsLoading(true);
    // for (let i = 0; i < allPairLength; i++) {
    for (let i = 19; i < allPairLength; i++) {
      await ttsc.getContractData(i);
      // if (!isConnected) break;
    }
    setIsLoading(false);
    setOverView(dummyOverview);
  }, [ttsc]);

  useEffect(() => {
    getDatas().then(() => {
      setIsLoading(false);
    });
    return () => {};
  }, [getDatas]);

  useEffect(() => {
    setSupportedTokens(ttsc.assetList);
  }, [ttsc.assetList]);

  useEffect(() => {
    setSupportedPools(ttsc.poolList);
  }, [ttsc.poolList]);

  useEffect(() => {
    setSupportedNetworks(Lunar.listBlockchain({ testnet: Config.isTestnet }));
    return () => {};
  }, []);

  const connectHandler = useCallback(
    async (appName) => {
      try {
        setIsLoading(true);
        const result = await ttsc.connect(appName);
        setIsLoading(false);
        setIsConnected(true);
        setConnectedAccount(result.connectedAccount);
        setNativeCurrency(ttsc.nativeCurrency);
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
    await ttsc.disconnect();
    setIsConnected(false);
    setConnectedAccount(null);
    setInitial(false);
    setIsLoading(false);
  };

  const switchNetwork = useCallback(
    async (network) => {
      console.log(`switchNetwork network`, network);
      try {
        const result = await ttsc.switchNetwork(network);
        console.log(`switchNetwork result`, result);
        setCurrentNetwork(network);
        if (isConnected) setInitial(true);
      } catch (error) {
        console.log(`switchNetwork error`, error);
        setError({ ...error, hasError: true });
      }
    },
    [isConnected, ttsc]
  );
  const getContractDataLength = useCallback(
    async () => await ttsc.getContractDataLength(),
    [ttsc]
  );
  const getPoolBalanceOf = useCallback(
    async (pool, index) => await ttsc.getPoolBalanceOf(pool, index),
    [ttsc]
  );
  const getAssetBalanceOf = useCallback(
    async (asset, index) => await ttsc.getAssetBalanceOf(asset, index),
    [ttsc]
  );
  const getContractData = useCallback(
    async (index) => await ttsc.getContractData(index),
    [ttsc]
  );
  const getSelectedPool = useCallback(
    async (active, passive) => await ttsc.getSelectedPool(active, passive),
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
  const provideLiquidityWithETH = useCallback(
    async (pool, token, amountToken, amountNC) =>
      await ttsc.provideLiquidityWithETH(pool, token, amountToken, amountNC),
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
    async (amountIn, amountOut, tokens) =>
      await ttsc.swap(amountIn, amountOut, tokens),
    [ttsc]
  );
  const getAmountsIn = useCallback(
    async (amountOut, tokens) => await ttsc.getAmountsIn(amountOut, tokens),
    [ttsc]
  );
  const getAmountsOut = useCallback(
    async (amountIn, tokens) => await ttsc.getAmountsOut(amountIn, tokens),
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
        supportedPools,
        supportedTokens,
        overview,
        currentNetwork,
        nativeCurrency,
        error,
        isInit: () => setInitial(false),
        onConnect: connectHandler,
        onDisconnect: disconnectHandler,
        switchNetwork,
        getAssetBalanceOf,
        getPoolBalanceOf,
        getContractDataLength,
        getContractData,
        getSelectedPool,
        addToken,
        isAllowanceEnough,
        approve,
        createPair,
        provideLiquidity,
        provideLiquidityWithETH,
        getAmountsIn,
        getAmountsOut,
        swap,
        takeLiquidity,
        setSupportedTokens,
        setSupportedPools,
      }}
    >
      {props.children}
    </ConnectorContext.Provider>
  );
};
