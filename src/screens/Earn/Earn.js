import React, { useContext, useState, useEffect, useCallback } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import SafeMath from "../../Utils/safe-math";
import classes from "./Earn.module.css";
import EarnPannel from "./EarnPannel";
import { useHistory, useLocation } from "react-router";
import { coinPairUpdateHandler, formateDecimal } from "../../Utils/utils";
import Histories from "../../components/UI/Histories";
import { connect } from "rxjs";

const Earn = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [slippage, setSlippage] = useState({
    value: "0.5",
    message: "",
  });
  const [histories, setHistories] = useState([]);
  const [deadline, setDeadline] = useState("30");
  const [selectedPool, setSelectedPool] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [selectedCoinAmount, setSelectedCoinAmount] = useState("");
  const [selectedCoinAllowance, setSelectedCoinAllowance] = useState("0");
  const [pairedCoin, setPairedCoin] = useState(null);
  const [pairedCoinAmount, setPairedCoinAmount] = useState("");
  const [pairedCoinAllowance, setPairedCoinAllowance] = useState("0");
  const history = useHistory();
  const location = useLocation();
  const [displayApproveSelectedCoin, setDisplayApproveSelectedCoin] =
    useState(false);
  const [selectedCoinIsApprove, setSelectedCoinIsApprove] = useState(false);

  const [displayApprovePairedCoin, setDisplayApprovePairedCoin] =
    useState(false);
  const [pairedCoinIsApprove, setPairedCoinIsApprove] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detail, setDetail] = useState([]);
  const [summary, setSummary] = useState([]);
  const [timer, setTimer] = useState(null);

  const dataUpdateHandler = useCallback(
    async ({ pool, selectedCoin, pairedCoin, slippage }) => {
      console.log(`dataUpdateHandler selectedCoin`, selectedCoin);
      console.log(`dataUpdateHandler pairedCoin`, pairedCoin);
      setDetail(
        pool
          ? [
              {
                title: `${pool?.token0?.symbol || "--"} per ${
                  pool?.token1?.symbol || "--"
                }`,
                value: `${formateDecimal(
                  SafeMath.div(
                    pool?.poolBalanceOfToken1,
                    pool?.poolBalanceOfToken0
                  ),
                  8
                )}`,
              },
              {
                title: `${pool?.token1?.symbol || "--"} per ${
                  pool?.token0?.symbol || "--"
                }`,
                value: `${formateDecimal(
                  SafeMath.div(
                    pool?.poolBalanceOfToken0,
                    pool?.poolBalanceOfToken1
                  ),
                  8
                )}`,
              },
              {
                title: `${
                  pool?.share
                    ? formateDecimal(SafeMath.mult(pool?.share, 100), 4)
                    : "0"
                } %`,
                value: "Your pool share",
                explain:
                  "The estimated percentage that the ultimate executed price of the swap deviates from current price due to trading amount.",
              },
            ]
          : []
      );
      setSummary(
        !pool
          ? [
              {
                title: "Initial prices",
                value: `1 ${selectedCoin?.symbol || "--"} ≈ ${
                  !!selectedCoin?.amount && !!pairedCoin?.amount
                    ? SafeMath.div(selectedCoin?.amount, pairedCoin?.amount)
                    : "--"
                } ${pairedCoin?.symbol || "--"}`,
                explain:
                  "Estimated price of the swap, not the final price that the swap is executed.",
              },
              {
                title: "Initial prices",
                value: `1 ${pairedCoin?.symbol || "--"} ≈ ${
                  !!selectedCoin?.amount && !!pairedCoin?.amount
                    ? SafeMath.div(pairedCoin?.amount, selectedCoin?.amount)
                    : "--"
                } ${selectedCoin?.symbol || "--"}`,
                explain:
                  "Estimated price of the swap, not the final price that the swap is executed.",
              },
              {
                title: "Share of the pool",
                value: `${
                  !!selectedCoin?.amount && !!pairedCoin?.amount ? "100" : "0"
                } %`,
                explain:
                  "The estimated percentage that the ultimate executed price of the swap deviates from current price due to trading amount.",
              },
              {
                title: "Total yield",
                value: "--",
                explain:
                  "Trade transaction fee collected by liquidity providers.",
              },
            ]
          : [
              {
                title: pool?.token0?.symbol,
                value: SafeMath.plus(
                  pool?.poolBalanceOfToken0,
                  !pool.reverse
                    ? selectedCoin?.amount || "0"
                    : pairedCoin?.amount || "0"
                ),
              },
              {
                title: pool?.token1?.symbol,
                value: SafeMath.plus(
                  pool?.poolBalanceOfToken1,
                  !pool.reverse
                    ? pairedCoin?.amount || "0"
                    : selectedCoin?.amount || "0"
                ),
              },
              {
                title: "Share of the pool",
                value: `${
                  selectedCoin?.amount
                    ? formateDecimal(
                        SafeMath.mult(
                          SafeMath.div(
                            selectedCoin?.amount,
                            SafeMath.plus(
                              pool?.poolBalanceOfToken0,
                              selectedCoin?.contract === pool?.token0.contract
                                ? selectedCoin?.amount || "0"
                                : pairedCoin?.amount || "0"
                            )
                          ),
                          100
                        ),
                        4
                      )
                    : "0"
                } %`,
                explain:
                  "The estimated percentage that the ultimate executed price of the swap deviates from current price due to trading amount.",
              },

              {
                title: "Total yield",
                value: "--",
                explain:
                  "Trade transaction fee collected by liquidity providers.",
              },
            ]
      );
      if (pool) {
        const histories = await connectorCtx.getPoolHistory(pool.poolContract);
        setHistories(histories);
      }
    },
    [connectorCtx]
  );

  const approveHandler = async (contract, type) => {
    const coinApproved = await connectorCtx.approve(contract);
    switch (type) {
      case "selected":
        setSelectedCoinIsApprove(coinApproved);
        setDisplayApproveSelectedCoin(!coinApproved);
        break;
      case "paired":
        setPairedCoinIsApprove(coinApproved);
        setDisplayApprovePairedCoin(!coinApproved);
        break;
      default:
        break;
    }
  };

  const changeAmountHandler = useCallback(
    async ({ activeAmount, passiveAmount, type, active, passive, pool }) => {
      let _active, _passive, result;
      _active = active || selectedCoin;
      _passive = passive || pairedCoin;
      switch (type) {
        case "selected":
          setSelectedCoinAmount(activeAmount);
          console.log(`formateAddLiquidity updateSelectedAmount`, activeAmount);
          result = connectorCtx.formateAddLiquidity({
            pool,
            tokenA: _active,
            tokenB: _passive,
            amountADesired: activeAmount,
            amountBDesired: pairedCoinAmount,
            type,
          });
          console.log(`formateAddLiquidity result`, result);

          setPairedCoinAmount(result.amountBDesired);

          break;
        case "paired":
          console.log(`formateAddLiquidity type`, type);
          console.log(`formateAddLiquidity passiveAmount`, passiveAmount);
          console.log(
            `formateAddLiquidity _passive.balanceOf`,
            _passive.balanceOf
          );
          setPairedCoinAmount(passiveAmount);
          result = connectorCtx.formateAddLiquidity({
            pool,
            tokenA: _active,
            tokenB: _passive,
            amountADesired: selectedCoinAmount,
            amountBDesired: passiveAmount,
            type,
          });
          console.log(`formateAddLiquidity result`, result);
          setSelectedCoinAmount(result.amountADesired);
          break;
        default:
          break;
      }
      await dataUpdateHandler({
        pool,
        selectedCoin: { ..._active, amount: result.amountADesired },
        pairedCoin: { ..._passive, amount: result.amountBDesired },
        slippage,
      });
    },
    [
      connectorCtx,
      dataUpdateHandler,
      pairedCoin,
      pairedCoinAmount,
      selectedCoin,
      selectedCoinAmount,
      slippage,
    ]
  );

  const coinUpdateHandler = useCallback(
    async ({ active, passive, type }) => {
      let update, _active, _passive;
      _active = active || selectedCoin;
      _passive = passive || pairedCoin;
      setSelectedPool(null);
      setDetail([]);
      setSummary([]);
      setHistories([]);
      switch (type) {
        case "selected":
          update = coinPairUpdateHandler(
            active,
            pairedCoin,
            connectorCtx.supportedTokens
          );
          ({ active: _active, passive: _passive } = update);
          break;
        case "paired":
          if (!_active) {
            _active = connectorCtx.supportedTokens.find((t) =>
              SafeMath.gt(passive.contrac, 0)
                ? SafeMath.gt(t.contract, 0)
                : !SafeMath.gt(t.contract, 0) &&
                  t.contract !== connectorCtx.nativeCurrency?.contract
            );
            _passive = passive;
          } else {
            update = coinPairUpdateHandler(
              passive,
              _active,
              connectorCtx.supportedTokens
            );
            ({ active: _passive, passive: _active } = update);
          }
          break;
        default:
          break;
      }
      setSelectedCoin(_active);
      setPairedCoin(_passive);
      let pool;
      if (_active && _passive) {
        setIsLoading(true);
        pool = await connectorCtx.searchPoolByTokens({
          token0: _active,
          token1: _passive,
        });
        console.log(`%%% coinUpdateHandler pool`, pool);
        setSelectedPool(pool);
      }
      await dataUpdateHandler({
        pool,
        selectedCoin: { ..._active, amount: selectedCoinAmount },
        pairedCoin: { ..._passive, amount: pairedCoinAmount },
        slippage,
      });
      await changeAmountHandler({
        pool,
        activeAmount: selectedCoinAmount,
        passiveAmount: pairedCoinAmount,
        type,
        active: _active,
        passive: _passive,
      });
      setIsLoading(false);
    },
    [
      changeAmountHandler,
      connectorCtx,
      dataUpdateHandler,
      pairedCoin,
      pairedCoinAmount,
      selectedCoin,
      selectedCoinAmount,
      slippage,
    ]
  );

  const slippageAutoHander = async () => {
    setSlippage({
      value: "0.5",
      message: "",
    });
    await dataUpdateHandler({
      pool: selectedPool,
      selectedCoin: { ...selectedCoin, amount: selectedCoinAmount },
      pairedCoin: { ...pairedCoin, amount: pairedCoinAmount },
      slippage: {
        value: "0.5",
        message: "",
      },
    });
  };

  const slippageChangeHander = async (event) => {
    let value = +event.target.value < 0 ? "0" : event.target.value;

    setSlippage({
      value,
      message: `${
        SafeMath.gt(value, 1) ? "Your transaction may be frontrun" : ""
      }`,
    });

    await dataUpdateHandler({
      pool: selectedPool,
      selectedCoin: { ...selectedCoin, amount: selectedCoinAmount },
      pairedCoin: { ...pairedCoin, amount: pairedCoinAmount },
      slippage: {
        value,
        message: "",
      },
    });
  };

  const deadlineChangeHander = (event) => {
    let value = +event.target.value < 0 ? "0" : event.target.value;

    setDeadline(value);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    console.log(
      `submitHandler`,
      `selectedCoin`,
      selectedCoin,
      `pairedCoin`,
      pairedCoin
    );
    console.log(`submitHandler selectedCoinAmount`, selectedCoinAmount);
    console.log(`submitHandler pairedCoinAmount`, pairedCoinAmount);
    if (selectedCoinIsApprove) {
      setSelectedCoinIsApprove(false);
      let provideLiquidityResut;

      try {
        provideLiquidityResut = await connectorCtx.provideLiquidity({
          tokenA: selectedCoin,
          tokenB: pairedCoin,
          amountADesired: selectedCoinAmount,
          amountBDesired: pairedCoinAmount,
          slippage: slippage?.value,
          deadline,
          create: !selectedPool,
          reverse: selectedPool ? selectedPool.reverse : false,
        });
        console.log(`provideLiquidityResut`, provideLiquidityResut);

        history.push({ pathname: `/assets/` });
      } catch (error) {}

      setSelectedCoinIsApprove(true);
    }
  };

  useEffect(() => {
    if (timer) clearTimeout(timer);
    if (
      connectorCtx.isConnected &&
      connectorCtx.connectedAccount &&
      selectedCoin &&
      selectedCoin?.balanceOf &&
      SafeMath.gt(selectedCoinAmount || "0", "0") &&
      SafeMath.gt(selectedCoin.balanceOf, selectedCoinAmount) &&
      !isLoading
    ) {
      if (
        !SafeMath.gt(selectedCoin?.contract, "0") ||
        !SafeMath.gt(selectedCoinAmount, selectedCoinAllowance)
      ) {
        setDisplayApproveSelectedCoin(false);
        setSelectedCoinIsApprove(true);
      } else {
        setIsLoading(true);
        let id = setTimeout(
          connectorCtx
            .isAllowanceEnough(
              selectedCoin.contract,
              selectedCoinAmount,
              selectedCoin.decimals
            )
            .then((result) => {
              setSelectedCoinAllowance(result?.allowanceAmount);
              setDisplayApproveSelectedCoin(!result?.isEnough);
              setSelectedCoinIsApprove(result?.isEnough);
              setIsLoading(false);
            }),
          500
        );
        setTimer(id);
      }
    }
    return () => {};
  }, [
    connectorCtx,
    isLoading,
    selectedCoin,
    selectedCoinAllowance,
    selectedCoinAmount,
    timer,
  ]);

  useEffect(() => {
    if (timer) clearTimeout(timer);
    if (
      connectorCtx.isConnected &&
      connectorCtx.connectedAccount &&
      pairedCoin &&
      pairedCoin?.balanceOf &&
      SafeMath.gt(pairedCoinAmount || "0", "0") &&
      SafeMath.gt(pairedCoin.balanceOf, pairedCoinAmount) &&
      !isLoading
    ) {
      if (
        !SafeMath.gt(pairedCoin?.contract, "0") ||
        !SafeMath.gt(pairedCoinAmount, pairedCoinAllowance)
      ) {
        setDisplayApprovePairedCoin(false);
        setPairedCoinIsApprove(true);
      } else {
        setIsLoading(true);
        let id = setTimeout(
          connectorCtx
            .isAllowanceEnough(
              pairedCoin.contract,
              pairedCoinAmount,
              pairedCoin.decimals
            )
            .then((result) => {
              setPairedCoinAllowance(result?.allowanceAmount);
              setDisplayApprovePairedCoin(!result?.isEnough);
              setPairedCoinIsApprove(result?.isEnough);
              setIsLoading(false);
            }),
          500
        );
        setTimer(id);
      }
    }
    return () => {};
  }, [
    connectorCtx,
    pairedCoin,
    pairedCoinAmount,
    pairedCoinAllowance,
    timer,
    isLoading,
  ]);

  const setupCoins = useCallback(
    async (tokensContract) => {
      console.log(`setupCoins tokensContract`, tokensContract);
      let active, passive;
      if (
        // /^0x[a-fA-F0-9]{40}$/.test(tokensContract[0]) &&
        tokensContract[0]?.toLowerCase() !==
        selectedCoin?.contract?.toLowerCase()
      ) {
        active = await connectorCtx.searchToken(tokensContract[0]);
        console.log(`setupCoins active`, active);
        setSelectedCoin(active);
      }
      if (
        !!tokensContract[1] &&
        // /^0x[a-fA-F0-9]{40}$/.test(tokensContract[1]) &&
        tokensContract[1]?.toLowerCase() !== pairedCoin?.contract?.toLowerCase()
      ) {
        passive = await connectorCtx.searchToken(tokensContract[1]);
        await coinUpdateHandler({ active, passive, type: "paired" });
      }
    },
    [
      coinUpdateHandler,
      connectorCtx,
      pairedCoin?.contract,
      selectedCoin?.contract,
    ]
  );

  useEffect(() => {
    if (
      !location.pathname.includes("/add-liquidity/") ||
      !connectorCtx.supportedTokens > 0 ||
      !connectorCtx.supportedPools > 0 ||
      connectorCtx.isLoading ||
      isLoading
    )
      return;
    console.log(`useEffect isLoading`, isLoading);
    const tokensContract = location.pathname
      .replace("/add-liquidity/", "")
      .split("/");
    setIsLoading(true);
    setupCoins(tokensContract).then((_) => {
      history.push({
        pathname: `/add-liquidity`,
      });
      setIsLoading(false);
    });
    return () => {};
  }, [
    connectorCtx.isLoading,
    connectorCtx.supportedPools,
    connectorCtx.supportedTokens,
    isLoading,
    history,
    location.pathname,
    setupCoins,
  ]);

  useEffect(() => {
    setSelectedCoin(null);
    setSelectedPool(null);
    setPairedCoin(null);
    setSelectedCoinAmount("");
    setPairedCoinAmount("");
    setHistories([])
    setSlippage({
      value: "0.5",
      message: "",
    });
    dataUpdateHandler({ pool: null, selectedCoin: null, pairedCoin: null });
    return () => {};
  }, [connectorCtx.currentNetwork, dataUpdateHandler]);

  return (
    <form className={classes.earn} onSubmit={submitHandler}>
      <div className={classes.header}>Earn</div>
      <div className={classes.container}>
        <div className={classes.main}>
          <EarnPannel
            selectedPool={selectedPool}
            selectedCoin={selectedCoin}
            selectedCoinAmount={selectedCoinAmount}
            pairedCoin={pairedCoin}
            pairedCoinAmount={pairedCoinAmount}
            coinUpdateHandler={coinUpdateHandler}
            changeAmountHandler={changeAmountHandler}
            approveHandler={approveHandler}
            selectedCoinIsApprove={selectedCoinIsApprove}
            displayApproveSelectedCoin={displayApproveSelectedCoin}
            pairedCoinIsApprove={pairedCoinIsApprove}
            displayApprovePairedCoin={displayApprovePairedCoin}
            slippage={slippage}
            slippageChangeHander={slippageChangeHander}
            slippageAutoHander={slippageAutoHander}
            deadline={deadline}
            deadlineChangeHander={deadlineChangeHander}
            details={detail}
            summary={summary}
            isLoading={isLoading}
          />
        </div>
        <div className={classes.sub}>
          <div className={classes.details}>
            <AssetDetail />
            <NetworkDetail />
          </div>
          <Histories
            histories={histories}
            isLoading={selectedPool && isLoading}
          />
        </div>
      </div>
    </form>
  );
};

export default Earn;
