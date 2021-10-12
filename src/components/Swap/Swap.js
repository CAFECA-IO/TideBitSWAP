import React, { useState, useReducer, useEffect, useContext } from "react";
import CoinInput from "../CoinInput/CoinInput";
import Button from "../UI/Button";
import Summary from "../UI/Summary";
import classes from "./Swap.module.css";
import { dummyDetails } from "../../constant/dummy-data";
import { amountUpdateHandler, coinPairUpdateHandler } from "../../Utils/utils";
import UserContext from "../../store/user-context";

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
        prevState.sellCoinAmount,
        prevState.buyCoin,
        prevState.buyCoinAmount,
        prevState.coinOptions
      );
      ({
        active: sellCoin,
        activeAmount: sellCoinAmount,
        passive: buyCoin,
        passiveAmount: buyCoinAmount,
      } = update);
      break;
    case "SELL_COIN_AMOUN_UPDATE":
      sellCoinAmount = amountUpdateHandler(
        action.value.amount,
        prevState.sellCoin.max
      );
      buyCoinAmount = prevState.buyCoinAmount;
      break;
    case "BUY_COIN_UPDATE":
      update = coinPairUpdateHandler(
        action.value.coin,
        prevState.buyCoinAmount,
        prevState.sellCoin,
        prevState.sellCoinAmount,
        prevState.coinOptions
      );
      buyCoin = update.active;
      buyCoinAmount = update.activeAmount;
      sellCoin = update.passive;
      sellCoinAmount = update.passiveAmount;
      break;
    case "BUY_COIN_AMOUNT_UPDATE":
      buyCoinAmount = amountUpdateHandler(
        action.value.amount,
        prevState.buyCoin.max
      );
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

const Swap = () => {
  const userCtx = useContext(UserContext);
  const [formIsValid, setFormIsValid] = useState(false);

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
    const identifier = setTimeout(() => {
      console.log("Checking form validity!");
      setFormIsValid(swapState.sellCoinIsValid && swapState.buyCoinIsValid);
    }, 500);

    return () => {
      console.log("CLEANUP");
      clearTimeout(identifier);
    };
  }, [swapState.sellCoinIsValid, swapState.buyCoinIsValid]);

  const swapHandler = (event) => {
    event.preventDefault();
  };

  const sellAmountChangeHandler = (amount) => {
    dispatchSwap({
      type: "SELL_COIN_AMOUN_UPDATE",
      value: {
        amount,
      },
    });
  };

  const buyAmountChangeHandler = (amount) => {
    dispatchSwap({
      type: "BUY_COIN_AMOUNT_UPDATE",
      value: {
        amount,
      },
    });
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
        <Summary details={dummyDetails} />
        <div className={classes.button}>
          <Button type="submit" disabled={!formIsValid}>
            Swap
          </Button>
        </div>
      </div>
    </form>
  );
};

export default Swap;
