import React, { useState, useContext, useEffect } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import SafeMath from "../../Utils/safe-math";
import classes from "./Remove.module.css";
import RemovePannel from "./RemovePannel";
import { useHistory } from "react-router";
import { amountUpdateHandler, formateDecimal } from "../../Utils/utils";
import Pairs from "./Pairs";

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
  const [displayApprovePoolContract, setDisplayApprovePoolContract] =
    useState(false);
  const [poolContractIsApprove, setPoolContractIsApprove] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [takePoolOptions, setTakePoolOptions] = useState([]);
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

  const selectHandler = (pool) => {
    setSelectedPool(pool);
    history.push({ pathname: `/redeem-liquidity/${pool.poolContract}` });
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

  useEffect(() => {
    setSelectedPool(
      connectorCtx.supportedPools.find((pool) =>
        history.location.pathname.includes(pool.poolContract)
      )
    );
    return () => {};
  }, [connectorCtx.supportedPools, history.location.pathname]);

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
          <Pairs pools={takePoolOptions} onSelect={selectHandler} />
        </div>
      </div>
    </form>
  );
};

export default Remove;
