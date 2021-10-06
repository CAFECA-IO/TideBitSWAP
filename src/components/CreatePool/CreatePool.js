import React, { useState, useRef } from "react";

import CoinInput from "../CoinInput/CoinInput";
import Button from "../UI/Button";
import classes from "./CreatePool.module.css";
import RadioGroupButton from "../RadioGroupButton/RadioGroupButton";

import { dummyOptions, buttonOptions } from "../../constant/dummy-data";

const CreatePool = (props) => {
  const [coin1, setcoin1] = useState();
  const [coin2, setcoin2] = useState();
  const [feeIndex, setFeeIndex] = useState(1);
  const sellAmountRef = useRef();
  const buyAmountRef = useRef();

  const submitHandler = (event) => {
    event.preventDefault();
    if (!coin1 || !coin2 || !sellAmountRef.current || !buyAmountRef.current) {
      return;
    }
    console.log(`coin1: ${coin1.symbol + sellAmountRef.current?.value}`);
    console.log(`coin2: ${coin2.symbol + buyAmountRef.current?.value}`);
    console.log(`feeIndex: ${buttonOptions[feeIndex].value}`);
  };

  const selectHandler = (feeIndex) => {
    setFeeIndex(feeIndex);
  };

  return (
    <form onSubmit={submitHandler} className={classes["create-pool"]}>
      <main className={classes.main}>
        <CoinInput
          label="Coin"
          amountRef={sellAmountRef}
          selected={coin1}
          onChanged={(option) => {
            setcoin1(option);
            setcoin2((prev) =>
              option.symbol === prev?.symbol
                ? dummyOptions.find((o) => o.symbol !== option.symbol)
                : prev
            );
          }}
          options={dummyOptions}
        />
        <div className={classes.icon}></div>
        <CoinInput
          label="Coin"
          amountRef={buyAmountRef}
          selected={coin2}
          onChanged={(option) => {
            setcoin2(option);
            setcoin1((prev) => {
              return option.symbol === prev?.symbol
                ? dummyOptions.find((o) => o.symbol !== option.symbol)
                : prev;
            });
          }}
          options={dummyOptions}
        />
      </main>
      <div className={classes.sub}>
        <div className={classes.radio}>
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
