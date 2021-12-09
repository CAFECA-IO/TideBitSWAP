import React, { useState, useEffect, useContext, useCallback } from "react";
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
  const [slippage, setSlippage] = useState({
    value: "0.1",
    message: "",
  });
  const [deadline, setDeadline] = useState("30");
  // const [openExpertMode, setOpenExpertMode] = useState(false);

  const approveHandler = async () => {
    const coinApproved = await connectorCtx.approve(selectedCoin.contract);
    if (coinApproved) {
      setIsApprove(coinApproved);
      setDisplayApproveSelectedCoin(!coinApproved);
    }
  };

  const changeAmountHandler = useCallback(
    async ({ active, passive, activeAmount, passiveAmount, type, pool }) => {
      let updateSelectedAmount, updatePairedAmount, _pool, _active, _passive;
      _active = active || selectedCoin;
      _passive = passive || pairedCoin;
      if (!pool && _active && _passive) {
        setIsLoading(true);
        _pool = await connectorCtx.searchPool({
          token0Contract: _active.contract,
          token1Contract: _passive.contract,
        });
        setSelectedPool(_pool);
      } else _pool = pool;
      switch (type) {
        case "selected":
          updateSelectedAmount = _active
            ? amountUpdateHandler(activeAmount, _active.balanceOf)
            : activeAmount;
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
            ? amountUpdateHandler(passiveAmount, _passive.balanceOf)
            : passiveAmount;
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
    },
    [connectorCtx, pairedCoin, selectedCoin]
  );

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
    changeAmountHandler({
      activeAmount: selectedCoinAmount,
      type: "selected",
      pool,
      active,
      passive,
    });
  };

  const tokenExchangerHander = async () => {
    const active = pairedCoin;
    const passive = selectedCoin;
    setSelectedCoin(active);
    setPairedCoin(passive);
    history.push({
      pathname: `/swap/${active.contract}/${passive.contract}`,
    });
    const data = await connectorCtx.getPriceData(active.contract);
    setData(data);
    changeAmountHandler({
      activeAmount: selectedCoinAmount,
      type: "selected",
      pool: selectedPool,
      active,
      passive,
    });
  };
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
    changeAmountHandler({
      activeAmount: selectedCoinAmount,
      passiveAmount: pairedCoinAmount,
      type,
      active: _active,
      passive: _passive,
    });
    const data = await connectorCtx.getPriceData(_active.contract);
    setData(data);
  };

  const setupCoins = useCallback(
    async (tokensContract) => {
      if (tokensContract.length > 0) {
        let active, passive;
        if (
          tokensContract[0]?.toLowerCase() !==
          selectedCoin?.contract?.toLowerCase()
        ) {
          setIsLoading(true);
          active = await connectorCtx.searchToken(tokensContract[0]);
          setSelectedCoin(active);
          const data = await connectorCtx.getPriceData(tokensContract[0]);
          setData(data);
          setIsLoading(false);
        }
        if (
          !!tokensContract[1] &&
          tokensContract[1]?.toLowerCase() !==
            pairedCoin?.contract?.toLowerCase()
        ) {
          setIsLoading(true);
          passive = await connectorCtx.searchToken(tokensContract[1]);
          setPairedCoin(passive);
          setIsLoading(false);
        }
        changeAmountHandler({
          activeAmount: selectedCoinAmount,
          passiveAmount: pairedCoinAmount,
          type: "selected",
          pool: selectedPool,
          active,
          passive,
        });
      }
    },
    [
      changeAmountHandler,
      connectorCtx,
      pairedCoin?.contract,
      pairedCoinAmount,
      selectedCoin?.contract,
      selectedCoinAmount,
      selectedPool,
    ]
  );

  useEffect(() => {
    if (
      !location.pathname.includes("/swap/") ||
      !connectorCtx.supportedTokens > 0
    )
      return;
    const tokensContract = location.pathname.replace("/swap/", "").split("/");
    setupCoins(tokensContract);
    return () => {};
  }, [connectorCtx.supportedTokens, location.pathname, setupCoins]);

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

  const swapHandler = async (event) => {
    event.preventDefault();
    if (isApprove) {
      setIsApprove(false);
      try {
        const result = !SafeMath.gt(selectedCoin.contract, 0)
          ? await connectorCtx.swapExactETHForTokens(
              selectedCoinAmount,
              pairedCoinAmount,
              [pairedCoin],
              slippage,
              deadline
            )
          : !SafeMath.gt(pairedCoin.contract, 0)
          ? await connectorCtx.swapExactTokensForETH(
              selectedCoinAmount,
              pairedCoinAmount,
              [selectedCoin],
              slippage,
              deadline
            )
          : await connectorCtx.swap(
              selectedCoinAmount,
              pairedCoinAmount,
              [selectedCoin, pairedCoin],
              slippage,
              deadline
            );
        console.log(`result`, result);
        history.push({ pathname: `/assets/` });
      } catch (error) {}
      setIsApprove(true);
    }
  };

  const slippageChangeHander = (e) => {
    let value = e.target.value;
    if (!/^(([1-9]\d*)|([0]{1}))(\.\d+)?$/.test(value))
      value = value.substring(0, value.length - 1);
    if (!SafeMath.gt(value, "0")) value = "0";
    setSlippage({
      value,
      message: `${
        SafeMath.gt(e.target.value, 1) ? "Your transaction may be frontrun" : ""
      }`,
    });
  };
  const slippageAutoHander = () => {
    setSlippage({
      value: "0.1",
      message: "",
    });
  };
  const deadlineChangeHander = (e) => {
    let value = e.target.value;
    if (!/^(([1-9]\d*)|([0]{1}))(\.\d+)?$/.test(value))
      value = value.substring(0, value.length - 1);
    if (!SafeMath.gt(value, "0")) value = "0";
    setDeadline(value);
  };
  // const expertModeChangeHandler = () => {};

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
            changeAmountHandler={changeAmountHandler}
            tokenExchangerHander={tokenExchangerHander}
            slippage={slippage}
            slippageChangeHander={slippageChangeHander}
            slippageAutoHander={slippageAutoHander}
            deadline={deadline}
            deadlineChangeHander={deadlineChangeHander}
            // openExpertMode={openExpertMode}
            // expertModeChangeHandler={expertModeChangeHandler}
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
