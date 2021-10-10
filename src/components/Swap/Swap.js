import React, { useState, useEffect } from "react";
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

  const [formIsValid, setFormIsValid] = useState(false);

  useEffect(() => {
    const identifier = setTimeout(() => {
      console.log("Checking form validity!");
      setFormIsValid(
        !!sellCoin && !!buyCoin && +sellCoinAmount > 0 && +buyCoinAmount > 0
      );
    }, 500);

    return () => {
      console.log("CLEANUP");
      clearTimeout(identifier);
    };
  }, [sellCoin, buyCoin, sellCoinAmount, buyCoinAmount]);

  const swapHandler = (event) => {
    event.preventDefault();
    console.log(`sellCoin${sellCoin.symbol + sellCoinAmount}`);
    console.log(`buyCoin${buyCoin.symbol + buyCoinAmount}`);
  };

  const sellCoinAmountChangeHandler = (amount) => {
    console.log(`sellCoinAmount: ${amount}`);
    setSellCoinAmount(amount);
  };
  const buyCoinAmountChangeHandler = (amount) => {
    console.log(`buyCoinAmount: ${amount}`);
    setBuyCoinAmount(amount);
  };

  return (
    <form className={`responsive swap`} onSubmit={swapHandler}>
      <main className="main">
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
            setSellCoinAmount((prev) =>
              prev > option?.max || 0 ? option?.max || 0 : prev
            );
          }}
          options={dummyCoins}
        />
        <div className="icon">
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
            setBuyCoinAmount((prev) =>
              prev > option?.max || 0 ? option?.max || 0 : prev
            );
          }}
          options={dummyCoins}
        />
        <div className="hint">
          The ultimate price and output is determined by the amount of tokens in
          the pool at the time of your swap.
        </div>
      </main>
      <div className="sub">
        <div className="summary">
          <div className="sub-title">Summary</div>
          {dummyDetails.map((detail) => (
            <div className="detail" key={randomID(6)}>
              {!!detail.explain && (
                <div className="tooltip">
                  <div>{detail.title}</div>
                  <div className="tooltiptext">{detail.explain}</div>
                </div>
              )}
              {!detail.explain && (
                <div className="detail-title">{detail.title}</div>
              )}
              <div className="detail-value">{detail.value}</div>
            </div>
          ))}
        </div>
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
