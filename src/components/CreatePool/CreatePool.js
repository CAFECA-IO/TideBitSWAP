import React, { useState } from "react";

import CoinInput from "../CoinInput/CoinInput";
import Button from "../UI/Button";
import classes from "./CreatePool.module.css";
import RadioGroupButton from "../RadioGroupButton/RadioGroupButton";

import { dummyCoins, buttonOptions } from "../../constant/dummy-data";

const CreatePool = (props) => {
  const [coin1, setCoin1] = useState();
  const [coin2, setCoin2] = useState();
  const [coin1Amount, setCoin1Amount] = useState("");
  const [coin2Amount, setCoin2Amount] = useState("");
  const [feeIndex, setFeeIndex] = useState(1);

  const submitHandler = (event) => {
    event.preventDefault();
    if (!coin1 || !coin2 || !coin1Amount || !coin2Amount) {
      return;
    }
    console.log(`coin1: ${coin1.symbol + coin1Amount}`);
    console.log(`coin2: ${coin2.symbol + coin2Amount}`);
    console.log(`feeIndex: ${buttonOptions[feeIndex].value}`);
  };

  const selectHandler = (feeIndex) => {
    setFeeIndex(feeIndex);
  };

  const coin1AmountChangeHandler = (amount) => {
    console.log(`coin1Amount: ${amount}`);
    setCoin1Amount(amount);
  };

  const coin2AmountChangeHandler = (amount) => {
    console.log(`coin2Amount: ${amount}`);
    setCoin2Amount(amount);
  };

  return (
    <form className={`responsive create-pool`} onSubmit={submitHandler}>
      <main className="main">
        <CoinInput
          label="Coin"
          onChange={coin1AmountChangeHandler}
          selected={coin1}
          onSelect={(option) => {
            setCoin1(option);
            setCoin2((prev) =>
              option.symbol === prev?.symbol
                ? dummyCoins.find((o) => o.symbol !== option.symbol)
                : prev
            );
          }}
          options={dummyCoins}
        />
        <div className={classes.icon}>
          <div>+</div>
        </div>
        <CoinInput
          label="Coin"
          onChange={coin2AmountChangeHandler}
          selected={coin2}
          onSelect={(option) => {
            setCoin2(option);
            setCoin1((prev) => {
              return option.symbol === prev?.symbol
                ? dummyCoins.find((o) => o.symbol !== option.symbol)
                : prev;
            });
          }}
          options={dummyCoins}
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
            selected={feeIndex}
            onSelect={selectHandler}
          />
        </div>
        <div className={classes.button}>
          <Button type="submit">Create</Button>
        </div>
      </div>
    </form>
  );
};

export default CreatePool;
