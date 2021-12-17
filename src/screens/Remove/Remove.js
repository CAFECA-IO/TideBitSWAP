import React, { useState, useContext, useEffect, useCallback } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import SafeMath from "../../Utils/safe-math";
import classes from "./Remove.module.css";
import RemovePannel from "./RemovePannel";
import { useHistory, useLocation } from "react-router";
import { amountUpdateHandler, formateDecimal } from "../../Utils/utils";
import Histories from "../../components/UI/Histories";

const getDetails = (pool, shareAmount) => [
  {
    title: pool?.token0?.symbol,
    value: pool?.poolBalanceOfToken0,
  },
  {
    title: pool?.token1?.symbol,
    value: pool?.poolBalanceOfToken1,
  },
  {
    title: "Take share",
    value: `${
      shareAmount
        ? formateDecimal(
            SafeMath.mult(SafeMath.div(shareAmount, pool?.balanceOf), 100),
            4
          )
        : "--"
    } %`,
  },
  {
    title: "Price",
    value: `1 ${pool?.token0?.symbol || "--"} ≈ ${
      pool
        ? formateDecimal(
            SafeMath.div(pool?.poolBalanceOfToken1, pool?.poolBalanceOfToken0),
            4
          )
        : "--"
    } ${pool?.token1?.symbol || "--"}`,
  },
  {
    title: "Price",
    value: `1 ${pool?.token1?.symbol || "--"} ≈ ${
      pool
        ? formateDecimal(
            SafeMath.div(pool?.poolBalanceOfToken0, pool?.poolBalanceOfToken1),
            4
          )
        : "--"
    } ${pool?.token0?.symbol || "--"}`,
  },
  {
    title: "Your pool share",
    value: `${
      pool?.share ? formateDecimal(SafeMath.mult(pool?.share, 100), 4) : "0"
    } %`,
    explain:
      "The estimated percentage that the ultimate executed price of the swap deviates from current price due to trading amount.",
  },
];

const Remove = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [selectedPool, setSelectedPool] = useState(null);
  const [coinOptions, setCoinOptions] = useState([]);
  const [shareAmount, setShareAmount] = useState("");
  const [poolAllowance, setPoolAllowance] = useState("0");

  const history = useHistory();
  const location = useLocation();
  const [displayApprovePoolContract, setDisplayApprovePoolContract] =
    useState(false);
  const [poolContractIsApprove, setPoolContractIsApprove] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [takePoolOptions, setTakePoolOptions] = useState([]);
  const [histories, setHistories] = useState([]);
  const [slippage, setSlippage] = useState({
    value: "5",
    message: "",
  });
  const [deadline, setDeadline] = useState("30");

  useEffect(() => {
    const matchedAssetPools = connectorCtx.supportedPools?.filter((pool) =>
      SafeMath.gt(pool.share, "0")
    );
    setTakePoolOptions(matchedAssetPools);
    return () => {};
  }, [connectorCtx.supportedPools]);

  const approveHandler = async () => {
    if (selectedPool?.poolContract) {
      const coinApproved = await connectorCtx.approve(
        selectedPool.poolContract
      );
      setPoolContractIsApprove(coinApproved);
      setDisplayApprovePoolContract(!coinApproved);
    } else {
      console.log(`approveHandler selectedPool`, selectedPool);
    }
  };

  const selectHandler = async (pool) => {
    setSelectedPool(pool);
    history.push({ pathname: `/redeem-liquidity/${pool.poolContract}` });
    const histories = await connectorCtx.getPoolHistory(pool.poolContract);
    setHistories(histories);
    if (shareAmount) {
      shareAmountChangedHandler(shareAmount);
    }
  };

  const shareAmountChangedHandler = (amount) => {
    const shareAmount = amountUpdateHandler(
      amount,
      selectedPool?.balanceOf || "0"
    );
    setShareAmount(shareAmount);
    let isShareValid = +shareAmount === 0 ? null : +shareAmount > 0;
    if (isShareValid) {
      setIsValid(isShareValid);
      const coinOptions = [
        {
          ...selectedPool.token0,
          amount: SafeMath.mult(
            SafeMath.div(shareAmount, selectedPool.totalSupply),
            selectedPool.poolBalanceOfToken0
          ),
        },
        {
          ...selectedPool.token1,
          amount: SafeMath.mult(
            SafeMath.div(shareAmount, selectedPool.totalSupply),
            selectedPool.poolBalanceOfToken1
          ),
        },
      ];
      setCoinOptions(coinOptions);
    }
  };

  const slippageAutoHander = () => {
    setSlippage({
      value: "5",
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
    console.log(`submitHandler`);
    if (poolContractIsApprove) {
      setPoolContractIsApprove(false);
      try {
        const takeLiquidityResult = !SafeMath.gt(
          selectedPool.token0.contract,
          0
        )
          ? await connectorCtx.removeLiquidityETH(
              selectedPool,
              selectedPool.token1,
              shareAmount,
              SafeMath.mult(
                SafeMath.div(shareAmount, selectedPool.totalSupply),
                selectedPool.poolBalanceOfToken1
              ),
              SafeMath.mult(
                SafeMath.div(shareAmount, selectedPool.totalSupply),
                selectedPool.poolBalanceOfToken0
              ),
              slippage?.value,
              deadline
            )
          : !SafeMath.gt(selectedPool.token1.contract, 0)
          ? await connectorCtx.removeLiquidityETH(
              selectedPool,
              selectedPool.token0,
              shareAmount,
              SafeMath.mult(
                SafeMath.div(shareAmount, selectedPool.totalSupply),
                selectedPool.poolBalanceOfToken0
              ),
              SafeMath.mult(
                SafeMath.div(shareAmount, selectedPool.totalSupply),
                selectedPool.poolBalanceOfToken1
              ),
              slippage?.value,
              deadline
            )
          : await connectorCtx.takeLiquidity(
              selectedPool,
              shareAmount,
              SafeMath.mult(
                SafeMath.div(shareAmount, selectedPool.totalSupply),
                selectedPool.poolBalanceOfToken0
              ),
              SafeMath.mult(
                SafeMath.div(shareAmount, selectedPool.totalSupply),
                selectedPool.poolBalanceOfToken1
              ),
              slippage?.value,
              deadline
            );
        console.log(`takeLiquidityResult`, takeLiquidityResult);
        history.push({ pathname: `/assets/` });
      } catch (error) {}
      setPoolContractIsApprove(true);
    }
  };

  useEffect(() => {
    let id;
    if (id) clearTimeout(id);
    if (isValid && SafeMath.gt(shareAmount, poolAllowance)) {
      setIsLoading(true);
      id = setTimeout(
        connectorCtx
          .isAllowanceEnough(
            selectedPool.poolContract,
            shareAmount,
            selectedPool.decimals
          )
          .then((result) => {
            setPoolAllowance(result?.allowanceAmount);
            setDisplayApprovePoolContract(!result?.isEnough);
            setPoolContractIsApprove(result?.isEnough);
            setIsLoading(false);
          })
      );
    }
    return () => {};
  }, [
    connectorCtx,
    isValid,
    selectedPool?.poolContract,
    selectedPool?.decimals,
    shareAmount,
    poolAllowance,
  ]);

  const getPoolInfo = useCallback(
    async (contract) => {
      let pool;
      pool = connectorCtx.supportedPools.find(
        (pool) => contract.toLowerCase() === pool.poolContract.toLowerCase()
      );
      setSelectedPool(pool);
      if (pool) {
        const histories = await connectorCtx.getPoolHistory(pool.poolContract);
        setHistories(histories);
      }
    },
    [connectorCtx]
  );

  useEffect(() => {
    if (
      !location.pathname.includes("/redeem-liquidity/") ||
      selectedPool?.poolContract.toLowerCase() ===
        location.pathname.replace("/redeem-liquidity/", "").toLowerCase()
    )
      return;
    const poolContract = location.pathname.replace("/redeem-liquidity/", "");
    console.log(`getPoolInfo poolContract`, poolContract);
    if (!/^0x[a-fA-F0-9]{40}$/.test(poolContract))
      history.push({ pathname: `/` });
    else getPoolInfo(poolContract);
    return () => {};
  }, [connectorCtx.supportedPools, getPoolInfo, history, location.pathname, selectedPool?.poolContract]);

  return (
    <form className={classes.remove} onSubmit={submitHandler}>
      <div className={classes.header}>Remove</div>
      <div className={classes.container}>
        <div className={classes.main}>
          <RemovePannel
            selectedPool={selectedPool}
            coinOptions={coinOptions}
            pools={takePoolOptions}
            onSelect={selectHandler}
            isLoading={isLoading}
            approveHandler={approveHandler}
            shareAmount={shareAmount}
            changeAmountHandler={shareAmountChangedHandler}
            displayApprovePoolContract={displayApprovePoolContract}
            poolContractIsApprove={poolContractIsApprove}
            details={getDetails(selectedPool, shareAmount)}
            slippage={slippage}
            slippageChangeHander={slippageChangeHander}
            slippageAutoHander={slippageAutoHander}
            deadline={deadline}
            deadlineChangeHander={deadlineChangeHander}
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

export default Remove;
