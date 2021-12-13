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

export const getDetail = (pool) => {
  return pool
    ? [
        {
          title: `${pool?.token0?.symbol || "--"} per ${
            pool?.token1?.symbol || "--"
          }`,
          value: `${formateDecimal(
            SafeMath.div(pool?.poolBalanceOfToken1, pool?.poolBalanceOfToken0),
            8
          )}`,
        },
        {
          title: `${pool?.token1?.symbol || "--"} per ${
            pool?.token0?.symbol || "--"
          }`,
          value: `${formateDecimal(
            SafeMath.div(pool?.poolBalanceOfToken0, pool?.poolBalanceOfToken1),
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
    : [];
};

export const getSummary = (pool, seletedCoin, pairedCoin) =>
  !pool
    ? [
        {
          title: "Initial prices",
          value: `1 ${seletedCoin?.symbol || "--"} ≈ ${
            seletedCoin?.amount && pairedCoin?.amount
              ? SafeMath.div(seletedCoin?.amount, pairedCoin?.amount)
              : "--"
          } ${pairedCoin?.symbol || "--"}`,
          explain:
            "Estimated price of the swap, not the final price that the swap is executed.",
        },
        {
          title: "Initial prices",
          value: `1 ${pairedCoin?.symbol || "--"} ≈ ${
            seletedCoin?.amount && pairedCoin?.amount
              ? SafeMath.div(pairedCoin?.amount, seletedCoin?.amount)
              : "--"
          } ${seletedCoin?.symbol || "--"}`,
          explain:
            "Estimated price of the swap, not the final price that the swap is executed.",
        },
        {
          title: "Share of the pool",
          value: `100 %`,
          explain:
            "The estimated percentage that the ultimate executed price of the swap deviates from current price due to trading amount.",
        },
        {
          title: "Total yield",
          value: "--",
          explain: "Trade transaction fee collected by liquidity providers.",
        },
      ]
    : [
        {
          title: pool?.token0?.symbol,
          value: SafeMath.plus(
            pool?.poolBalanceOfToken0,
            seletedCoin?.contract === pool.token0Contract
              ? seletedCoin?.amount || "0"
              : pairedCoin?.amount || "0"
          ),
        },
        {
          title: pool?.token1?.symbol,
          value: SafeMath.plus(
            pool?.poolBalanceOfToken1,
            pairedCoin?.contract === pool.token1Contract
              ? pairedCoin?.amount || "0"
              : seletedCoin?.amount || "0"
          ),
        },
        {
          title: "Share of the pool",
          value: `${
            seletedCoin?.amount
              ? formateDecimal(
                  SafeMath.mult(
                    SafeMath.div(
                      seletedCoin?.amount,
                      SafeMath.plus(
                        pool?.poolBalanceOfToken0,
                        seletedCoin?.contract === pool.token0Contract
                          ? seletedCoin?.amount || "0"
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
          explain: "Trade transaction fee collected by liquidity providers.",
        },
      ];

const Earn = (props) => {
  const connectorCtx = useContext(ConnectorContext);
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

  useEffect(() => {
    let id;
    if (id) clearTimeout(id);
    if (
      connectorCtx.isConnected &&
      connectorCtx.connectedAccount &&
      !selectedCoinIsApprove
    ) {
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
  }, [
    connectorCtx,
    selectedCoin,
    selectedCoinAllowance,
    selectedCoinAmount,
    selectedCoinIsApprove,
  ]);

  useEffect(() => {
    let id;
    if (id) clearTimeout(id);
    if (
      connectorCtx.isConnected &&
      connectorCtx.connectedAccount &&
      !pairedCoinIsApprove
    ) {
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
  }, [
    connectorCtx,
    pairedCoin,
    pairedCoinAmount,
    pairedCoinAllowance,
    pairedCoinIsApprove,
  ]);

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
    ({ activeAmount, passiveAmount, type, active, passive }) => {
      let _active, _passive, result;
      _active = active || selectedCoin;
      _passive = passive || pairedCoin;
      switch (type) {
        case "selected":
          console.log(`formateAddLiquidity activeAmount`, activeAmount);
          setSelectedCoinAmount(activeAmount);

          result = connectorCtx.formateAddLiquidity({
            tokenA: _active,
            tokenB: _passive,
            amountADesired: activeAmount,
            amountBDesired: pairedCoinAmount,
            type,
          });
          console.log(
            `formateAddLiquidity activeAmount`,
            result.amountADesired
          );
          // setSelectedCoinAmount(result.amountADesired);
          setPairedCoinAmount(result.amountBDesired);
          setSelectedPool(result.pool);
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
            tokenA: _active,
            tokenB: _passive,
            amountADesired: selectedCoinAmount,
            amountBDesired: passiveAmount,
            type,
          });
          console.log(`formateAddLiquidity result`, result);
          setSelectedCoinAmount(result.amountADesired);

          setSelectedPool(result.pool);

          break;
        default:
          break;
      }
    },
    [
      connectorCtx,
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
      activeAmount: selectedCoinAmount,
      passiveAmount: pairedCoinAmount,
      type: "selected",
      active,
      passive,
    });
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
          pairedCoinAmount
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
      }
    }
    return () => {};
  }, [
    connectorCtx,
    connectorCtx.supportedTokens,
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
            details={getDetail(selectedPool)}
            summary={getSummary(
              selectedPool,
              {
                ...selectedCoin,
                amount: selectedCoinAmount,
              },
              { ...pairedCoin, amount: pairedCoinAmount }
            )}
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
