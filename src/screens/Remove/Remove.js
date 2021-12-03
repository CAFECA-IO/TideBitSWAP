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
import UserContext from "../../store/user-context";

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
  const userCtx = useContext(UserContext);
  const [selectedPool, setSelectedPool] = useState(null);
  const [coinOptions, setCoinOptions] = useState([]);
  const [shareAmount, setShareAmount] = useState("");

  const history = useHistory();
  const [displayApprovePoolContract, setDisplayApprovePoolContract] =
    useState(false);
  const [poolContractIsApprove, setPoolContractIsApprove] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [takePoolOptions, setTakePoolOptions] = useState([]);

  useEffect(() => {
    const matchedAssetPools = userCtx.invests?.filter((pool) =>
      SafeMath.gt(pool.share, "0")
    );
    setTakePoolOptions(matchedAssetPools);
    return () => {};
  }, [userCtx.invests, userCtx.invests.length]);

  const approveHandler = async (contract, callback) => {
    const coinApproved = await connectorCtx.approve(contract);
    callback(coinApproved);
  };

  const selectHandler = (pool) => {
    setSelectedPool(pool);
    history.push({ pathname: `/redeem/${pool.poolContract}` });
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
            SafeMath.mult(
              SafeMath.div(shareAmount, selectedPool.totalSupply),
              selectedPool.poolBalanceOfToken0
            ),
            0.9
          ),
        },
        {
          ...selectedPool.token1,
          amount: SafeMath.mult(
            SafeMath.mult(
              SafeMath.div(shareAmount, selectedPool.totalSupply),
              selectedPool.poolBalanceOfToken1
            ),
            0.9
          ),
        },
      ];
      setCoinOptions(coinOptions);
    }
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
                SafeMath.mult(
                  SafeMath.div(shareAmount, selectedPool.totalSupply),
                  selectedPool.poolBalanceOfToken1
                ),
                0.9
              ),
              SafeMath.mult(
                SafeMath.mult(
                  SafeMath.div(shareAmount, selectedPool.totalSupply),
                  selectedPool.poolBalanceOfToken0
                ),
                0.9
              )
            )
          : !SafeMath.gt(selectedPool.token1.contract, 0)
          ? await connectorCtx.removeLiquidityETH(
              selectedPool,
              selectedPool.token0,
              shareAmount,
              SafeMath.mult(
                SafeMath.mult(
                  SafeMath.div(shareAmount, selectedPool.totalSupply),
                  selectedPool.poolBalanceOfToken0
                ),
                0.9
              ),
              SafeMath.mult(
                SafeMath.mult(
                  SafeMath.div(shareAmount, selectedPool.totalSupply),
                  selectedPool.poolBalanceOfToken1
                ),
                0.9
              )
            )
          : await connectorCtx.takeLiquidity(
              selectedPool,
              shareAmount,
              SafeMath.mult(
                SafeMath.mult(
                  SafeMath.div(shareAmount, selectedPool.totalSupply),
                  selectedPool.poolBalanceOfToken0
                ),
                0.9
              ),
              SafeMath.mult(
                SafeMath.mult(
                  SafeMath.div(shareAmount, selectedPool.totalSupply),
                  selectedPool.poolBalanceOfToken1
                ),
                0.9
              )
            );
        console.log(`takeLiquidityResult`, takeLiquidityResult);
        history.push({ pathname: `/assets/` });
      } catch (error) {}
      setPoolContractIsApprove(true);
    }
  };

  useEffect(() => {
    if (isValid) {
      setIsLoading(true);
      connectorCtx
        .isAllowanceEnough(
          selectedPool.poolContract,
          shareAmount,
          selectedPool.decimals
        )
        .then((isPoolPairEnough) => {
          setDisplayApprovePoolContract(!isPoolPairEnough);
          setPoolContractIsApprove(isPoolPairEnough);
          setIsLoading(false);
        });
    }
    return () => {};
  }, [
    connectorCtx,
    isValid,
    selectedPool?.poolContract,
    selectedPool?.decimals,
    shareAmount,
  ]);

  useEffect(() => {
    setSelectedPool(
      userCtx.invests.find((pool) =>
        history.location.pathname.includes(pool.poolContract)
      )
    );
    return () => {};
  }, [history.location.pathname, userCtx.invests]);

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
            setDisplayApprovePoolContract={setDisplayApprovePoolContract}
            poolContractIsApprove={poolContractIsApprove}
            setPoolContractIsApprove={setPoolContractIsApprove}
            details={getDetails(selectedPool, shareAmount)}
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
