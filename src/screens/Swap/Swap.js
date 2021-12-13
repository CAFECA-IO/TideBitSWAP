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
import Chart from "react-apexcharts";
import SafeMath from "../../Utils/safe-math";

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
  const [allowanceAmount, setAllowanceAmount] = useState("0");
  const [selectedCoinAmount, setSelectedCoinAmount] = useState("");
  const [pairedCoin, setPairedCoin] = useState(null);
  const [pairedCoinAmount, setPairedCoinAmount] = useState("");

  const [slippage, setSlippage] = useState({
    value: "0.1",
    message: "",
  });
  const [deadline, setDeadline] = useState("30");
  const [poolInsufficient, setPoolInsufficient] = useState(false);
  const [details, setDetails] = useState([]);
  // const [openExpertMode, setOpenExpertMode] = useState(false);

  const getDetails = useCallback(
    async (pool, active, passive, slippage) => {
      console.log(
        `getDetails !!details.length`,
        !!details.length,
        !!details.length && (!pool || !active || !passive)
      );
      if (!!details.length && (!pool || !active || !passive)) return;

      let _price, _updatePrice, _impact, _amountOut;
      if (pool && active && passive) {
        _price =
          pool.token0.contract.toLowerCase() ===
            active.contract.toLowerCase() &&
          pool.token1.contract.toLowerCase() === passive.contract.toLowerCase()
            ? await connectorCtx.getAmountOut(
                "1",
                [pool.token0, pool.token1],
                pool.poolBalanceOfToken0,
                pool.poolBalanceOfToken1
              )
            : pool.token1.contract.toLowerCase() ===
                active.contract.toLowerCase() &&
              pool.token0.contract.toLowerCase() ===
                passive.contract.toLowerCase()
            ? await connectorCtx.getAmountOut(
                "1",
                [pool.token1, pool.token0],
                pool.poolBalanceOfToken1,
                pool.poolBalanceOfToken0
              )
            : null;

        if (passive?.amount && active?.amount) {
          _amountOut =
            pool.token0.contract.toLowerCase() ===
              active.contract.toLowerCase() &&
            pool.token1.contract.toLowerCase() ===
              passive.contract.toLowerCase()
              ? await connectorCtx.getAmountOut(
                  active.amount,
                  [pool.token0, pool.token1],
                  pool.poolBalanceOfToken0,
                  pool.poolBalanceOfToken1
                )
              : pool.token1.contract.toLowerCase() ===
                  active.contract.toLowerCase() &&
                pool.token0.contract.toLowerCase() ===
                  passive.contract.toLowerCase()
              ? await connectorCtx.getAmountOut(
                  active.amount,
                  [pool.token1, pool.token0],
                  pool.poolBalanceOfToken1,
                  pool.poolBalanceOfToken0
                )
              : null;
          _updatePrice =
            pool.token0.contract.toLowerCase() ===
              active.contract.toLowerCase() &&
            pool.token1.contract.toLowerCase() ===
              passive.contract.toLowerCase()
              ? await connectorCtx.getAmountOut(
                  "1",
                  [pool.token0, pool.token1],
                  SafeMath.plus(pool.poolBalanceOfToken0, active.amount),
                  SafeMath.minus(pool.poolBalanceOfToken1, _amountOut)
                )
              : pool.token1.contract.toLowerCase() ===
                  active.contract.toLowerCase() &&
                pool.token0.contract.toLowerCase() ===
                  passive.contract.toLowerCase()
              ? await connectorCtx.getAmountOut(
                  "1",
                  [pool.token1, pool.token0],
                  SafeMath.plus(pool.poolBalanceOfToken1, active.amount),
                  SafeMath.minus(pool.poolBalanceOfToken0, _amountOut)
                )
              : null;

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
          value: `1 ${active?.symbol || "--"} ≈ ${
            _price ? formateDecimal(_price, 16) : "--"
          } ${passive?.symbol || "--"}`,
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
          value: slippage?.value ? slippage?.value : "0.50%",
          explain:
            "The ultimate price and output is determined by the amount of tokens in the pool at the time of your swap.",
        },
        {
          title: "Minimun Received",
          value: `${
            passive?.amount
              ? formateDecimal(
                  SafeMath.mult(
                    passive?.amount,
                    SafeMath.minus(
                      "1",
                      SafeMath.div(slippage?.value || "0.5", "100")
                    )
                  ),
                  18
                )
              : "--"
          } ${passive?.symbol || "--"}`,
          explain: "Trade transaction fee collected by liquidity providers.",
        },
      ];
    },
    [connectorCtx, details.length]
  );

  const approveHandler = async () => {
    const coinApproved = await connectorCtx.approve(selectedCoin.contract);
    if (coinApproved) {
      setIsApprove(coinApproved);
      setDisplayApproveSelectedCoin(!coinApproved);
    }
  };

  const changeAmountHandler = useCallback(
    async ({ active, passive, activeAmount, passiveAmount, type, pool }) => {
      console.log(`activeAmount`, activeAmount);
      console.log(`passiveAmount`, passiveAmount);

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
      if (!_pool) return;
      switch (type) {
        case "selected":
          updateSelectedAmount = _active
            ? amountUpdateHandler(activeAmount, _active.balanceOf)
            : activeAmount;
          console.log(`updateSelectedAmount`, updateSelectedAmount);
          setSelectedCoinAmount(updateSelectedAmount);
          try {
            updatePairedAmount =
              _pool && SafeMath.gt(updateSelectedAmount, "0")
                ? await connectorCtx.getAmountsOut(updateSelectedAmount, [
                    _active,
                    _passive,
                  ])
                : "0";
            setPoolInsufficient(false);
          } catch (error) {
            updatePairedAmount = "0";
            setPoolInsufficient(true);
          }
          console.log(`updatePairedAmount`, updatePairedAmount);
          setPairedCoinAmount(updatePairedAmount);

          break;
        case "paired":
          updatePairedAmount = _passive
            ? amountUpdateHandler(passiveAmount, _passive.balanceOf)
            : passiveAmount;
          setPairedCoinAmount(updatePairedAmount);
          console.log(`updatePairedAmount`, updatePairedAmount);

          try {
            updateSelectedAmount =
              _pool && SafeMath.gt(updatePairedAmount, "0")
                ? await connectorCtx.getAmountsIn(updatePairedAmount, [
                    _active,
                    _passive,
                  ])
                : "0";
            setPoolInsufficient(false);
          } catch (error) {
            updateSelectedAmount = "0";
            setPoolInsufficient(true);
          }
          console.log(`updateSelectedAmount`, updateSelectedAmount);
          setSelectedCoinAmount(updateSelectedAmount);
          break;
        default:
          break;
      }
      const details = await getDetails(
        _pool,
        {
          ..._active,
          amount: updateSelectedAmount,
        },
        { ..._passive, amount: updatePairedAmount },
        slippage
      );
      console.log(`getDetails details`, details);
      setDetails(details);
      setIsLoading(false);
    },
    [connectorCtx, getDetails, pairedCoin, selectedCoin, slippage]
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
    const activeAmount = pairedCoinAmount;
    const passiveAmount = selectedCoinAmount;
    setSelectedCoin(active);
    setSelectedCoinAmount(activeAmount);
    setPairedCoin(passive);
    setPairedCoinAmount(passiveAmount);
    history.push({
      pathname: `/swap/${active.contract}/${passive.contract}`,
    });
    const data = await connectorCtx.getPriceData(active.contract);
    setData(data);
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
        // changeAmountHandler({
        //   activeAmount: selectedCoinAmount,
        //   passiveAmount: pairedCoinAmount,
        //   type: "selected",
        //   pool: selectedPool,
        //   active,
        //   passive,
        // });
      }
    },
    [connectorCtx, pairedCoin?.contract, selectedCoin?.contract]
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
        SafeMath.gt(selectedCoin.balanceOf, selectedCoinAmount) &&
        SafeMath.gt(selectedCoinAmount, allowanceAmount)
      ) {
        setIsLoading(true);
        id = setTimeout(
          connectorCtx
            .isAllowanceEnough(
              selectedCoin.contract,
              selectedCoinAmount,
              selectedCoin.decimals
            )
            .then((result) => {
              setAllowanceAmount(result?.allowanceAmount);
              setDisplayApproveSelectedCoin(!result?.isEnough);
              setIsApprove(result?.isEnough);
              setIsLoading(false);
            })
        );
      }
    }

    return () => {
      // console.log("CLEANUP");
    };
  }, [
    connectorCtx,
    selectedCoin,
    selectedCoinAmount,
    pairedCoinAmount,
    allowanceAmount,
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
              slippage?.value,
              deadline
            )
          : !SafeMath.gt(pairedCoin.contract, 0)
          ? await connectorCtx.swapExactTokensForETH(
              selectedCoinAmount,
              pairedCoinAmount,
              [selectedCoin],
              slippage?.value,
              deadline
            )
          : await connectorCtx.swap(
              selectedCoinAmount,
              pairedCoinAmount,
              [selectedCoin, pairedCoin],
              slippage?.value,
              deadline
            );
        console.log(`result`, result);
        history.push({ pathname: `/assets/` });
      } catch (error) {}
      setIsApprove(true);
    }
  };

  const slippageChangeHander = async (event) => {
    let value = +event.target.value < 0 ? "0" : event.target.value;

    setSlippage({
      value,
      message: `${
        SafeMath.gt(value, 1) ? "Your transaction may be frontrun" : ""
      }`,
    });
    const details = await getDetails(
      selectedPool,
      {
        ...selectedCoin,
        amount: selectedCoinAmount,
      },
      { ...pairedCoin, amount: pairedCoinAmount },
      value
    );
    setDetails(details);
  };

  const slippageAutoHander = () => {
    setSlippage({
      value: "0.1",
      message: "",
    });
  };
  const deadlineChangeHander = (event) => {
    let value = +event.target.value < 0 ? "0" : event.target.value;

    setDeadline(value);
  };
  // const expertModeChangeHandler = () => {};

  return (
    <form className={classes.swap} onSubmit={swapHandler}>
      <div className={classes.header}>Swap</div>
      <div className={classes.container}>
        <div className={classes.main}>
          <SwapPannel
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
            poolInsufficient={poolInsufficient}
          />
        </div>
        <div className={classes.sub}>
          <div className={classes.details}>
            <AssetDetail />
            <NetworkDetail />
          </div>
          {selectedCoin?.contract && (
            <Chart
              options={{
                chart: {
                  type: "candlestick",
                  height: 350,
                  toolbar: {
                    show: false,
                  },
                },
                xaxis: {
                  type: "datetime",
                },
                yaxis: {
                  tooltip: {
                    enabled: true,
                  },
                },
              }}
              series={[
                {
                  data: data,
                },
              ]}
              type="candlestick"
              height={350}
            />
          )}
          <Pairs onSelect={selectHandler} />
        </div>
      </div>
    </form>
  );
};

export default Swap;
