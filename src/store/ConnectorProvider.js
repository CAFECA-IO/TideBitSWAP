import React, { useState, useEffect, useCallback, useMemo } from "react";
import Lunar from "@cafeca/lunar";
import ConnectorContext from "./connector-context";

export const ConnectorProvider = (props) => {
  const ttsc = useMemo(() => props.ttsc, [props.ttsc]);
  const [currentNetwork, setCurrentNetwork] = useState(
    Lunar.Blockchains.EthereumTestnet
  );
  const [supportedNetworks, setSupportedNetworks] = useState(
    props.supportedNetworks
  );

  const [connectOptions, setConnectOptions] = useState(ttsc.walletList);

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [nativeCurrency, setNativeCurrency] = useState(null);

  const [supportedPools, setSupportedPools] = useState([]);
  const [supportedTokens, setSupportedTokens] = useState([]);
  const [tvlChartData, setTVLChartData] = useState([]);
  const [volumeChartData, setVolumeChartData] = useState([]);
  const [overview, setOverView] = useState([]);

  const [initial, setInitial] = useState(false);
  const [error, setError] = useState(null);

  const [connectedAccount, setConnectedAccount] = useState(null);
  const [totalBalance, setTotalBalance] = useState("0.0");
  const [totalReward, setTotalReward] = useState("-.-");
  const [histories, setHistories] = useState([]);

  useEffect(() => {
    console.log(`useEffect ttsc`, ttsc);
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
        case `UpdateChart`:
          setTVLChartData(v.data.tvl);
          setVolumeChartData(v.data.volume);
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
          setIsLoading(false);
          break;
        case `UpdateSupportedPools`:
          setSupportedPools(v.data);
          break;
        case `UpdateHistories`:
          setHistories(v.data);
          break;
        case `UpdateOveriew`:
          setOverView(v.data);
          break;
        default:
          break;
      }
    });
    ttsc.start();
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

  const getPriceData = useCallback(
    async (contract) => await ttsc.getPriceData(contract),
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
  const formateAddLiquidity = useCallback(
    ({ tokenA, tokenB, amountADesired, amountBDesired, type }) =>
      ttsc.formateAddLiquidity({
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired,
        type,
      }),
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
    async (amountIn, amountOut, tokens, slippage, deadline) =>
      await ttsc.swap(amountIn, amountOut, tokens, slippage, deadline),
    [ttsc]
  );
  const swapExactTokensForETH = useCallback(
    async (amountIn, amountOut, tokens, slippage, deadline) =>
      await ttsc.swapExactTokensForETH(
        amountIn,
        amountOut,
        tokens,
        slippage,
        deadline
      ),
    [ttsc]
  );
  const swapExactETHForTokens = useCallback(
    async (amountIn, amountOut, tokens, slippage, deadline) =>
      await ttsc.swapExactETHForTokens(
        amountIn,
        amountOut,
        tokens,
        slippage,
        deadline
      ),
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
        tvlChartData,
        volumeChartData,
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
        getPriceData,
        searchToken,
        isAllowanceEnough,
        approve,
        createPair,
        formateAddLiquidity,
        provideLiquidity,
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
