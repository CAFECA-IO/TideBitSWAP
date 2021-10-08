import React, { useState } from "react";
import { randomID } from "../../Utils/utils";
import classes from "./Liquidity.module.css";
import CoinInput from "../CoinInput/CoinInput";
import Button from "../UI/Button";
import PoolDropDown from "../PoolDropDown/PoolDropDown";
import RadioGroupText from "../RadioGroupText/RadioGroupText";
import { dummyPools } from "../../constant/dummy-data";
import img from "../../resource/no-product-found.png";
import InputAmount from "../UI/InputAmount";

const types = ["Provide", "Take"];

const Liquidity = (props) => {
  const [typeIndex, setTypeIndex] = useState(0);
  const [parsedData, setParsedData] = useState(
    props.parseData(props.selected, types[typeIndex])
  );

  const [selectedPool, setSelectedPool] = useState(props.selected);
  const [radioIndex, setRadioIndex] = useState(0);
  const [poolOptions, setPoolOptions] = useState(dummyPools);
  const [coinOptions, setCoinOptions] = useState(
    parsedData.combinations[radioIndex]
  );
  const [selectedCoin, setSelectedCoin] = useState(coinOptions[0]);
  const [pairCoin, setPairCoin] = useState();
  const [selectedCoinAmount, setSelectedCoinAmount] = useState("");
  const [pairCoinAmount, setPairCoinAmount] = useState("");
  const [shareAmount, setShareAmount] = useState("");

  const shareAmountChangedHandler = (amount) => {
    // get summary data (type, pool, coinOptions, selectedCoin)
    console.log(`amount:${amount}`);
    setShareAmount(amount);
  };

  const typeChangeHandler = (typeIndex) => {
    // get pools
    setTypeIndex(typeIndex);
    let pools;
    switch (typeIndex) {
      case 0:
        pools = dummyPools;
        break;
      case 1:
        // pools = [];
        pools = dummyPools.slice(1);
        break;
      default:
    }
    setShareAmount('')
    setPoolOptions(pools);
    const _selectedPool =
      pools.find((pool) => pool.name === selectedPool.name) ||
      pools[0] ||
      selectedPool;
    const _parseData = props.parseData(_selectedPool, types[typeIndex]);
    setParsedData(_parseData);
    if (selectedPool.name === _selectedPool.name) return;
    setSelectedPool(_selectedPool);
    setCoinOptions(_parseData.combinations[radioIndex]);
    setSelectedCoin(_parseData.combinations[radioIndex][0]);
  };

  const radioSelectedHandler = (index) => {
    setRadioIndex(index);
    setCoinOptions(parsedData.combinations[index]);
    setSelectedCoin(parsedData.combinations[index][0]);
  };

  const poolSelectedHandler = (pool) => {
    setSelectedPool(pool);

    const _parseData = props.parseData(pool, types[typeIndex]);
    setParsedData(_parseData);
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
      {poolOptions.length === 0 && (
        <div className={classes.container}>
          <div className={classes.image}>
            <img src={img} alt="" />
          </div>
          {typeIndex === 0 && (
            <div className={classes.hint}>No product found.</div>
          )}
          {typeIndex === 1 && (
            <div className={classes.hint}>
              You don’t have any Liquid portion to remove.
            </div>
          )}
        </div>
      )}
      {poolOptions.length !== 0 && (
        <main className={classes.main}>
          <div className={classes["tab-bar"]}>
            {types.map((type, index) => (
              <div className={classes["tab-box"]} key={index + type}>
                <input
                  className={classes.controller}
                  type="radio"
                  name="liquidity-type"
                  id={type + index}
                  checked={typeIndex === index}
                  readOnly
                />
                <label
                  htmlFor={type + index}
                  className={classes.tab}
                  onClick={() => typeChangeHandler(index)}
                >
                  {type}
                </label>
              </div>
            ))}
          </div>
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
            options={parsedData.radioOption}
          />
          {typeIndex === 0 && (
            <CoinInput
              label="Coin"
              selected={selectedCoin}
              onSelect={selectedCoinChangedHandler}
              options={coinOptions}
              value={selectedCoinAmount}
              onChange={selectedCoinAmountChangedHandler}
            />
          )}
          {typeIndex === 0 &&
            !!pairCoin &&
            radioIndex === 0 &&
            !!selectedCoinAmount &&
            selectedCoinAmount > 0 && (
              <CoinInput
                label="Coin"
                selected={pairCoin}
                value={pairCoinAmount}
                onChange={pairCoinAmountChangedHandler}
                readOnly={true}
              />
            )}
          {typeIndex === 0 && (
            <div className={classes.hint}>
              The final amount is determined by the price at the time of order.
            </div>
          )}
          {typeIndex === 1 && (
            <InputAmount
              label="ShareAmount"
              max={parsedData.maxShareAmount}
              symbol=""
              value={shareAmount}
              onChange={shareAmountChangedHandler}
            />
          )}
          {typeIndex === 1 &&
            !!shareAmount &&
            shareAmount > 0 &&
            coinOptions.map((coin) => (
              <CoinInput
                key={coin.id}
                label="Coin"
                selected={coin}
                // value={pairCoinAmount}
                // onChange={pairCoinAmountChangedHandler}
                readOnly={true}
              />
            ))}
        </main>
      )}
      <div className={classes.sub}>
        <div className={classes.summary}>
          <div className={classes.title}>Summary</div>
          {parsedData.details?.map((detail) => (
            <div
              className={
                typeIndex === 0
                  ? classes.provide + " " + classes.detail
                  : classes.detail
              }
              key={randomID(6)}
            >
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
