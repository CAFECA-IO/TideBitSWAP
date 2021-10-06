import React, { useState, useRef } from "react";
import CoinInput from "../CoinInput/CoinInput";
import Button from "../UI/Button";
import classes from "./Liquidity.module.css";
import { randomID } from "../../Utils/utils";
import { dummyCoins, dummyDetails } from "../../constant/dummy-data";
import PoolDropDown from "../PoolDropDown/PoolDropDown";
import RadioGroupText from "../RadioGroupText/RadioGroupText";
import { symbol } from "d3-shape";

const types = ["Provide", "Take"];

const Liquidity = (props) => {
  const [typeIndex, setTypeIndex] = useState(types[0]);
  const parseData = props.parseData(props.selected, types[typeIndex]);

  const amountRef = useRef();
  const [selectedPool, setSelectedPool] = useState(props.selected);
  const [radioIndex, setRadioIndex] = useState(0);
  const [selectedCoin, setSelectedCoin] = useState(parseData.combinations[radioIndex][0]);

  // const combinationChangeHandler = () => {
  //   selectedCoin()
  // }

  const radioSelectedHandler = (index) => {
    console.log(`selectedHandler${index}`)
    setRadioIndex(index);
  }

  const poolSelectedHandler = (pool) => {
    console.log(`poolSelectedHandler`)
    console.log(pool)
    setSelectedPool(pool);
    setSelectedCoin(props.parseData(pool, types[typeIndex]))
  }

  const submitHandler = (event) => {
    event.preventDefault();
  };

 
  return (
    <form className={classes.swap} onSubmit={submitHandler}>
      <main className={classes.main}>
        <PoolDropDown label="Select pool" selected={selectedPool} onSelect={poolSelectedHandler} />
        <RadioGroupText
          selected={radioIndex}
          onSelect={radioSelectedHandler}
          name="radio-coin-option"
          options={parseData.radioOption}
        />
        <CoinInput
          label="Coin"
          amountRef={amountRef}
          selected={selectedCoin}
          onSelect={setSelectedCoin}
          options={parseData.combinations[radioIndex]}
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

export default Liquidity;
