import React, { useState, useRef } from "react";
import CoinInput from "../CoinInput/CoinInput";
import Button from "../UI/Button";
import classes from "./AddLiquidity.module.css";
import { randomID } from "../../Utils/utils";
import { dummyOptions, dummyDetails } from "../../constant/dummy-data";

const AddLiquidity = (props) => {
  const [coin1, setCoin1] = useState();
  const [coin2, setCoin2] = useState();
  const coin1AmountRef = useRef();
  const coin2AmountRef = useRef();

  const submitHandler = (event) => {
    event.preventDefault();
    if (
      !coin1 ||
      !coin2 ||
      !coin1AmountRef.current ||
      !coin2AmountRef.current
    ) {
      return;
    }
    console.log(`coin1${coin1.symbol + coin1AmountRef.current?.value}`);
    console.log(`coin2${coin2.symbol + coin2AmountRef.current?.value}`);
  };

  return (
    <form className={classes.swap} onSubmit={submitHandler}>
      <main className={classes.main}>
        <CoinInput
          label="Amount"
          amountRef={coin1AmountRef}
          selected={coin1}
          onSelect={(option) => {
            setCoin1(option);
            setCoin2((prev) =>
              option.symbol === prev?.symbol
                ? dummyOptions.find((o) => o.symbol !== option.symbol)
                : prev
            );
          }}
          options={dummyOptions}
        />
        <div className={classes.icon}>
          <div>&#x21c5;</div>
        </div>
        <CoinInput
          label="Amount"
          amountRef={coin2AmountRef}
          selected={coin2}
          onSelect={(option) => {
            setCoin2(option);
            setCoin1((prev) => {
              return option.symbol === prev?.symbol
                ? dummyOptions.find((o) => o.symbol !== option.symbol)
                : prev;
            });
          }}
          options={dummyOptions}
        />
        <div className={classes.hint}>
          The final amount is determined by the price at the time of order.
        </div>
      </main>
      <div className={classes.sub}>
        <div className={classes.summary}>
          <div className={classes.title}>Summary</div>
          {dummyDetails.map((detail) => (
            <div className={classes.detail} key={randomID(6)}>
              <div className={classes.title}>{detail.title}</div>
              <div className={classes.value}>{detail.value}</div>
            </div>
          ))}
        </div>
        <div className={classes.button}>
          <Button type="submit">Add</Button>
        </div>
      </div>
    </form>
  );
};

export default AddLiquidity;
