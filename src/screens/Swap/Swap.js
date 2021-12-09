import React, { useState, useEffect, useContext } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import {
  formateDecimal,
  coinPairUpdateHandler,
  amountUpdateHandler,
} from "../../Utils/utils";
import Pairs from "./Pairs";
import classes from "./Swap.module.css";
import SwapPannel from "./SwapPannel";
import { useHistory, useLocation } from "react-router";

import SafeMath from "../../Utils/safe-math";

const calculateSwapOut = (pool, amountIn, fee = 0.0) => {
  const a = SafeMath.div(amountIn, pool.poolBalanceOfToken0);
  const r = 1 - fee;
  const tokenBAmount = SafeMath.mult(
    SafeMath.div(SafeMath.mult(a, r), SafeMath.plus(1, SafeMath.mult(a, r))),
    pool.poolBalanceOfToken1
  );
  return tokenBAmount;
};

export const getDetails = (pool, selectedCoin, pairedCoin, fee = 0.0) => {
  let _price, _updatePrice, _impact, _amountOut;
  if (pool) {
    _price =
      pool.token0.contract.toLowerCase() === selectedCoin.contract.toLowerCase()
        ? calculateSwapOut(pool, "1")
        : calculateSwapOut(
            {
              ...pool,
              poolBalanceOfToken0: pool.poolBalanceOfToken1,
              poolBalanceOfToken1: pool.poolBalanceOfToken0,
            },
            "1"
          );

    console.log(`_price`, _price);

    if (pairedCoin?.amount && selectedCoin?.amount) {
      if (
        pool.token0.contract.toLowerCase() ===
        selectedCoin.contract.toLowerCase()
      ) {
        _amountOut = calculateSwapOut(pool, selectedCoin.amount);
        _updatePrice = calculateSwapOut(
          {
            ...pool,
            poolBalanceOfToken0: SafeMath.plus(
              pool.poolBalanceOfToken0,
              selectedCoin.amount
            ),
            poolBalanceOfToken1: SafeMath.minus(
              pool.poolBalanceOfToken1,
              _amountOut
            ),
          },
          "1"
        );
      } else {
        const _pool = {
          ...pool,
          poolBalanceOfToken0: pool.poolBalanceOfToken1,
          poolBalanceOfToken1: pool.poolBalanceOfToken0,
        };
        _amountOut = calculateSwapOut(_pool, selectedCoin.amount);
        _updatePrice = calculateSwapOut(
          {
            ..._pool,
            poolBalanceOfToken0: SafeMath.plus(
              _pool.poolBalanceOfToken0,
              selectedCoin.amount
            ),
            poolBalanceOfToken1: SafeMath.minus(
              _pool.poolBalanceOfToken1,
              _amountOut
            ),
          },
          "1"
        );
      }

      _impact = SafeMath.mult(
        // SafeMath.minus(
        SafeMath.div(SafeMath.minus(_updatePrice, _price), _price),
        //   "1"
        // ),
        "100"
      );
    }
  }

  return [
    {
      title: "Price",
      value: `1 ${selectedCoin?.symbol || "--"} ≈ ${
        _price ? formateDecimal(_price, 12) : "--"
      } ${pairedCoin?.symbol || "--"}`,
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
      value: `${_impact ? formateDecimal(_impact, 6) : "--"} %`,
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
      } ${pairedCoin?.symbol || "--"}`,
      explain: "Trade transaction fee collected by liquidity providers.",
    },
  ];
};

const Swap = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isApprove, setIsApprove] = useState(false);
  const [displayApproveSelectedCoin, setDisplayApproveSelectedCoin] =
    useState(false);
  const location = useLocation();
  const history = useHistory();
  const [data, setData] = useState([]);
  const [selectedPool, setSelectedPool] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [selectedCoinAmount, setSelectedCoinAmount] = useState("");
  const [pairedCoin, setPairedCoin] = useState(null);
  const [pairedCoinAmount, setPairedCoinAmount] = useState("");
  const [details, setDetails] = useState(getDetails());

  const approveHandler = async () => {
    const coinApproved = await connectorCtx.approve(selectedCoin.contract);
    if (coinApproved) {
      setIsApprove(coinApproved);
      setDisplayApproveSelectedCoin(!coinApproved);
    }
  };

  useEffect(() => {
    let id;
    if (id) clearTimeout(id);
    if (connectorCtx.isConnected && connectorCtx.connectedAccount) {
      if (
        !SafeMath.gt(selectedCoin?.contract, "0") &&
        SafeMath.gt(selectedCoinAmount, "0") &&
        SafeMath.gt(pairedCoinAmount, "0")
      ) {
        setDisplayApproveSelectedCoin(false);
        setIsApprove(true);
        setIsLoading(false);
      } else if (
        selectedCoin?.balanceOf &&
        SafeMath.gt(selectedCoinAmount, "0") &&
        SafeMath.gt(pairedCoinAmount, "0") &&
        SafeMath.gt(selectedCoin.balanceOf, selectedCoinAmount)
      ) {
        setIsLoading(true);
        id = setTimeout(
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
            })
        );
      }
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
        setSelectedCoinAmount(updateSelectedAmount);
        updatePairedAmount =
          _pool && SafeMath.gt(updateSelectedAmount, "0")
            ? await connectorCtx.getAmountsOut(updateSelectedAmount, [
                _active,
                _passive,
              ])
            : "0";
        console.log(`updatePairedAmount`, updatePairedAmount);
        setPairedCoinAmount(updatePairedAmount);

        break;
      case "paired":
        updatePairedAmount = _passive
          ? amountUpdateHandler(value, _passive.balanceOf)
          : value;
        setPairedCoinAmount(updatePairedAmount);
        updateSelectedAmount =
          _pool && SafeMath.gt(updatePairedAmount, "0")
            ? await connectorCtx.getAmountsIn(updatePairedAmount, [
                _active,
                _passive,
              ])
            : "0";
        console.log(`updateSelectedAmount`, updateSelectedAmount);
        setSelectedCoinAmount(updateSelectedAmount);

        break;
      default:
        break;
    }

    setIsLoading(false);
  };

  const selectHandler = async (pool) => {
    const active = connectorCtx.supportedTokens.find(
      (token) =>
        token.contract.toLowerCase() === pool.token0.contract.toLowerCase()
    );
    const passive = connectorCtx.supportedTokens.find(
      (token) =>
        token.contract.toLowerCase() === pool.token1.contract.toLowerCase()
    );
    setSelectedPool(pool);
    setSelectedCoin(active);
    setPairedCoin(passive);
    const data = await connectorCtx.getPriceData(active.contract);
    setData(data);
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
    if (tokensContract.length > 0) {
      if (
        tokensContract[0]?.toLowerCase() !==
        selectedCoin?.contract?.toLowerCase()
      ) {
        setSelectedCoin(
          connectorCtx.supportedTokens.find(
            (token) =>
              token.contract.toLowerCase() === tokensContract[0].toLowerCase()
          )
        );
        connectorCtx
          .getPriceData(tokensContract[0])
          .then((data) => setData(data));
        setData(data);
      }
      if (
        !!tokensContract[1] &&
        tokensContract[1]?.toLowerCase() !== pairedCoin?.contract?.toLowerCase()
      ) {
        setPairedCoin(
          connectorCtx.supportedTokens.find(
            (token) =>
              token.contract.toLowerCase() === tokensContract[1].toLowerCase()
          )
        );
      }
    }
    return () => {};
  }, [
    connectorCtx,
    connectorCtx.supportedTokens,
    data,
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
        const data = await connectorCtx.getPriceData(_active.contract);
        setData(data);
        break;
      case "paired":
        if (!selectedCoin) {
          _active = connectorCtx.supportedTokens.find((t) =>
            token.contract.toLowerCase() ===
            connectorCtx.nativeCurrency.contract.toLowerCase()
              ? t.contract.toLowerCase() !==
                connectorCtx.nativeCurrency.contract.toLowerCase()
              : t.contract.toLowerCase() ===
                connectorCtx.nativeCurrency.contract.toLowerCase()
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
      const pool = await connectorCtx.searchPool({
        token0Contract: _active.contract,
        token1Contract: _passive.contract,
      });
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
        const result = !SafeMath.gt(selectedCoin.contract, 0)
          ? await connectorCtx.swapExactETHForTokens(
              selectedCoinAmount,
              pairedCoinAmount,
              [pairedCoin]
            )
          : !SafeMath.gt(pairedCoin.contract, 0)
          ? await connectorCtx.swapExactTokensForETH(
              selectedCoinAmount,
              pairedCoinAmount,
              [selectedCoin]
            )
          : await connectorCtx.swap(selectedCoinAmount, pairedCoinAmount, [
              selectedCoin,
              pairedCoin,
            ]);
        console.log(`result`, result);
        history.push({ pathname: `/assets/` });
      } catch (error) {}
      setIsApprove(true);
    }
  };

  useEffect(() => {
    if (
      selectedPool &&
      selectedCoin &&
      pairedCoin &&
      +selectedCoinAmount > 0 &&
      +pairedCoinAmount > 0
    ) {
      setDetails(
        getDetails(
          selectedPool,
          {
            ...selectedCoin,
            amount: selectedCoinAmount,
          },
          { ...pairedCoin, amount: pairedCoinAmount }
        )
      );
    }
  }, [
    pairedCoin,
    pairedCoinAmount,
    selectedCoin,
    selectedCoinAmount,
    selectedPool,
  ]);

  return (
    <form className={classes.swap} onSubmit={swapHandler}>
      <div className={classes.header}>Swap</div>
      <div className={classes.container}>
        <div className={classes.main}>
          <SwapPannel
            data={data}
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
            details={details}
            isLoading={isLoading}
          />
        </div>
        <div className={classes.sub}>
          <div className={classes.details}>
            <AssetDetail />
            <NetworkDetail />
          </div>
          <Pairs onSelect={selectHandler} />
        </div>
      </div>
    </form>
  );
};

export default Swap;
