import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";

import CoinInput from "../CoinInput/CoinInput";
import Header from "../UI/Header";
import Button from "../UI/Button";
import classes from "./Swap.module.css";
import { randomID } from "../../Utils/utils";
import { dummyOptions, dummyDetails } from "../../constant/dummy-data";

const SwapContent = (props) => {
  const [sellCoin, setSellCoin] = useState();
  const [buyCoin, setBuyCoin] = useState();
  const sellAmountRef = useRef();
  const buyAmountRef = useRef();

  const swapHandler = (event) => {
    event.preventDefault();
    if (
      !sellCoin ||
      !buyCoin ||
      !sellAmountRef.current ||
      !buyAmountRef.current
    ) {
      return;
    }
    console.log(`sellCoin${sellCoin.symbol + sellAmountRef.current?.value}`);
    console.log(`buyCoin${buyCoin.symbol + buyAmountRef.current?.value}`);
  };

  return (
    <div className={classes.swap}>
      <Header title="Swap" leading={true} onClose={props.onClose} />

      <form onSubmit={swapHandler}>
        <main className={classes.main}>
          <CoinInput
            label="Sell"
            amountRef={sellAmountRef}
            selected={sellCoin}
            onChanged={(option) => {
              setSellCoin(option);
              setBuyCoin((prev) =>
                option.symbol === prev?.symbol
                  ? dummyOptions.find((o) => o.symbol !== option.symbol)
                  : prev
              );
            }}
            options={dummyOptions}
          />
          <div className={classes.icon}></div>
          <CoinInput
            label="Buy"
            amountRef={buyAmountRef}
            selected={buyCoin}
            onChanged={(option) => {
              setBuyCoin(option);
              setSellCoin((prev) => {
                return option.symbol === prev?.symbol
                  ? dummyOptions.find((o) => o.symbol !== option.symbol)
                  : prev;
              });
            }}
            options={dummyOptions}
          />
          <div className={classes.hint}>
            The ultimate price and output is determined by the amount of tokens
            in the pool at the time of your swap.
          </div>
        </main>
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
          <Button type="submit">Swap</Button>
        </div>
      </form>
    </div>
  );
};

const Swap = (props) => {
  return (
    <React.Fragment>
      {ReactDOM.createPortal(
        <SwapContent onClose={props.onClose} />,
        document.getElementById("overlay-root")
      )}
    </React.Fragment>
  );
};

export default Swap;
