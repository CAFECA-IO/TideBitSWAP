import React, { useContext, useState, useEffect } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import SafeMath from "../../Utils/safe-math";
import Pairs from "./Pairs";
import classes from "./Earn.module.css";
import EarnPannel from "./EarnPannel";
import { useHistory } from "react-router";
import {
  amountUpdateHandler,
  coinPairUpdateHandler,
  formateDecimal,
} from "../../Utils/utils";
import UserContext from "../../store/user-context";

export const getDetails = (pool, seletedCoin, pairedCoin, fiat) =>
  !pool
    ? [
        {
          title: "Initial prices",
          value: `1 ${seletedCoin?.coin?.symbol || "--"} ≈ ${
            seletedCoin?.amount && pairedCoin?.amount
              ? SafeMath.div(seletedCoin?.amount, pairedCoin?.amount)
              : "--"
          } ${pairedCoin?.coin?.symbol || "--"}`,
          explain:
            "Estimated price of the swap, not the final price that the swap is executed.",
        },
        {
          title: "Initial prices",
          value: `1 ${pairedCoin?.coin?.symbol || "--"} ≈ ${
            seletedCoin?.amount && pairedCoin?.amount
              ? SafeMath.div(pairedCoin?.amount, seletedCoin?.amount)
              : "--"
          } ${seletedCoin?.coin?.symbol || "--"}`,
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
          value: pool?.poolBalanceOfToken0,
        },
        {
          title: pool?.token1?.symbol,
          value: pool?.poolBalanceOfToken1,
        },
        {
          title: "Price",
          value: `1 ${pool?.token0?.symbol || "--"} ≈ ${formateDecimal(
            SafeMath.div(pool?.poolBalanceOfToken1, pool?.poolBalanceOfToken0),
            4
          )} ${pool?.token1?.symbol}`,
        },
        {
          title: "Price",
          value: `1 ${pool?.token1?.symbol || "--"} ≈ ${formateDecimal(
            SafeMath.div(pool?.poolBalanceOfToken0, pool?.poolBalanceOfToken1),
            4
          )} ${pool?.token0?.symbol}`,
        },
        {
          title: "Your pool share",
          value: `${
            pool?.share
              ? formateDecimal(SafeMath.mult(pool?.share, 100), 4)
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
  const userCtx = useContext(UserContext);

  const [selectedPool, setSelectedPool] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [selectedCoinAmount, setSelectedCoinAmount] = useState("");
  const [pairedCoin, setPairedCoin] = useState(null);
  const [pairedCoinAmount, setPairedCoinAmount] = useState("");
  const history = useHistory();
  const [displayApproveSelectedCoin, setDisplayApproveSelectedCoin] =
    useState(false);
  const [selectedCoinIsApprove, setSelectedCoinIsApprove] = useState(false);

  const [displayApprovePairedCoin, setDisplayApprovePairedCoin] =
    useState(false);
  const [pairedCoinIsApprove, setPairedCoinIsApprove] = useState(false);
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

  useEffect(() => {
    if (connectorCtx.isConnected && connectorCtx.connectedAccount)
      if (
        selectedCoin?.balanceOf &&
        SafeMath.gt(selectedCoinAmount, "0") &&
        SafeMath.gt(selectedCoin.balanceOf, selectedCoinAmount)
      ) {
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
        setIsLoading(true);
      }
    return () => {};
  }, [connectorCtx, selectedCoin, selectedCoinAmount]);

  useEffect(() => {
    if (connectorCtx.isConnected && connectorCtx.connectedAccount)
      if (
        pairedCoin?.balanceOf &&
        SafeMath.gt(pairedCoinAmount, "0") &&
        SafeMath.gt(pairedCoin.balanceOf, pairedCoinAmount)
      ) {
        setIsLoading(true);
        connectorCtx
          .isAllowanceEnough(
            pairedCoin.contract,
            pairedCoinAmount,
            pairedCoin.decimals
          )
          .then((pairedCoinAllowanceIsEnough) => {
            setDisplayApprovePairedCoin(!pairedCoinAllowanceIsEnough);
            setPairedCoinIsApprove(pairedCoinAllowanceIsEnough);
            setIsLoading(false);
          });
        setIsLoading(true);
      }
    return () => {};
  }, [connectorCtx, pairedCoin, pairedCoinAmount]);

  const approveHandler = async (contract, type) => {
    const coinApproved = await connectorCtx.approve(contract);
    switch (type) {
      case "selected":
        setSelectedCoinIsApprove(coinApproved);
        setDisplayApproveSelectedCoin(!!coinApproved);
        break;
      case "paired":
        setPairedCoinIsApprove(coinApproved);
        setDisplayApprovePairedCoin(!!coinApproved);
        break;
      default:
        break;
    }
  };
  const changeAmountHandler = (value, type) => {
    let updateSelectedAmount, updatePairedAmount;
    switch (type) {
      case "selected":
        updateSelectedAmount = selectedCoin
          ? amountUpdateHandler(value, selectedCoin.balanceOf)
          : value;

        if (selectedPool) {
          updatePairedAmount = SafeMath.mult(
            SafeMath.div(
              selectedPool.poolBalanceOfToken1,
              selectedPool.poolBalanceOfToken0
            ),
            updateSelectedAmount
          );
          console.log(`updatePairedAmount`, updatePairedAmount);
          setPairedCoinAmount(updatePairedAmount);
        }
        setSelectedCoinAmount(updateSelectedAmount);
        break;
      case "paired":
        updatePairedAmount = pairedCoin
          ? amountUpdateHandler(value, pairedCoin.balanceOf)
          : value;
        if (selectedPool) {
          updateSelectedAmount = SafeMath.mult(
            SafeMath.div(
              selectedPool.poolBalanceOfToken0,
              selectedPool.poolBalanceOfToken1
            ),
            updatePairedAmount
          );
          console.log(`updateSelectedAmount`, updateSelectedAmount);
          setSelectedCoinAmount(updateSelectedAmount);
        }
        setPairedCoinAmount(updatePairedAmount);
        break;
      default:
        break;
    }
  };

  const coinUpdateHandler = async (token, type) => {
    let update, _active, _passive;
    switch (type) {
      case "selected":
        update = coinPairUpdateHandler(
          token,
          pairedCoin,
          connectorCtx.supportedTokens
        );
        ({ active: _active, passive: _passive } = update);
        break;
      case "paired":
        if (!selectedCoin) {
          _active = connectorCtx.supportedTokens.find((t) =>
            token.contract === connectorCtx.nativeCurrency.contract
              ? t.contract !== connectorCtx.nativeCurrency.contract
              : t.contract === connectorCtx.nativeCurrency.contract
          );
          _passive = token;
        } else {
          update = coinPairUpdateHandler(
            selectedCoin,
            token,
            connectorCtx.supportedTokens
          );
          ({ active: _active, passive: _passive } = update);
        }
        break;
      default:
        break;
    }
    setSelectedCoin(_active);
    setPairedCoin(_passive);
    history.push({
      pathname: `/earn/${_active.contract}/${
        _passive?.contract ? _passive.contract : ""
      }`,
    });
    if (_active && _passive) {
      const pool = await connectorCtx.getSelectedPool(
        connectorCtx.supportedPools,
        _active,
        _passive
      );
      setSelectedPool(pool);
      if (pool) {
        if (_active.contract !== pool.token0.contract) {
          setSelectedCoin(_passive);
          setPairedCoin(_active);
          history.push({
            pathname: `/earn/${_passive.contract}/${_active.contract}`,
          });
        }
        changeAmountHandler(selectedCoinAmount, "selected");
      }
      console.log(`pool`, pool);
    }
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
    history.push({
      pathname: `/earn/${pool.token0.contract}/${pool.token1.contract}`,
    });
    changeAmountHandler(selectedCoinAmount, "selected");
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    console.log(`submitHandler`);
    if (selectedCoinIsApprove) {
      setSelectedCoinIsApprove(false);
      try {
        const provideLiquidityResut = await connectorCtx.provideLiquidity(
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
            amountUpdateHandler={changeAmountHandler}
            approveHandler={approveHandler}
            selectedCoinIsApprove={selectedCoinIsApprove}
            displayApproveSelectedCoin={displayApproveSelectedCoin}
            pairedCoinIsApprove={pairedCoinIsApprove}
            displayApprovePairedCoin={displayApprovePairedCoin}
            details={getDetails(
              selectedPool,
              {
                coin: selectedCoin,
                amount: selectedCoinAmount,
              },
              { coin: pairedCoin, amount: pairedCoinAmount },
              userCtx.fiat
            )}
            isLoading={isLoading}
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
