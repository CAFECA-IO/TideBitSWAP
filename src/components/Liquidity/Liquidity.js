import React, { useState } from "react";
import { randomID } from "../../Utils/utils";
import classes from "./Liquidity.module.css";
import CoinInput from "../CoinInput/CoinInput";
import Button from "../UI/Button";
import PoolDropDown from "../PoolDropDown/PoolDropDown";
import RadioGroupText from "../RadioGroupText/RadioGroupText";
import { dummyPools } from "../../constant/dummy-data";

const types = ["Provide", "Take"];

const Liquidity = (props) => {
  const [typeIndex, setTypeIndex] = useState(0);
  const [parseData, setParseData] = useState(
    props.parseData(props.selected, types[typeIndex])
  );

  const [selectedPool, setSelectedPool] = useState(props.selected);
  const [radioIndex, setRadioIndex] = useState(0);
  const [poolOptions, setPoolOptions] = useState(dummyPools);
  const [coinOptions, setCoinOptions] = useState(
    parseData.combinations[radioIndex]
  );
  const [selectedCoin, setSelectedCoin] = useState(coinOptions[0]);
  const [pairCoin, setPairCoin] = useState();
  const [selectedCoinAmount, setSelectedCoinAmount] = useState("");
  const [pairCoinAmount, setPairCoinAmount] = useState("");

  const typeChangeHandler = (typeIndex) => {
    // get pools
    setTypeIndex(typeIndex);
    switch (typeIndex) {
      case 0:
        return dummyPools;
      case 1:
        return [];
      default:
    }
  };

  const radioSelectedHandler = (index) => {
    setRadioIndex(index);
    setCoinOptions(parseData.combinations[index]);
    setSelectedCoin(parseData.combinations[index][0]);
  };

  const poolSelectedHandler = (pool) => {
    setSelectedPool(pool);

    const _parseData = props.parseData(pool, types[typeIndex]);
    setParseData(_parseData);
    setCoinOptions(_parseData.combinations[radioIndex]);
    setSelectedCoin(_parseData.combinations[radioIndex][0]);
  };

  const selectedCoinChangedHandler = (selected) => {
    setSelectedCoin(selected);
    const pairCoin = coinOptions
      .filter((option) => option.symbol !== selected.symbol)
      .shift();

    setPairCoin(pairCoin);
    setPairCoinAmount(`${pairCoin.max}`);
  };

  /**
   *
   * @param {string} amount
   */
  const selectedCoinAmountChangedHandler = (amount) => {
    // get summary data (type, pool, coinOptions, selectedCoin)
    console.log(`amount:${amount}`);
    setSelectedCoinAmount(amount);
    const pairCoin = coinOptions
      .filter((option) => option.symbol !== selectedCoin.symbol)
      .shift();

    setPairCoin(pairCoin);
    setPairCoinAmount(`${pairCoin.max}`);
  };
  const pairCoinAmountChangedHandler = (amount) => {
    // get summary data (type, pool, coinOptions, selectedCoin)
    console.log(`amount:${amount}`);
    setSelectedCoinAmount(amount);
  };

  const submitHandler = (event) => {
    event.preventDefault();
  };

  return (
    <form className={classes.liquidity} onSubmit={submitHandler}>
      <main className={classes.main}>
        <PoolDropDown
          label="Select pool"
          selected={selectedPool}
          onSelect={poolSelectedHandler}
          options={poolOptions}
        />
        <RadioGroupText
          selected={radioIndex}
          onSelect={radioSelectedHandler}
          name="radio-coin-option"
          options={parseData.radioOption}
        />
        <CoinInput
          label="Coin"
          selected={selectedCoin}
          onSelect={selectedCoinChangedHandler}
          options={coinOptions}
          value={selectedCoinAmount}
          onChange={selectedCoinAmountChangedHandler}
        />
        {!!pairCoin &&
          radioIndex === 0 &&
          !!selectedCoinAmount &&
          parseFloat(selectedCoinAmount) > 0 && (
            <CoinInput
              label="Coin"
              selected={pairCoin}
              value={pairCoinAmount}
              onChange={pairCoinAmountChangedHandler}
              readOnly={true}
            />
          )}
        <div className={classes.hint}>
          The final amount is determined by the price at the time of order.
        </div>
      </main>
      <div className={classes.sub}>
        <div className={classes.summary}>
          <div className={classes.title}>Summary</div>
          {parseData.details?.map((detail) => (
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
          <Button type="submit">Add</Button>
        </div>
      </div>
    </form>
  );
};

export default Liquidity;
