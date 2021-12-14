import React, { useContext, useState, useEffect, useCallback } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import SafeMath from "../../Utils/safe-math";
import Pairs from "./Pairs";
import classes from "./Earn.module.css";
import EarnPannel from "./EarnPannel";
import { useHistory, useLocation } from "react-router";
import { coinPairUpdateHandler, formateDecimal } from "../../Utils/utils";

const Earn = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [slippage, setSlippage] = useState({
    value: "0.5",
    message: "",
  });
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

  const dataUpdateHandler = useCallback(
    ({ pool, selectedCoin, pairedCoin, type }) => {
      let result, _pool;
      if (!pool) {
        result = connectorCtx.formateAddLiquidity({
          pool,
          type,
          tokenA: selectedCoin,
          tokenB: pairedCoin,
        });
        _pool = result.pool;
        console.log(`dataUpdateHandler result`, result);
      } else _pool = pool;
      console.log(`dataUpdateHandler _pool`, _pool);
      setDetail(
        _pool
          ? [
              {
                title: `${_pool?.token0?.symbol || "--"} per ${
                  _pool?.token1?.symbol || "--"
                }`,
                value: `${formateDecimal(
                  SafeMath.div(
                    _pool?.poolBalanceOfToken1,
                    _pool?.poolBalanceOfToken0
                  ),
                  8
                )}`,
              },
              {
                title: `${_pool?.token1?.symbol || "--"} per ${
                  _pool?.token0?.symbol || "--"
                }`,
                value: `${formateDecimal(
                  SafeMath.div(
                    _pool?.poolBalanceOfToken0,
                    _pool?.poolBalanceOfToken1
                  ),
                  8
                )}`,
              },
              {
                title: `${
                  _pool?.share
                    ? formateDecimal(SafeMath.mult(_pool?.share, 100), 4)
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
        !_pool
          ? [
              {
                title: "Initial prices",
                value: `1 ${selectedCoin?.symbol || "--"} ≈ ${
                  selectedCoin?.amount && pairedCoin?.amount
                    ? SafeMath.div(selectedCoin?.amount, pairedCoin?.amount)
                    : "--"
                } ${pairedCoin?.symbol || "--"}`,
                explain:
                  "Estimated price of the swap, not the final price that the swap is executed.",
              },
              {
                title: "Initial prices",
                value: `1 ${pairedCoin?.symbol || "--"} ≈ ${
                  selectedCoin?.amount && pairedCoin?.amount
                    ? SafeMath.div(pairedCoin?.amount, selectedCoin?.amount)
                    : "--"
                } ${selectedCoin?.symbol || "--"}`,
                explain:
                  "Estimated price of the swap, not the final price that the swap is executed.",
              },
              {
                title: "Share of the pool",
                value: `${
                  selectedCoin?.amount && pairedCoin?.amount ? "100" : "0"
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
                title: _pool?.token0?.symbol,
                value: SafeMath.plus(
                  _pool?.poolBalanceOfToken0,
                  selectedCoin?.contract === _pool?.token0.contract
                    ? selectedCoin?.amount || "0"
                    : pairedCoin?.amount || "0"
                ),
              },
              {
                title: _pool?.token1?.symbol,
                value: SafeMath.plus(
                  _pool?.poolBalanceOfToken1,
                  pairedCoin?.contract === _pool?.token1.contract
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
                              _pool?.poolBalanceOfToken0,
                              selectedCoin?.contract === _pool?.token0.contract
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
    },
    [connectorCtx]
  );

  useEffect(() => {
    let id;
    if (id) clearTimeout(id);
    if (connectorCtx.isConnected && connectorCtx.connectedAccount) {
      if (selectedCoin && !SafeMath.gt(selectedCoin?.contract, "0")) {
        setDisplayApproveSelectedCoin(false);
        setSelectedCoinIsApprove(true);
        setIsLoading(false);
      } else if (
        selectedCoin?.balanceOf &&
        SafeMath.gt(selectedCoinAmount, "0") &&
        SafeMath.gt(selectedCoin.balanceOf, selectedCoinAmount) &&
        SafeMath.gt(selectedCoinAmount, selectedCoinAllowance)
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
              setSelectedCoinAllowance(result?.allowanceAmount);
              setDisplayApproveSelectedCoin(!result?.isEnough);
              setSelectedCoinIsApprove(result?.isEnough);
              setIsLoading(false);
            }),
          500
        );
        setIsLoading(true);
      }
    } else setSelectedCoinIsApprove(false);
    return () => {};
  }, [connectorCtx, selectedCoin, selectedCoinAllowance, selectedCoinAmount]);

  useEffect(() => {
    let id;
    if (id) clearTimeout(id);
    if (connectorCtx.isConnected && connectorCtx.connectedAccount) {
      if (pairedCoin && !SafeMath.gt(pairedCoin?.contract, "0")) {
        setDisplayApprovePairedCoin(false);
        setPairedCoinIsApprove(true);
        setIsLoading(false);
      } else if (
        pairedCoin?.balanceOf &&
        SafeMath.gt(pairedCoinAmount, "0") &&
        SafeMath.gt(pairedCoin.balanceOf, pairedCoinAmount) &&
        SafeMath.gt(pairedCoinAmount, pairedCoinAllowance)
      ) {
        setIsLoading(true);
        id = setTimeout(
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
        setIsLoading(true);
      }
    } else setPairedCoinIsApprove(false);
    return () => {};
  }, [connectorCtx, pairedCoin, pairedCoinAmount, pairedCoinAllowance]);

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
    ({ activeAmount, passiveAmount, type, active, passive, pool }) => {
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
      setSelectedPool(result.pool);
      dataUpdateHandler({
        type,
        pool: result.pool,
        selectedCoin: {
          ...result.tokenA,
          amount: result.amountADesired,
        },
        pairedCoin: { ...result.tokenB, amount: result.amountBDesired },
      });
    },
    [
      connectorCtx,
      dataUpdateHandler,
      pairedCoin,
      pairedCoinAmount,
      selectedCoin,
      selectedCoinAmount,
    ]
  );

  const coinUpdateHandler = async (token, type) => {
    let update, _active, _passive;
    switch (type) {
      case "selected":
        update = coinPairUpdateHandler(
          token,
          pairedCoin,
          connectorCtx.supportedTokens,
          connectorCtx.nativeCurrency
        );
        ({ active: _active, passive: _passive } = update);
        changeAmountHandler({
          activeAmount: selectedCoinAmount,
          type,
          active: _active,
          passive: _passive,
        });
        break;
      case "paired":
        if (!selectedCoin) {
          _active = connectorCtx.supportedTokens.find((t) =>
            SafeMath.gt(token.contrac, 0)
              ? SafeMath.gt(t.contract, 0)
              : !SafeMath.gt(t.contract, 0) &&
                t.contract !== connectorCtx.nativeCurrency?.contract
          );
          _passive = token;
        } else {
          update = coinPairUpdateHandler(
            selectedCoin,
            token,
            connectorCtx.supportedTokens,
            connectorCtx.nativeCurrency
          );
          ({ active: _active, passive: _passive } = update);
        }
        changeAmountHandler({
          passiveAmount: pairedCoinAmount,
          type,
          active: _active,
          passive: _passive,
        });
        break;
      default:
        break;
    }
    setSelectedCoin(_active);
    setPairedCoin(_passive);
    history.push({
      pathname: `/add-liquidity/${_active.contract}/${
        _passive?.contract ? _passive.contract : ""
      }`,
    });
  };

  const selectHandler = (pool) => {
    console.log(`pool`, pool);

    let active = connectorCtx.supportedTokens.find(
      (token) =>
        token.contract.toLowerCase() === pool.token0.contract.toLowerCase()
    );

    let passive = connectorCtx.supportedTokens.find(
      (token) =>
        token.contract.toLowerCase() === pool.token1.contract.toLowerCase()
    );
    setSelectedPool(pool);
    setSelectedCoin(active);
    setPairedCoin(passive);
    history.push({
      pathname: `/add-liquidity/${active.contract}/${passive.contract}`,
    });
    changeAmountHandler({
      pool,
      activeAmount: selectedCoinAmount,
      passiveAmount: pairedCoinAmount,
      type: "selected",
      active,
      passive,
    });
  };

  const slippageAutoHander = () => {
    setSlippage({
      value: "0.5",
      message: "",
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
        provideLiquidityResut = await connectorCtx.provideLiquidity(
          selectedCoin,
          pairedCoin,
          selectedCoinAmount,
          pairedCoinAmount,
          slippage?.value,
          deadline
        );
        console.log(`provideLiquidityResut`, provideLiquidityResut);

        history.push({ pathname: `/assets/` });
      } catch (error) {}

      setSelectedCoinIsApprove(true);
    }
  };

  useEffect(() => {
    if (
      !location.pathname.includes("/add-liquidity/") ||
      !connectorCtx.supportedTokens > 0 ||
      !connectorCtx.supportedPools > 0 ||
      connectorCtx.isLoading
    )
      return;
    let active, passive;
    const tokensContract = location.pathname
      .replace("/add-liquidity/", "")
      .split("/");
    if (tokensContract.length > 0) {
      if (tokensContract[0] !== selectedCoin?.contract) {
        active = connectorCtx.supportedTokens.find(
          (token) =>
            token.contract.toLowerCase() === tokensContract[0].toLowerCase()
        );
        setSelectedCoin(active);
      } else active = selectedCoin;
      if (!!tokensContract[1]) {
        if (tokensContract[1] !== pairedCoin?.contract) {
          passive = connectorCtx.supportedTokens.find(
            (token) =>
              token.contract.toLowerCase() === tokensContract[1].toLowerCase()
          );
        } else passive = pairedCoin;
        setPairedCoin(passive);
        dataUpdateHandler({
          type: "selected",
          selectedCoin: { ...active, amount: selectedCoinAmount },
          pairedCoin: { ...passive, amount: pairedCoinAmount },
        });
      }
      // const result = connectorCtx.formateAddLiquidity({
      //   tokenA: active,
      //   tokenB: passive,
      //   amountADesired: selectedCoinAmount || "0",
      //   amountBDesired: pairedCoinAmount || "0",
      //   type: "selected",
      // });
      // setSelectedPool(result.pool);
      // setPairedCoinAmount(result.amountBDesired);
    }
    return () => {};
  }, [
    connectorCtx,
    connectorCtx.supportedTokens,
    dataUpdateHandler,
    location.pathname,
    pairedCoin,
    pairedCoinAmount,
    selectedCoin,
    selectedCoinAmount,
  ]);

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
          <Pairs onSelect={selectHandler} />
        </div>
      </div>
    </form>
  );
};

export default Earn;
