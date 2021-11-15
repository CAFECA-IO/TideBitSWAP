import React, { useState, useContext, useEffect } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
import SafeMath from "../../Utils/safe-math";
import classes from "./Remove.module.css";
import RemovePannel from "./RemovePannel";
import { useHistory } from "react-router";
import { amountUpdateHandler } from "../../Utils/utils";
import Pairs from "./Pairs";


const Remove = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const userCtx = useContext(UserContext);
  const [selectedPool, setSelectedPool] = useState(null);
  const [shareAmount, setShareAmount] = useState("");

  const history = useHistory();
  const [displayApprovePoolContract, setDisplayApprovePoolContract] =
    useState(false);
  const [poolContractIsApprove, setPoolContractIsApprove] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [takePoolOptions, setTakePoolOptions] = useState([]);

  useEffect(() => {
    const matchedAssetPools = userCtx.supportedPools?.filter(
      (pool) => SafeMath.gt(pool.share, "0")
    );
    setTakePoolOptions(matchedAssetPools);
    return () => {};
  }, [userCtx.supportedPools, userCtx.supportedPools.length]);

  const approveHandler = async (contract, callback) => {
    const coinApproved = await connectorCtx.approve(contract);
    callback(coinApproved);
  };

  const selectHandler = (pool) => {
    setSelectedPool(pool);
    history.push({ pathname: `/redeem/${pool.contract}` });
    if (shareAmount) {
      shareAmountChangedHandler(shareAmount);
    }
  };

  const shareAmountChangedHandler = (amount) => {
    const shareAmount = amountUpdateHandler(amount, selectedPool.balanceOf);
    setShareAmount(shareAmount);
    let isShareValid = +shareAmount === 0 ? null : +shareAmount > 0;
    if (isShareValid) {
      // HTTPREQUEST: get coins' amount
      setIsValid(isShareValid);
    }
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    console.log(`submitHandler`);
    if (poolContractIsApprove) {
      setPoolContractIsApprove(false);
      try {
        const takeLiquidityResult = await connectorCtx.takeLiquidity(
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
        props.onClose();
      } catch (error) {}
      setPoolContractIsApprove(true);
    }
  };

  useEffect(() => {
    if (isValid) {
      setIsLoading(true);
      connectorCtx
        .isAllowanceEnough(
          selectedPool.contract,
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
    selectedPool?.contract,
    selectedPool?.decimals,
    shareAmount,
  ]);

  useEffect(() => {
    setSelectedPool(
      userCtx.supportedPools.find((pool) =>
        history.location.pathname.includes(pool.contract)
      )
    );
    return () => {};
  }, [history.location.pathname, userCtx.supportedPools]);

  return (
    <form className={classes.remove} onSubmit={submitHandler}>
      <div className={classes.header}>Remove</div>
      <div className={classes.container}>
        <div className={classes.main}>
          <RemovePannel
            selectedPool={selectedPool}
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
