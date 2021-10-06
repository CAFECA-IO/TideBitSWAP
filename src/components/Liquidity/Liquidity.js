import React, { useState, useRef } from "react";
import CoinInput from "../CoinInput/CoinInput";
import Button from "../UI/Button";
import classes from "./Liquidity.module.css";
import { randomID } from "../../Utils/utils";
import { dummyCoins, dummyDetails } from "../../constant/dummy-data";
// import PoolDropDown from "../PoolDropDown/PoolDropDown";
import RadioGroupText from "../RadioGroupText/RadioGroupText";
import { symbol } from "d3-shape";

const types = ["Provide", "Take"];

const Liquidity = (props) => {
  const [selectedPool, setSelectedPool] = useState(props.selected);
  const [typeIndex, setTypeIndex] = useState(types[0]);
  const [radioIndex, setRadioIndex] = useState(0);
  // const [selectedCoin, setSelectedCoin] = useState();

  // const combinationChangeHandler = () => {
  //   selectedCoin()
  // }

  const submitHandler = (event) => {
    event.preventDefault();
  };
  const parseData = props.parseData(props.selected, types[typeIndex]);

  return (
    <form className={classes.swap} onSubmit={submitHandler}>
      <main className={classes.main}>
        {/* <PoolDropDown label="Select pool" selected={selectedPool} onSelect={setSelectedPool} /> */}
        <RadioGroupText
          selected={radioIndex}
          onSelect={setRadioIndex}
          name="radio-coin-option"
          options={parseData.radioOption}
        />
        {/* <CoinInput
          label="Amount"
          amountRef={coin2AmountRef}
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
        /> */}
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

export default Liquidity;
