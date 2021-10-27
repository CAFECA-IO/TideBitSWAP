import React, {
  useState,
  useReducer,
  useEffect,
  useContext,
  useCallback,
} from "react";
import CoinInput from "../CoinInput/CoinInput";
import Button from "../UI/Button";
import Summary from "../UI/Summary";
import classes from "./Swap.module.css";
import { dummyDetails } from "../../constant/dummy-data";
import {
  amountUpdateHandler,
  // calculateSwapOut,
  coinPairUpdateHandler,
  // getAmountsOut,
  getSelectedPool,
} from "../../Utils/utils";
import UserContext from "../../store/user-context";
import ConnectorContext from "../../store/connector-context";

const swapReducer = (prevState, action) => {
  let sellCoin,
    sellCoinAmount,
    sellCoinIsValid,
    buyCoin,
    buyCoinAmount,
    buyCoinIsValid,
    update;
  switch (action.type) {
    case "SELL_COIN_UPDATE":
      update = coinPairUpdateHandler(
        action.value.coin,
        prevState.buyCoin,
        prevState.coinOptions
      );
      ({ active: sellCoin, passive: buyCoin } = update);
      sellCoinAmount = prevState.sellCoinAmount;
      buyCoinAmount = "";
      break;
    case "SELL_COIN_AMOUN_UPDATE":
      sellCoinAmount = action.value.amount;
      buyCoinAmount = prevState.buyCoinAmount;
      break;
    case "BUY_COIN_UPDATE":
      update = coinPairUpdateHandler(
        action.value.coin,
        prevState.sellCoin,
        prevState.coinOptions
      );
      buyCoin = update.active;
      sellCoin = update.passive;
      sellCoinAmount = prevState.sellCoinAmount;
      buyCoinAmount = "";
      break;
    case "BUY_COIN_AMOUNT_UPDATE":
      console.log(`BUY_COIN_AMOUNT_UPDATE`, action.value.amount);
      buyCoinAmount = action.value.amount;
      sellCoinAmount = prevState.sellCoinAmount;
      break;
    default:
  }

  sellCoin = sellCoin || prevState.sellCoin;
  buyCoin = buyCoin || prevState.buyCoin;
  sellCoinIsValid = +sellCoinAmount === 0 ? null : +sellCoinAmount > 0;
  buyCoinIsValid = +buyCoinAmount === 0 ? null : +buyCoinAmount > 0;

  return {
    coinOptions: prevState.coinOptions,
    sellCoin,
    sellCoinAmount,
    sellCoinIsValid,
    buyCoin,
    buyCoinAmount,
    buyCoinIsValid,
  };
};

const Swap = (props) => {
  const userCtx = useContext(UserContext);
  const connectorCtx = useContext(ConnectorContext);
  const [formIsValid, setFormIsValid] = useState(false);
  const [pairExist, setPairExist] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [swapState, dispatchSwap] = useReducer(swapReducer, {
    coinOptions: userCtx.supportedCoins,
    sellCoin: null,
    sellCoinAmount: "",
    sellCoinIsValid: null,
    buyCoin: null,
    buyCoinAmount: "",
    buyCoinIsValid: null,
  });

  useEffect(() => {
    setIsLoading(true);
    connectorCtx
      .getSelectedPool(
        userCtx.supportedPools,
        swapState.sellCoin,
        swapState.buyCoin
      )
      .then((selectedPool) => {
        console.log(`selectedPool`, selectedPool);
        if (selectedPool) {
          setPairExist(true);
          if (swapState.sellCoinAmount)
            connectorCtx
              .getAmountsOut(
                swapState.sellCoinAmount,
                swapState.sellCoin,
                swapState.buyCoin
              )
              .then((amountOut) => {
                console.log(`amountOut`, amountOut);
                dispatchSwap({
                  type: "BUY_COIN_AMOUNT_UPDATE",
                  value: {
                    amount: amountOut,
                  },
                });
                setIsLoading(false);
              });
          else setIsLoading(false);
        } else {
          setIsLoading(false);
          setPairExist(false);
        }
      });
    return () => {
      console.log("CLEANUP selectedPool");
    };
  }, [
    swapState.sellCoin,
    swapState.buyCoin,
    userCtx.supportedPools,
    connectorCtx,
    swapState.sellCoinAmount,
  ]);

  useEffect(() => {
    if (pairExist) {
      setFormIsValid(swapState.sellCoinIsValid && swapState.buyCoinIsValid);
    } else setPairExist(false);

    return () => {
      console.log("CLEANUP");
    };
  }, [pairExist, swapState.sellCoinIsValid, swapState.buyCoinIsValid]);

  const swapHandler = async (event) => {
    event.preventDefault();
    const isSellCoinEnough = await connectorCtx.isAllowanceEnough(
      swapState.sellCoin.contract,
      swapState.sellCoinAmount,
      swapState.sellCoin.decimals
    );
    const sellCoinApprove = isSellCoinEnough
      ? true
      : await connectorCtx.approve(swapState.sellCoin.contract);
    if (sellCoinApprove) {
      const result = await connectorCtx.swap(
        swapState.sellCoinAmount,
        swapState.buyCoinAmount,
        swapState.sellCoin,
        swapState.buyCoin
      );
      console.log(`result`, result);
      props.onClose();
    }
  };

  const sellAmountChangeHandler = async (amount) => {
    dispatchSwap({
      type: "SELL_COIN_AMOUN_UPDATE",
      value: {
        amount,
      },
    });
    if (pairExist) {
      setIsLoading(true);
      const amountOut =
        +amount > 0
          ? await connectorCtx.getAmountsOut(
              amount,
              swapState.sellCoin,
              swapState.buyCoin
            )
          : 0;
      console.log(`sellAmountChangeHandler amountOut`, amountOut);
      dispatchSwap({
        type: "BUY_COIN_AMOUNT_UPDATE",
        value: {
          amount: amountOut,
        },
      });
      setIsLoading(false);
    }
  };

  const buyAmountChangeHandler = async (amount) => {
    dispatchSwap({
      type: "BUY_COIN_AMOUNT_UPDATE",
      value: {
        amount,
      },
    });
    if (pairExist) {
      setIsLoading(true);
      const amountIn =
        +amount > 0
          ? await connectorCtx.getAmountsIn(
              amount,
              swapState.sellCoin,
              swapState.buyCoin
            )
          : 0;
      dispatchSwap({
        type: "SELL_COIN_AMOUN_UPDATE",
        value: {
          amount: amountIn,
        },
      });
      setIsLoading(false);
    }
  };

  const sellCoinChangeHandler = (coin) => {
    dispatchSwap({
      type: "SELL_COIN_UPDATE",
      value: {
        coin,
      },
    });
  };

  const buyCoinChangeHandler = (coin) => {
    dispatchSwap({
      type: "BUY_COIN_UPDATE",
      value: {
        coin,
      },
    });
  };

  return (
    <form className={`responsive swap`} onSubmit={swapHandler}>
      <main className="main">
        <CoinInput
          label="Sell"
          value={swapState.sellCoinAmount}
          onChange={sellAmountChangeHandler}
          selected={swapState.sellCoin}
          onSelect={sellCoinChangeHandler}
          options={swapState.coinOptions}
        />
        <div className="icon">
          <div>&#x21c5;</div>
        </div>
        <CoinInput
          label="Buy"
          value={swapState.buyCoinAmount}
          onChange={buyAmountChangeHandler}
          selected={swapState.buyCoin}
          onSelect={buyCoinChangeHandler}
          options={swapState.coinOptions}
        />
        <div className="hint">
          The ultimate price and output is determined by the amount of tokens in
          the pool at the time of your swap.
        </div>
      </main>
      <div className="sub">
        {/* <Summary details={dummyDetails} /> */}
        <div className={classes.button}>
          <Button type="submit" disabled={!formIsValid}>
            {isLoading
              ? "Loading..."
              : pairExist === false
              ? "Insufficient liquidity for this trade."
              : pairExist === true
              ? "Swap"
              : "Select a token"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default Swap;
