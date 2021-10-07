import React, { useState } from "react";
import CoinInput from "../CoinInput/CoinInput";
import Button from "../UI/Button";
import classes from "./Swap.module.css";
import { randomID } from "../../Utils/utils";
import { dummyCoins, dummyDetails } from "../../constant/dummy-data";

const Swap = (props) => {
  const [sellCoin, setSellCoin] = useState();
  const [buyCoin, setBuyCoin] = useState();
  const [sellCoinAmount, setSellCoinAmount] = useState();
  const [buyCoinAmount, setBuyCoinAmount] = useState();

  const sellCoinAmountChangeHandler = (amount) => {
    console.log(`sellCoinAmount: ${amount}`);
    setSellCoinAmount(amount);
  };
  const buyCoinAmountChangeHandler = (amount) => {
    console.log(`buyCoinAmount: ${amount}`);
    setBuyCoinAmount(amount);
  };

  const swapHandler = (event) => {
    event.preventDefault();
    if (!sellCoin || !buyCoin || !sellCoinAmount || !buyCoinAmount) {
      return;
    }
    console.log(`sellCoin${sellCoin.symbol + sellCoinAmount}`);
    console.log(`buyCoin${buyCoin.symbol + buyCoinAmount}`);
  };

  return (
    <form className={classes.swap} onSubmit={swapHandler}>
      <main className={classes.main}>
        <CoinInput
          label="Sell"
          onChange={sellCoinAmountChangeHandler}
          selected={sellCoin}
          onSelect={(option) => {
            setSellCoin(option);
            setBuyCoin((prev) =>
              option.symbol === prev?.symbol
                ? dummyCoins.find((o) => o.symbol !== option.symbol)
                : prev
            );
          }}
          options={dummyCoins}
        />
        <div className={classes.icon}>
          <div>&#x21c5;</div>
        </div>
        <CoinInput
          label="Buy"
          onChange={buyCoinAmountChangeHandler}
          selected={buyCoin}
          onSelect={(option) => {
            setBuyCoin(option);
            setSellCoin((prev) => {
              return option.symbol === prev?.symbol
                ? dummyCoins.find((o) => o.symbol !== option.symbol)
                : prev;
            });
          }}
          options={dummyCoins}
        />
        <div className={classes.hint}>
          The ultimate price and output is determined by the amount of tokens in
          the pool at the time of your swap.
        </div>
      </main>
      <div className={classes.sub}>
        <div className={classes.summary}>
          <div className={classes.title}>Summary</div>
          {dummyDetails.map((detail) => (
            <div className={classes.detail} key={randomID(6)}>
              {!!detail.explain && (
                <div className={classes.title + " " + classes.tooltip}>
                  <div>{detail.title}</div>
                  <div className={classes.tooltiptext}>{detail.explain}</div>
                </div>
              )}
              {!detail.explain && (
                <div className={classes.title}>{detail.title}</div>
              )}
              <div className={classes.value}>{detail.value}</div>
            </div>
          ))}
        </div>
        <div className={classes.button}>
          <Button type="submit">Swap</Button>
        </div>
      </div>
    </form>
  );
};

export default Swap;
