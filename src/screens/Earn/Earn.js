import React, { useContext, useState, useEffect } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import SafeMath from "../../Utils/safe-math";
import Pairs from "./Pairs";
import classes from "./Earn.module.css";
import EarnPannel from "./EarnPannel";
import { useHistory } from "react-router";
import { amountUpdateHandler } from "../../Utils/utils";

const Earn = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [selectedPool, setSelectedPool] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [selectedCoinAmount, setSelectedCoinAmount] = useState("");
  const [pairedCoin, setPairedCoin] = useState(null);
  const [pairedCoinAmount, setPairedCoinAmount] = useState("");
  const [isValid, setIsValid] = useState(null);
  const history = useHistory();
  const [displayApproveSelectedCoin, setDisplayApproveSelectedCoin] =
    useState(false);
  const [selectedCoinIsApprove, setSelectedCoinIsApprove] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [providePoolOptions, setProvidePoolOptions] = useState([]);
  // const [takePoolOptions, setTakePoolOptions] = useState([]);

  useEffect(() => {
    const matchedAssetPools = [];
    const unMatchedAssetPools = [];
    connectorCtx.supportedPools?.forEach((pool) => {
      +pool.share > 0
        ? matchedAssetPools.push(pool)
        : unMatchedAssetPools.push(pool);
    });
    const sortingPools = matchedAssetPools.concat(unMatchedAssetPools);
    setProvidePoolOptions(sortingPools);
    // setTakePoolOptions(matchedAssetPools);
    return () => {};
  }, [connectorCtx.supportedPools, connectorCtx.supportedPools.length]);

  const approveHandler = async (contract, callback) => {
    const coinApproved = await connectorCtx.approve(contract);
    callback(coinApproved);
  };

  const selectHandler = (pool) => {
    console.log(`pool`, pool);

    setSelectedPool(pool);
    setSelectedCoin(
      connectorCtx.supportedTokens.find(
        (token) => token.contract === pool.token0.contract
      )
    );
    setPairedCoin(
      connectorCtx.supportedTokens.find(
        (token) => token.contract === pool.token1.contract
      )
    );
    history.push({ pathname: `/earn/${pool.contract}` });
    if (selectedCoinAmount) {
      changeAmountHandler(selectedCoinAmount, pool);
    }
  };

  const changeAmountHandler = (v, pool) => {
    let _pool = pool;
    let token0, token1;
    
    if (!_pool?.contract) {
      pool = connectorCtx.supportedPools[0];
    }
    console.log(` pool`,  pool);
    console.log(` _pool`,  _pool);
    setSelectedPool(_pool);
    token0 = connectorCtx.supportedTokens.find(
      (token) => token.contract === _pool.token0.contract
    );
    setSelectedCoin(token0);
    token1 = connectorCtx.supportedTokens.find(
      (token) => token.contract === _pool.token1.contract
    );
    setPairedCoin(token1);
    const _selectedCoinAmount = amountUpdateHandler(v, token0?.balanceOf);
    setSelectedCoinAmount(_selectedCoinAmount);
    let _isValid = +_selectedCoinAmount === 0 ? null : +_selectedCoinAmount > 0;
    setIsValid(_isValid);
    if (_isValid) {
      const amount = SafeMath.gt(_pool?.balanceOfToken0InPool, "0")
        ? SafeMath.mult(
            SafeMath.div(
              _pool?.balanceOfToken1InPool,
              _pool?.balanceOfToken0InPool
            ),
            _selectedCoinAmount
          )
        : SafeMath.mult(
            SafeMath.div(token0?.balanceOf, token1?.balanceOf),
            _selectedCoinAmount
          );
      // _isValid = !(+amount > +_pool.token1.balanceOf);
      console.log(` _pool?.balanceOfToken0InPool`,  _pool?.balanceOfToken0InPool);
      console.log(` _pool?.balanceOfToken1InPool`,  _pool?.balanceOfToken1InPool);
      console.log(`amount`, amount);
      setPairedCoinAmount(amount);
      // setIsValid(_isValid);
    }
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    console.log(`submitHandler`);
    if (selectedCoinIsApprove) {
      setSelectedCoinIsApprove(false);
      try {
        const provideLiquidityResut =
          await connectorCtx.provideLiquidityWithETH(
            selectedPool,
            selectedCoin,
            // selectedPool.token1,
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
    console.log(`isValid`, isValid);
    if (isValid) {
      setIsLoading(true);
      connectorCtx
        .isAllowanceEnough(
          selectedCoin.contract,
          selectedCoinAmount,
          selectedCoin.decimals
        )
        .then((selectedCoinAllowanceIsEnough) => {
          setDisplayApproveSelectedCoin(!selectedCoinAllowanceIsEnough);
          setSelectedCoinIsApprove(selectedCoinAllowanceIsEnough);
          setIsLoading(false);
        });
    }
  }, [
    connectorCtx,
    isValid,
    pairedCoinAmount,
    selectedCoinAmount,
    selectedCoin?.contract,
    selectedCoin?.decimals,
  ]);

  useEffect(() => {
    const pool = connectorCtx.supportedPools.find((pool) =>
      history.location.pathname.includes(pool.contract)
    );
    if (pool) {
      setSelectedPool(pool);
      setSelectedCoin(
        connectorCtx.supportedTokens.find(
          (token) => token.contract === pool.token0.contract
        )
      );
      setPairedCoin(
        connectorCtx.supportedTokens.find(
          (token) => token.contract === pool.token1.contract
        )
      );
    }

    return () => {};
  }, [
    history.location.pathname,
    connectorCtx.supportedPools,
    connectorCtx.supportedTokens,
  ]);

  return (
    <form className={classes.earn} onSubmit={submitHandler}>
      <div className={classes.header}>Earn</div>
      <div className={classes.container}>
        <div className={classes.main}>
          <EarnPannel
            selectedPool={selectedPool}
            selectedCoin={selectedCoin}
            pairedCoin={pairedCoin}
            pools={providePoolOptions}
            onSelect={selectHandler}
            selectedCoinAmount={selectedCoinAmount}
            changeAmountHandler={(v) => changeAmountHandler(v, selectedPool)}
            isLoading={isLoading}
            approveHandler={approveHandler}
            selectedCoinIsApprove={selectedCoinIsApprove}
            setSelectedCoinIsApprove={setSelectedCoinIsApprove}
            setDisplayApproveSelectedCoin={setDisplayApproveSelectedCoin}
            displayApproveSelectedCoin={displayApproveSelectedCoin}
          />
        </div>
        <div className={classes.sub}>
          <div className={classes.details}>
            <AssetDetail />
            <NetworkDetail />
          </div>
          <Pairs pools={providePoolOptions} onSelect={selectHandler} />
        </div>
      </div>
    </form>
  );
};

export default Earn;
