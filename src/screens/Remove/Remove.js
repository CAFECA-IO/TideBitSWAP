import React, { useState, useContext, useEffect } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
import SafeMath from "../../Utils/safe-math";
import Pairs from "./Pairs";
import classes from "./Remove.module.css";
import RemovePannel from "./RemovePannel";
import { useHistory } from "react-router";
import { amountUpdateHandler } from "../../Utils/utils";

const Remove = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const userCtx = useContext(UserContext);
  const [selectedPool, setSelectedPool] = useState(null);
  const [shareAmount, setShareAmount] = useState("");
  const [token0Amount, setToken0Amount] = useState("");
  const [token1Amount, setToken1Amount] = useState("");
  const history = useHistory();
  const [displayApprovePoolContract, setDisplayApprovePoolContract] =
    useState(false);
  const [poolContractIsApprove, setPoolContractIsApprove] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const approveHandler = async (contract, callback) => {
    const coinApproved = await connectorCtx.approve(contract);
    callback(coinApproved);
  };

  const selectHandler = (pool) => {
    setSelectedPool(pool);
    history.push({ pathname: `/earn/${pool.contract}` });
  };

  const getTokenAmount = (token) => {
    const balanceOfPool = token.pools.find(
      (pool) => pool.contract === selectedPool.contract
    ).poolBalanceOfToken;
    const amount = SafeMath.mult(
      SafeMath.mult(
        SafeMath.div(shareAmount, selectedPool.totalSupply),
        balanceOfPool
      ),
      0.9
    );
    return amount;
  };

  const shareAmountChangedHandler = (amount) => {
    console.log(`shareAmountChangedHandler`, amount);
    console.log(`shareAmountChangedHandler`, selectedPool);
    const shareAmount = amountUpdateHandler(amount, selectedPool.share);
    setShareAmount(shareAmount);
    let isShareValid = +shareAmount === 0 ? null : +shareAmount > 0;
    if (isShareValid) {
      // HTTPREQUEST: get coins' amount
      setIsValid(isShareValid)
      setToken0Amount(getTokenAmount(selectedPool.token0));
      setToken1Amount(getTokenAmount(selectedPool.token1));
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
          token0Amount,
          token1Amount
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
    <div className={classes.remove} onSubmit={submitHandler}>
      <div className={classes.header}>Remove</div>
      <div className={classes.container}>
        <div className={classes.main}>
          <RemovePannel
            selectedPool={selectedPool}
            pools={userCtx.supportedPools.filter((pool) =>
              SafeMath.gt(pool.share, "0")
            )}
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
            <AssetDetail
              account={connectorCtx.connectedAccount}
              balance={`${userCtx.totalBalance} ETH`}
              balanceInFiat={`${userCtx.fiat.dollarSign} ${SafeMath.mult(
                userCtx.totalBalance,
                userCtx.fiat.exchangeRate
              )}`}
            />
            <NetworkDetail chainName={connectorCtx.currentNetwork.chainName} />
          </div>
          <Pairs pools={userCtx.supportedPools} onSelect={selectHandler} />
          {/* <Pairs pools={dummyPools} /> */}
        </div>
      </div>
    </div>
  );
};

export default Remove;
