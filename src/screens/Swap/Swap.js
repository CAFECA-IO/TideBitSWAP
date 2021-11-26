import React, { useState, useEffect, useContext, useCallback } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
// import CandleStickChart from "../../components/CandleStickChart/CandleStickChart";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import {
  formateDecimal,
  coinPairUpdateHandler,
  amountUpdateHandler,
  getDummyCandleStickData,
  randomCandleStickData,
} from "../../Utils/utils";
import Pairs from "./Pairs";
import classes from "./Swap.module.css";
import SwapPannel from "./SwapPannel";
import { useHistory, useLocation } from "react-router";

import SafeMath from "../../Utils/safe-math";

export const getDetails = (pool, seletedCoin, pairedCoin) => {
  let _price, _updatePrice, _impact;
  if (pool) {
    _price = SafeMath.div(pool?.poolBalanceOfToken1, pool?.poolBalanceOfToken0);
    if (pairedCoin?.amount && seletedCoin?.amount) {
      _updatePrice = SafeMath.div(
        SafeMath.plus(pool?.poolBalanceOfToken1, pairedCoin?.amount),
        SafeMath.minus(pool?.poolBalanceOfToken0, seletedCoin?.amount)
      );
      _impact = SafeMath.mult(
        SafeMath.div(SafeMath.minus(_updatePrice, _price), _price),
        "100"
      );
      console.log(`_impact`, _impact);
    }
  }

  return [
    {
      title: "Price",
      value: `1 ${pool?.token0?.symbol || "--"} ≈ ${
        _price ? formateDecimal(_price, 4) : "--"
      } ${pool?.token1?.symbol || "--"}`,
      explain:
        "Estimated price of the swap, not the final price that the swap is executed.",
    },
    {
      title: "Liquidity providers Fee",
      value: "--",
      explain: "Trade transaction fee collected by liquidity providers.",
    },
    {
      title: "Price Impact",
      value: `${_impact ? formateDecimal(_impact, 4) : "--"} %`,
      explain:
        "The estimated percentage that the ultimate executed price of the swap deviates from current price due to trading amount.",
    },
    {
      title: "Allowed Slippage",
      value: "0.50%",
      explain:
        "The ultimate price and output is determined by the amount of tokens in the pool at the time of your swap.",
    },
    {
      title: "Minimun Received",
      value: `${
        pairedCoin?.amount
          ? formateDecimal(SafeMath.mult(pairedCoin?.amount, 0.995), 8)
          : "--"
      } ${pool?.token1?.symbol || "--"}`,
      explain: "Trade transaction fee collected by liquidity providers.",
    },
  ];
};

const Swap = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isApprove, setIsApprove] = useState(false);
  const [displayApproveSelectedCoin, setDisplayApproveSelectedCoin] =
    useState(false);
  const location = useLocation();
  const history = useHistory();
  const [data, setData] = useState(getDummyCandleStickData());
  const [selectedPool, setSelectedPool] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [selectedCoinAmount, setSelectedCoinAmount] = useState("");
  const [pairedCoin, setPairedCoin] = useState(null);
  const [pairedCoinAmount, setPairedCoinAmount] = useState("");

  const approveHandler = async () => {
    const coinApproved = await connectorCtx.approve(selectedCoin.contract);
    if (coinApproved) {
      setIsApprove(coinApproved);
      setDisplayApproveSelectedCoin(!coinApproved);
    }
  };

  useEffect(() => {
    if (connectorCtx.isConnected && connectorCtx.connectedAccount)
      if (
        selectedCoin?.balanceOf &&
        SafeMath.gt(selectedCoinAmount, "0") &&
        SafeMath.gt(pairedCoinAmount, "0") &&
        SafeMath.gt(selectedCoin.balanceOf, selectedCoinAmount)
      ) {
        setIsLoading(true);
        connectorCtx
          .isAllowanceEnough(
            selectedCoin.contract,
            selectedCoinAmount,
            selectedCoin.decimals
          )
          .then((isSellCoinEnough) => {
            setDisplayApproveSelectedCoin(!isSellCoinEnough);
            setIsApprove(isSellCoinEnough);
            setIsLoading(false);
          });
      }

    return () => {
      console.log("CLEANUP");
    };
  }, [connectorCtx, selectedCoin, selectedCoinAmount, pairedCoinAmount]);

  const changeAmountHandler = async (value, type, pool, active, passive) => {
    let updateSelectedAmount, updatePairedAmount, _pool, _active, _passive;
    _pool = pool || selectedPool;
    _active = active || selectedCoin;
    _passive = passive || pairedCoin;
    setIsLoading(true);
    switch (type) {
      case "selected":
        updateSelectedAmount = _active
          ? amountUpdateHandler(value, _active.balanceOf)
          : value;
        updatePairedAmount =
          _pool && SafeMath.gt(updateSelectedAmount, "0")
            ? await connectorCtx.getAmountsOut(updateSelectedAmount, [
                _active,
                _passive,
              ])
            : "0";
        console.log(`updatePairedAmount`, updatePairedAmount);
        setPairedCoinAmount(updatePairedAmount);

        setSelectedCoinAmount(updateSelectedAmount);
        break;
      case "paired":
        updatePairedAmount = _passive
          ? amountUpdateHandler(value, _passive.balanceOf)
          : value;
        updateSelectedAmount =
          _pool && SafeMath.gt(updatePairedAmount, "0")
            ? await connectorCtx.getAmountsIn(updatePairedAmount, [
                _active,
                _passive,
              ])
            : "0";
        console.log(`updateSelectedAmount`, updateSelectedAmount);
        setSelectedCoinAmount(updateSelectedAmount);
        setPairedCoinAmount(updatePairedAmount);
        break;
      default:
        break;
    }
    setIsLoading(false);
  };

  const selectHandler = (pool) => {
    const active = connectorCtx.supportedTokens.find(
      (token) =>
        token.contract.toLocaleLowerCase() ===
        pool.token0.contract.toLocaleLowerCase()
    );
    const passive = connectorCtx.supportedTokens.find(
      (token) =>
        token.contract.toLocaleLowerCase() ===
        pool.token1.contract.toLocaleLowerCase()
    );
    setSelectedPool(pool);
    setSelectedCoin(active);
    setPairedCoin(passive);
    setData(getDummyCandleStickData(randomCandleStickData()));
    history.push({
      pathname: `/swap/${active.contract}/${passive.contract}`,
    });
    changeAmountHandler(selectedCoinAmount, "selected", pool, active, passive);
  };

  useEffect(() => {
    if (
      !location.pathname.includes("/swap/") ||
      !connectorCtx.supportedTokens > 0
    )
      return;
    const tokensContract = location.pathname.replace("/swap/", "").split("/");
    console.log(tokensContract);
    if (tokensContract.length > 0) {
      if (
        tokensContract[0]?.toLocaleLowerCase() !==
        selectedCoin?.contract?.toLocaleLowerCase()
      ) {
        setSelectedCoin(
          connectorCtx.supportedTokens.find(
            (token) =>
              token.contract.toLocaleLowerCase() ===
              tokensContract[0].toLocaleLowerCase()
          )
        );
        setData(getDummyCandleStickData(randomCandleStickData()));
      }
      if (
        !!tokensContract[1] &&
        tokensContract[1]?.toLocaleLowerCase() !==
          pairedCoin?.contract?.toLocaleLowerCase()
      ) {
        setPairedCoin(
          connectorCtx.supportedTokens.find(
            (token) =>
              token.contract.toLocaleLowerCase() ===
              tokensContract[1].toLocaleLowerCase()
          )
        );
      }
    }
    return () => {};
  }, [
    connectorCtx.supportedTokens,
    location.pathname,
    pairedCoin?.contract,
    selectedCoin?.contract,
  ]);

  const coinUpdateHandler = async (token, type) => {
    let update, _active, _passive;
    switch (type) {
      case "selected":
        update = coinPairUpdateHandler(
          token,
          pairedCoin,
          connectorCtx.supportedTokens
        );
        ({ active: _active, passive: _passive } = update);
        setData(getDummyCandleStickData(randomCandleStickData()));
        break;
      case "paired":
        if (!selectedCoin) {
          _active = connectorCtx.supportedTokens.find((t) =>
            token.contract.toLocaleLowerCase() ===
            connectorCtx.nativeCurrency.contract.toLocaleLowerCase()
              ? t.contract.toLocaleLowerCase() !==
                connectorCtx.nativeCurrency.contract.toLocaleLowerCase()
              : t.contract.toLocaleLowerCase() ===
                connectorCtx.nativeCurrency.contract.toLocaleLowerCase()
          );
          _passive = token;
        } else {
          update = coinPairUpdateHandler(
            selectedCoin,
            token,
            connectorCtx.supportedTokens
          );
          ({ active: _active, passive: _passive } = update);
        }
        break;
      default:
        break;
    }
    setSelectedCoin(_active);
    setPairedCoin(_passive);
    history.push({
      pathname: `/swap/${_active.contract}/${
        _passive?.contract ? _passive.contract : ""
      }`,
    });
    if (_active && _passive) {
      setIsLoading(true);
      const pool = await connectorCtx.getSelectedPool(
        connectorCtx.supportedPools,
        _active,
        _passive
      );
      setSelectedPool(pool);
      if (pool)
        history.push({
          pathname: `/swap/${_active.contract}/${_passive.contract}`,
        });
      switch (type) {
        case "selected":
          if (pool)
            changeAmountHandler(
              selectedCoinAmount,
              type,
              pool,
              _active,
              _passive
            );
          else setPairedCoinAmount("0");
          break;
        case "paired":
          if (pool)
            changeAmountHandler(
              pairedCoinAmount,
              type,
              pool,
              _active,
              _passive
            );
          else setSelectedCoin("0");
          break;
        default:
          break;
      }
      setIsLoading(false);
      console.log(`pool`, pool);
    } else {
      setSelectedPool(null);
      setIsLoading(false);
    }
  };

  const swapHandler = async (event) => {
    event.preventDefault();
    if (isApprove) {
      setIsApprove(false);
      try {
        const result = await connectorCtx.swap(
          selectedCoinAmount,
          pairedCoinAmount,
          [selectedCoin, pairedCoin]
        );
        console.log(`result`, result);
        history.push({ pathname: `/assets/` });
      } catch (error) {}
      setIsApprove(true);
    }
  };

  useEffect(() => {
    setPrice();
  }, []);

  return (
    <form className={classes.swap} onSubmit={swapHandler}>
      <div className={classes.header}>Swap</div>
      <div className={classes.container}>
        <div className={classes.main}>
          <SwapPannel
            data={data}
            price={price}
            selectedPool={selectedPool}
            selectedCoin={selectedCoin}
            selectedCoinAmount={selectedCoinAmount}
            pairedCoin={pairedCoin}
            pairedCoinAmount={pairedCoinAmount}
            coinUpdateHandler={coinUpdateHandler}
            amountUpdateHandler={changeAmountHandler}
            approveHandler={approveHandler}
            isApprove={isApprove}
            displayApproveSelectedCoin={displayApproveSelectedCoin}
            details={getDetails(
              selectedPool,
              {
                coin: selectedCoin,
                amount: selectedCoinAmount,
              },
              { coin: pairedCoin, amount: pairedCoinAmount }
            )}
            isLoading={isLoading}
          />
        </div>
        <div className={classes.sub}>
          <div className={classes.details}>
            <AssetDetail />
            <NetworkDetail />
          </div>
          <Pairs pools={connectorCtx.supportedPools} onSelect={selectHandler} />
          {/* <Pairs pools={dummyPools} /> */}
        </div>
      </div>
    </form>
  );
};

export default Swap;
