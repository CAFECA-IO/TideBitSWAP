import React, { useContext, useState, useEffect } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
import SafeMath from "../../Utils/safe-math";
import Pairs from "./Pairs";
import classes from "./Earn.module.css";
import EarnPannel from "./EarnPannel";
import { useHistory } from "react-router";
import { amountUpdateHandler } from "../../Utils/utils";

const Earn = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const userCtx = useContext(UserContext);
  const [selectedPool, setSelectedPool] = useState(null);
  const [selectedCoinAmount, setSelectedCoinAmount] = useState("");
  const [pairedCoinAmount, setPairedCoinAmount] = useState("");
  const [isValid, setIsValid] = useState(null);
  const history = useHistory();
  const [displayApproveSelectedCoin, setDisplayApproveSelectedCoin] =
    useState(false);
  const [displayApprovePairedCoin, setDisplayApprovePairedCoin] =
    useState(false);
  const [selectedCoinIsApprove, setSelectedCoinIsApprove] = useState(false);
  const [pairedCoinIsApprove, setPairedCoinIsApprove] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [providePoolOptions, setProvidePoolOptions] = useState([]);
  const [takePoolOptions, setTakePoolOptions] = useState([]);

  useEffect(() => {
    const matchedAssetPools = [];
    const unMatchedAssetPools = [];
    userCtx.supportedPools?.forEach((pool) => {
      +pool.share > 0
        ? matchedAssetPools.push(pool)
        : unMatchedAssetPools.push(pool);
    });
    const sortingPools = matchedAssetPools.concat(unMatchedAssetPools);
    setProvidePoolOptions(sortingPools);
    setTakePoolOptions(matchedAssetPools);
    return () => {};
  }, [userCtx.supportedPools, userCtx.supportedPools.length]);

  const approveHandler = async (contract, callback) => {
    const coinApproved = await connectorCtx.approve(contract);
    callback(coinApproved);
  };

  const selectHandler = (pool) => {
    setSelectedPool(pool);
    history.push({ pathname: `/earn/${pool.contract}` });
    if (selectedCoinAmount) {
      changeAmountHandler(selectedCoinAmount, pool);
    }
  };

  const changeAmountHandler = (v, pool) => {
    const _selectedCoinAmount = amountUpdateHandler(v, pool.token0.balanceOf);
    setSelectedCoinAmount(_selectedCoinAmount);
    let _isValid = +_selectedCoinAmount === 0 ? null : +_selectedCoinAmount > 0;
    console.log(`pool`, pool);
    console.log(`_selectedCoinAmount`, _selectedCoinAmount);
    setIsValid(_isValid);
    if (_isValid) {
      const amount = SafeMath.gt(pool.balanceOfToken0InPool, "0")
        ? SafeMath.mult(
            SafeMath.div(pool.balanceOfToken1InPool, pool.balanceOfToken0InPool),
            _selectedCoinAmount
          )
        : SafeMath.mult(
            SafeMath.div(pool.token1.balanceOf, pool.token0.balanceOf),
            _selectedCoinAmount
          );
      _isValid = !(+amount > +pool.token1.balanceOf);
      console.log(`amount`, amount);
      setPairedCoinAmount(amount);
      setIsValid(_isValid);
    }
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    console.log(`submitHandler`);
    if (selectedCoinIsApprove && pairedCoinIsApprove) {
      setSelectedCoinIsApprove(false);
      try {
        const provideLiquidityResut = await connectorCtx.provideLiquidity(
          selectedPool.token0,
          selectedPool.token1,
          selectedCoinAmount,
          pairedCoinAmount
        );
        console.log(`provideLiquidityResut`, provideLiquidityResut);
        props.onClose();
      } catch (error) {}
      setSelectedCoinIsApprove(true);
    }
  };

  useEffect(() => {
    if (isValid) {
      setIsLoading(true);
      connectorCtx
        .isAllowanceEnough(
          selectedPool.token0.contract,
          selectedCoinAmount,
          selectedPool.token0.decimals
        )
        .then((selectedCoinAllowanceIsEnough) => {
          setDisplayApproveSelectedCoin(!selectedCoinAllowanceIsEnough);
          setSelectedCoinIsApprove(selectedCoinAllowanceIsEnough);
          setIsLoading(false);
        });
      setIsLoading(true);
      setIsLoading(true);
      connectorCtx
        .isAllowanceEnough(
          selectedPool.token1.contract,
          pairedCoinAmount,
          selectedPool.token1.decimals
        )
        .then((pairedCoinAllowanceIsEnough) => {
          setDisplayApprovePairedCoin(!pairedCoinAllowanceIsEnough);
          setPairedCoinIsApprove(pairedCoinAllowanceIsEnough);
          setIsLoading(false);
        });
    }
  }, [
    connectorCtx,
    isValid,
    pairedCoinAmount,
    selectedCoinAmount,
    selectedPool?.token0.contract,
    selectedPool?.token0.decimals,
    selectedPool?.token1.contract,
    selectedPool?.token1.decimals,
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
    <form className={classes.earn} onSubmit={submitHandler}>
      <div className={classes.header}>Earn</div>
      <div className={classes.container}>
        <div className={classes.main}>
          <EarnPannel
            selectedPool={selectedPool}
            pools={providePoolOptions}
            onSelect={selectHandler}
            selectedCoinAmount={selectedCoinAmount}
            changeAmountHandler={(v) => changeAmountHandler(v, selectedPool)}
            isLoading={isLoading}
            approveHandler={approveHandler}
            selectedCoinIsApprove={selectedCoinIsApprove}
            setSelectedCoinIsApprove={setSelectedCoinIsApprove}
            setDisplayApproveSelectedCoin={setDisplayApproveSelectedCoin}
            pairedCoinIsApprove={pairedCoinIsApprove}
            displayApproveSelectedCoin={displayApproveSelectedCoin}
            displayApprovePairedCoin={displayApprovePairedCoin}
            setPairedCoinIsApprove={setPairedCoinIsApprove}
            setDisplayApprovePairedCoin={setDisplayApprovePairedCoin}
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
          <Pairs pools={providePoolOptions} onSelect={selectHandler} />
        </div>
      </div>
    </form>
  );
};

export default Earn;
