import React, { useContext, useState, useEffect, useReducer } from "react";

import CoinInput from "../CoinInput/CoinInput";
import Button from "../UI/Button";
import classes from "./CreatePool.module.css";
import RadioGroupButton from "./RadioGroupButton";

import { amountUpdateHandler, coinPairUpdateHandler } from "../../utils/utils";
import UserContext from "../../store/user-context";
import { buttonOptions } from "../../constant/constant";

const createReducer = (prevState, action) => {
  let mainCoin,
    mainCoinAmount,
    mainCoinIsValid,
    subCoin,
    subCoinAmount,
    subCoinIsValid,
    feeIndex,
    update;
  switch (action.type) {
    case "MAIN_COIN_UPDATE":
      update = coinPairUpdateHandler(
        action.value.coin,
        prevState.mainCoinAmount,
        prevState.subCoin,
        prevState.subCoinAmount,
        prevState.coinOptions
      );
      ({
        active: mainCoin,
        activeAmount: mainCoinAmount,
        passive: subCoin,
        passiveAmount: subCoinAmount,
      } = update);
      break;
    case "MAIN_COIN_AMOUN_UPDATE":
      mainCoinAmount = amountUpdateHandler(
        action.value.amount,
        prevState.mainCoin.max
      );
      subCoinAmount = prevState.subCoinAmount;
      break;
    case "SUB_COIN_UPDATE":
      update = coinPairUpdateHandler(
        action.value.coin,
        prevState.subCoinAmount,
        prevState.mainCoin,
        prevState.mainCoinAmount,
        prevState.coinOptions
      );
      subCoin = update.active;
      subCoinAmount = update.activeAmount;
      mainCoin = update.passive;
      mainCoinAmount = update.passiveAmount;
      break;
    case "SUB_COIN_AMOUNT_UPDATE":
      subCoinAmount = amountUpdateHandler(
        action.value.amount,
        prevState.subCoin.max
      );
      mainCoinAmount = prevState.mainCoinAmount;
      break;
    case "SELECTED_FEE_UPDATE":
      feeIndex = action.value.feeIndex;
      return {
        ...prevState,
        feeIndex,
      };
    default:
  }

  mainCoin = mainCoin || prevState.mainCoin;
  subCoin = subCoin || prevState.subCoin;
  mainCoinIsValid = +mainCoinAmount === 0 ? null : +mainCoinAmount > 0;
  subCoinIsValid = +subCoinAmount === 0 ? null : +subCoinAmount > 0;

  return {
    coinOptions: prevState.coinOptions,
    mainCoin,
    mainCoinAmount,
    mainCoinIsValid,
    subCoin,
    subCoinAmount,
    subCoinIsValid,
    feeIndex: prevState.feeIndex,
  };
};

const CreatePool = () => {
  const userCtx = useContext(UserContext);
  const [formIsValid, setFormIsValid] = useState(false);

  const [createState, dispatchCreate] = useReducer(createReducer, {
    coinOptions: userCtx.supportedCoins,
    mainCoin: null,
    mainCoinAmount: "",
    mainCoinIsValid: null,
    subCoin: null,
    subCoinAmount: "",
    subCoinIsValid: null,
    feeIndex: 1,
  });

  useEffect(() => {
    const identifier = setTimeout(() => {
      console.log("Checking form validity!");
      setFormIsValid(createState.mainCoinIsValid && createState.subCoinIsValid);
    }, 500);

    return () => {
      console.log("CLEANUP");
      clearTimeout(identifier);
    };
  }, [createState.mainCoinIsValid, createState.subCoinIsValid]);

  const createHandler = (event) => {
    event.preventDefault();
  };

  const selectHandler = (feeIndex) => {
    dispatchCreate({
      type: "SELECTED_FEE_UPDATE",
      value: {
        feeIndex,
      },
    });
  };

  const mainAmountChangeHandler = (amount) => {
    dispatchCreate({
      type: "MAIN_COIN_AMOUN_UPDATE",
      value: {
        amount,
      },
    });
  };

  const subAmountChangeHandler = (amount) => {
    dispatchCreate({
      type: "SUB_COIN_AMOUNT_UPDATE",
      value: {
        amount,
      },
    });
  };

  const mainCoinChangeHandler = (coin) => {
    dispatchCreate({
      type: "MAIN_COIN_UPDATE",
      value: {
        coin,
      },
    });
  };

  const subCoinChangeHandler = (coin) => {
    dispatchCreate({
      type: "SUB_COIN_UPDATE",
      value: {
        coin,
      },
    });
  };

  return (
    <form className={`responsive create-pool`} onSubmit={createHandler}>
      <main className="main">
        <CoinInput
          label="Coin"
          value={createState.mainCoinAmount}
          onChange={mainAmountChangeHandler}
          selected={createState.mainCoin}
          onSelect={mainCoinChangeHandler}
          options={createState.coinOptions}
        />
        <div className="icon">
          <div>+</div>
        </div>
        <CoinInput
          label="Coin"
          value={createState.subCoinAmount}
          onChange={subAmountChangeHandler}
          selected={createState.subCoin}
          onSelect={subCoinChangeHandler}
          options={createState.coinOptions}
        />
      </main>
      <div className="sub">
        <div className={classes.radio}>
          <div className={classes.title}>
            <div className={classes.text}> Slippage Tolerance</div>
            <span className={`tooltip ${classes.tooltip}`}>
              <div>?</div>
              <div className={`tooltiptext`}>
                Setting a high slippage tolerance can help transactions succeed,
                but you may not get such a good price. Use with caution.
              </div>
            </span>
          </div>
          <RadioGroupButton
            name="fee-option-of-create-pool"
            options={buttonOptions}
            selected={createState.feeIndex}
            onSelect={selectHandler}
          />
        </div>
        <div className={classes.button}>
          <Button type="submit" disabled={!formIsValid}>
            Create
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CreatePool;
