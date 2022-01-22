import React, { useState, useEffect, useCallback, useMemo } from "react";

import ConnectorContext from "./connector-context";
import TideTimeSwapContract from "../modal/TideTimeSwapContract";
import { Config } from "../constant/config";

export const ConnectorProvider = (props) => {
  const ttsc = useMemo(
    () => new TideTimeSwapContract(props.communicator),
    [props.communicator]
  );
  const [currentNetwork, setCurrentNetwork] = useState(ttsc.network);
  const [supportedNetworks, setSupportedNetworks] = useState(
    ttsc.supportedNetworks
  );

  const [connectOptions, setConnectOptions] = useState(ttsc.walletList);

  const [isInit, setIsInit] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [nativeCurrency, setNativeCurrency] = useState(null);

  const [supportedPools, setSupportedPools] = useState([]);
  const [supportedTokens, setSupportedTokens] = useState([]);
  const [supportedStakes, setSupportedStakes] = useState([]);
  const [tvlChartData, setTVLChartData] = useState([]);
  const [volumeChartData, setVolumeChartData] = useState([]);
  const [overview, setOverView] = useState([]);

  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [noticeError, setNoticeError] = useState(null);

  const [connectedAccount, setConnectedAccount] = useState(null);
  const [totalBalance, setTotalBalance] = useState("0.0");
  const [totalReward, setTotalReward] = useState("-.-");
  const [histories, setHistories] = useState([]);

  useEffect(() => {
    if (Config[Config.status].debug) console.log(`useEffect ttsc`, ttsc);
    ttsc.messenger?.subscribe((v) => {
      if (Config[Config.status].debug) console.log(`ttsc.messenger`, v);
      switch (v.evt) {
        case `Error`:
          console.log(`ttsc.messenger`, v);
          setNoticeError(v.error);
          break;
        case `Notice`:
          if (Config[Config.status].debug) setNotice(v.message);
          else if (!v.debug) {
            console.log(`ttsc.messenger`, v);
            setNotice(v.message);
          }
          break;
        case `UpdateConnectedStatus`:
          setIsConnected(v.data);
          if (v.data) {
            setIsConnected(v.data);
            setConnectedAccount(ttsc.connectedAccount);
            setNativeCurrency(ttsc.nativeCurrency);
          } else {
            setIsConnected(v.data);
            setConnectedAccount(null);
          }
          break;
        case `isInit`:
          setIsInit(v.data);
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
        case `UpdateSupportedStakes`:
          setSupportedStakes(v.data);
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
    // setIsLoading(true);
    // ttsc.start().then(() => setIsLoading(false));
    try {
      ttsc
        .init()
        .then(() => setIsLoading(false))
        .catch((error) => {
          setError(error);
          setIsLoading(false);
        });
    } catch (error) {
      setError(error);
    }

    return () => {};
  }, [ttsc]);

  const connectHandler = useCallback(
    async (appName) => {
      setIsLoading(true);
      try {
        await ttsc.connect(appName);
      } catch (error) {
        console.log(`connect error`, error);
        setError(error);
      }
      setIsLoading(false);
    },
    [ttsc]
  );

  const switchNetwork = useCallback(
    async (network) => {
      setIsLoading(true);
      console.log(`switchNetwork network`, network);
      try {
        await ttsc.switchNetwork(network);
      } catch (error) {
        console.log(`switchNetwork error`, error);
        setError(error);
      }
      setIsLoading(false);
    },
    [ttsc]
  );

  const searchPoolByTokens = useCallback(
    async ({ token0, token1 }) => {
      try {
        return await ttsc.searchPoolByTokens({
          token0,
          token1,
        });
      } catch (error) {
        console.log(`searchPoolByTokens error`, error);
        setError(error);
      }
    },
    [ttsc]
  );

  const searchPoolByPoolContract = useCallback(
    async (poolContract) => {
      try {
        return await ttsc.searchPoolByPoolContract(poolContract);
      } catch (error) {
        console.log(`searchPoolByPoolContract error`, error);
        setError(error);
      }
    },
    [ttsc]
  );

  const getTokenHistory = useCallback(
    async (contract) => {
      try {
        return await ttsc.getTokenHistory(contract);
      } catch (error) {
        console.log(`getTokenHistory error`, error);
        setError(error);
      }
    },
    [ttsc]
  );

  const getPoolHistory = useCallback(
    async (poolContract) => {
      try {
        return await ttsc.getPoolHistory(poolContract);
      } catch (error) {
        console.log(`getPoolHistory error`, error);
        setError(error);
      }
    },
    [ttsc]
  );

  const getTokenPriceData = useCallback(
    async (contract) => {
      try {
        return await ttsc.getTokenPriceData(contract);
      } catch (error) {
        console.log(`getTokenPriceData error`, error);
        setError(error);
      }
    },
    [ttsc]
  );

  const getPoolPriceData = useCallback(
    async (contract) => {
      try {
        return await ttsc.getPoolPriceData(contract);
      } catch (error) {
        console.log(`getPoolPriceData error`, error);
        setError(error);
      }
    },
    [ttsc]
  );

  const searchToken = useCallback(
    async (contract) => {
      try {
        return await ttsc.searchToken(contract);
      } catch (error) {
        console.log(`searchToken error`, error);
        setError(error);
      }
    },
    [ttsc]
  );

  const searchStake = useCallback(
    async (contract) => {
      try {
        return await ttsc.searchStake(contract);
      } catch (error) {
        console.log(`searchStake error`, error);
        setError(error);
      }
    },
    [ttsc]
  );

  const isAllowanceEnough = useCallback(
    async (contract, amount, decimals, spender) =>
      await ttsc.isAllowanceEnough(contract, amount, decimals, spender),
    [ttsc]
  );
  const approve = useCallback(
    async (contract, spender) => await ttsc.approve(contract, spender),
    [ttsc]
  );
  const createPair = useCallback(
    async (token0Contract, token1Contract) =>
      await ttsc.createPair(token0Contract, token1Contract),
    [ttsc]
  );
  const formateAddLiquidity = useCallback(
    ({ pool, tokenA, tokenB, amountADesired, amountBDesired, type }) =>
      ttsc.formateAddLiquidity({
        pool,
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired,
        type,
      }),
    [ttsc]
  );

  const provideLiquidity = useCallback(
    async ({
      tokenA,
      tokenB,
      amountADesired,
      amountBDesired,
      slippage,
      deadline,
      create,
      reverse,
    }) =>
      await ttsc.provideLiquidity({
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired,
        slippage,
        deadline,
        create,
        reverse,
      }),
    [ttsc]
  );
  const swap = useCallback(
    async (amountIn, amountOut, tokens, slippage, deadline, type) =>
      await ttsc.swap(amountIn, amountOut, tokens, slippage, deadline, type),
    [ttsc]
  );

  const getAmountIn = useCallback(
    async (amountOut, tokens, reserveIn, reserveOut) =>
      await ttsc.getAmountIn(amountOut, tokens, reserveIn, reserveOut),
    [ttsc]
  );
  const getAmountOut = useCallback(
    async (amountIn, tokens, reserveIn, reserveOut) =>
      await ttsc.getAmountOut(amountIn, tokens, reserveIn, reserveOut),
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
    async (poolPair, liquidity, amount0Min, amount1Min, slippage, deadline) =>
      await ttsc.takeLiquidity(
        poolPair,
        liquidity,
        amount0Min,
        amount1Min,
        slippage,
        deadline
      ),
    [ttsc]
  );

  const removeLiquidityETH = useCallback(
    async (
      poolPair,
      token,
      liquidity,
      amountToken,
      amountETH,
      slippage,
      deadline
    ) =>
      await ttsc.removeLiquidityETH(
        poolPair,
        token,
        liquidity,
        amountToken,
        amountETH,
        slippage,
        deadline
      ),
    [ttsc]
  );

  const deposit = useCallback(
    async (to, token, amount) => await ttsc.deposit(to, token, amount),
    [ttsc]
  );

  const withdraw = useCallback(
    async (from, token, amount) => await ttsc.withdraw(from, token, amount),
    [ttsc]
  );

  return (
    <ConnectorContext.Provider
      value={{
        tvlChartData,
        volumeChartData,
        totalBalance,
        totalReward,
        isInit,
        isLoading,
        isConnected,
        connectOptions,
        connectedAccount,
        // routerContract,
        histories,
        supportedNetworks,
        supportedPools,
        supportedTokens,
        supportedStakes,
        overview,
        currentNetwork,
        nativeCurrency,
        notice,
        error,
        noticeError,
        onConnect: connectHandler,
        switchNetwork,
        searchPoolByPoolContract,
        searchPoolByTokens,
        getTokenPriceData,
        getPoolPriceData,
        searchToken,
        searchStake,
        isAllowanceEnough,
        approve,
        createPair,
        formateAddLiquidity,
        provideLiquidity,
        getAmountIn,
        getAmountsIn,
        getAmountOut,
        getAmountsOut,
        swap,
        takeLiquidity,
        removeLiquidityETH,
        getTokenHistory,
        getPoolHistory,
        deposit,
        withdraw,
      }}
    >
      {props.children}
    </ConnectorContext.Provider>
  );
};
