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
  const ttsc = useMemo(
    () => new TideTimeSwapContract(Lunar.Blockchains.EthereumTestnet),
    []
  );
  const [currentNetwork, setCurrentNetwork] = useState(
    Lunar.Blockchains.EthereumTestnet
  );
  const [supportedNetworks, setSupportedNetworks] = useState(
    Lunar.listBlockchain({ testnet: Config.isTestnet })
  );

  const [connectOptions, setConnectOptions] = useState(ttsc.walletList);

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [nativeCurrency, setNativeCurrency] = useState(null);
  const [fiat, setFiat] = useState({
    dollarSign: "$",
    symbol: "USD",
    exchangeRate: "1",
  });
  const [supportedPools, setSupportedPools] = useState([]);
  const [supportedTokens, setSupportedTokens] = useState([]);
  const [overview, setOverView] = useState([]);

  const [initial, setInitial] = useState(false);
  const [error, setError] = useState(null);

  const [connectedAccount, setConnectedAccount] = useState(null);
  const [totalBalance, setTotalBalance] = useState("0.0");
  const [totalReward, setTotalReward] = useState("-.-");
  const [histories, setHistories] = useState([]);

  ttsc.messenger?.subscribe((v) => {
    console.log(`ttsc.messenger`, v);
    switch (v.evt) {
      case `UpdateConnectedStatus`:
        setIsConnected(v.data);
        if (v.data) {
          setIsConnected(v.data);
          setConnectedAccount(ttsc.connectedAccount);
          setNativeCurrency(ttsc.nativeCurrency);
        } else {
          setIsConnected(v.data);
          setConnectedAccount(null);
          setInitial(v.data);
          setIsLoading(v.data);
        }
        break;
      case `UpdateTotalBalance`:
        setTotalBalance(v.data);
        break;
      case `UpdateConnectedAccount`:
        setConnectedAccount(v.data);
        break;
      case `UpdateNativeCurrency`:
        setNativeCurrency(v.data);
        break;
      case `UpdateSupportedNetworks`:
        setSupportedNetworks(v.data);
        break;
      case `UpdateConnectOptions(`:
        setConnectOptions(ttsc.walletList);
        break;
      case `UpdateNetwork`:
        setCurrentNetwork(v.data);
        break;
      case `UpdateSupportedTokens`:
        setSupportedTokens(v.data);
        break;
      case `UpdateSupportedPools`:
        setSupportedPools(v.data);
        break;
      case `UpdateHistories`:
        setHistories(v.data);
        break;
      default:
        break;
    }
  });

  useEffect(() => {
    ttsc.start().then(() => {
      setOverView(dummyOverview);
      setIsLoading(false);
    });
    return () => {};
  }, [ttsc]);

  const connectHandler = useCallback(
    async (appName) => {
      try {
        setIsLoading(true);
        await ttsc.connect(appName);
      } catch (error) {
        console.log(`connect error`, error);
        setError({
          hasError: true,
          message: error.message,
        });
        throw error;
      }
      setIsLoading(false);
    },
    [ttsc]
  );

  const disconnectHandler = async () => {
    try {
      await ttsc.disconnect();
    } catch (error) {
      console.log(`disconnect error`, error);
      setError({ ...error, hasError: true });
    }
  };

  const switchNetwork = useCallback(
    async (network) => {
      console.log(`switchNetwork network`, network);
      try {
        await ttsc.switchNetwork(network);
      } catch (error) {
        console.log(`switchNetwork error`, error);
        setError({ ...error, hasError: true });
      }
    },
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

  const searchPool = useCallback(
    async ({ index, poolContract, token0Contract, token1Contract }) =>
      await ttsc.searchPool({
        index,
        poolContract,
        token0Contract,
        token1Contract,
      }),
    [ttsc]
  );

  const searchToken = useCallback(
    async (contract) => await ttsc.searchToken(contract),
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
  const addLiquidityETH = useCallback(
    async (pool, token, amountToken, amountNC) =>
      await ttsc.addLiquidityETH(pool, token, amountToken, amountNC),
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
  const swapExactTokensForETH = useCallback(
    async (amountIn, amountOut, tokens) =>
      await ttsc.swapExactTokensForETH(amountIn, amountOut, tokens),
    [ttsc]
  );
  const swapExactETHForTokens = useCallback(
    async (amountIn, amountOut, tokens) =>
      await ttsc.swapExactETHForTokens(amountIn, amountOut, tokens),
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

  const removeLiquidityETH = useCallback(
    async (poolPair, token, liquidity, amountToken, amountETH) =>
      await ttsc.removeLiquidityETH(
        poolPair,
        token,
        liquidity,
        amountToken,
        amountETH
      ),
    [ttsc]
  );

  const getTokenAAmount = useCallback(
    (tokenA, tokenB, amountBDesired) =>
      ttsc.getTokenAAmount(tokenA, tokenB, amountBDesired),
    [ttsc]
  );
  const getTokenBAmount = useCallback(
    (tokenA, tokenB, amountADesired) =>
      ttsc.getTokenBAmount(tokenA, tokenB, amountADesired),
    [ttsc]
  );

  return (
    <ConnectorContext.Provider
      value={{
        fiat,
        totalBalance,
        totalReward,
        initial,
        isLoading,
        isConnected,
        connectOptions,
        connectedAccount,
        // routerContract,
        histories,
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
        // getContractDataLength,
        // getContractData,
        // getSelectedPool,
        searchPool,
        searchToken,
        isAllowanceEnough,
        approve,
        createPair,
        provideLiquidity,
        addLiquidityETH,
        getAmountsIn,
        getAmountsOut,
        swap,
        swapExactTokensForETH,
        swapExactETHForTokens,
        takeLiquidity,
        removeLiquidityETH,
        setSupportedTokens,
        setSupportedPools,
        getTokenAAmount,
        getTokenBAmount,
      }}
    >
      {props.children}
    </ConnectorContext.Provider>
  );
};
