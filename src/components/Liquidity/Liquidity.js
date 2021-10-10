import React, { useState, useEffect } from "react";
import { randomID } from "../../Utils/utils";
import classes from "./Liquidity.module.css";
import CoinInput from "../CoinInput/CoinInput";
import PoolOption from "../PoolOption/PoolOption";
import Button from "../UI/Button";
import { dummyPools } from "../../constant/dummy-data";
import img from "../../resource/no-product-found.png";
import InputAmount from "../UI/InputAmount";
import FilterDropDown from "../UI/FilterDropDown";
import RadioText from "../UI/RadioText";

const types = ["Provide", "Take"];

const Liquidity = (props) => {
  const [typeIndex, setTypeIndex] = useState(0);
  const [poolOptions, setPoolOptions] = useState(dummyPools);
  const [selectedPool, setSelectedPool] = useState(props.selected);
  const [parsedData, setParsedData] = useState(
    props.parseData(selectedPool, types[typeIndex])
  );
  const [radioIndex, setRadioIndex] = useState(0);
  const [coinOptions, setCoinOptions] = useState(
    parsedData.combinations[radioIndex]
  );
  const [selectedCoin, setSelectedCoin] = useState(coinOptions[0]);
  const [selectedCoinAmount, setSelectedCoinAmount] = useState("");
  const [shareAmount, setShareAmount] = useState("");
  const [formIsValid, setFormIsValid] = useState(false);

  useEffect(() => {
    const indentifier = setTimeout(() => {
      let formIsValid = false;
      if (!!selectedPool) {
        switch (typeIndex) {
          case 0:
            formIsValid = +selectedCoinAmount > 0;
            break;
          case 1:
            formIsValid = +shareAmount > 0;
            break;
          default:
        }
      }

      setFormIsValid(formIsValid);
    }, 500);

    return () => {
      clearTimeout(indentifier);
    };
  }, [
    typeIndex,
    selectedPool,
    radioIndex,
    selectedCoin,
    selectedCoinAmount,
    shareAmount,
  ]);

  const shareAmountChangedHandler = (amount) => {
    // get summary data (type, pool, coinOptions, selectedCoin)
    console.log(`amount:${amount}`);
    setShareAmount(amount);
    setCoinOptions((prev) => prev.map((coin) => ({ ...coin, amount: 0.1 })));
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
    setPoolOptions(pools);
    const _selectedPool =
      pools.find((pool) => pool.name === selectedPool.name) ||
      pools[0] ||
      selectedPool;
    const _parseData = props.parseData(_selectedPool, types[typeIndex]);
    setParsedData(_parseData);
    if (selectedPool.name === _selectedPool.name) return;
    setShareAmount("");
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

  /**
   *
   * @param {string} amount
   */
  const selectedCoinAmountChangedHandler = (amount) => {
    // get summary data (type, pool, coinOptions, selectedCoin)
    console.log(`amount:${amount}`);
    setSelectedCoinAmount(amount);
    setCoinOptions((prev) => prev.map((coin) => ({ ...coin, amount: 0.1 })));
  };

  const submitHandler = (event) => {
    event.preventDefault();
  };

  return (
    <form className={`responsive liquidity`} onSubmit={submitHandler}>
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
        <main className="main">
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
          <FilterDropDown
            label="Select pool"
            selected={selectedPool}
            data={poolOptions}
            onSelect={poolSelectedHandler}
            filterProperty="name"
            placeholder="Select pool"
            hint="No product found."
          >
            {PoolOption}
          </FilterDropDown>
          <div className="radio-container">
            {parsedData.radioOption.map((option, index) => (
              <RadioText
                key={randomID(6)}
                name={props.name}
                checked={index === radioIndex}
                value={option}
                onChange={() => radioSelectedHandler(index)}
              />
            ))}
          </div>
          {typeIndex === 0 && (
            <CoinInput
              label="Coin"
              selected={selectedCoin}
              onSelect={() => {}}
              options={coinOptions}
              value={selectedCoinAmount}
              onChange={selectedCoinAmountChangedHandler}
            />
          )}
          {typeIndex === 0 &&
            !!selectedCoinAmount &&
            selectedCoinAmount > 0 &&
            coinOptions
              .filter((coin) => coin.symbol !== selectedCoin.symbol)
              .map((coin) => (
                <CoinInput
                  key={coin.id}
                  label="Coin"
                  selected={coin}
                  value={coin.amount}
                  readOnly={true}
                />
              ))}
          {typeIndex === 0 && (
            <div className="hint">
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
                value={coin.amount}
                readOnly={true}
              />
            ))}
        </main>
      )}
      <div className="sub">
        <div className="summary">
          <div className="sub-title">Summary</div>
          {parsedData.details?.map((detail) => (
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
            Add
          </Button>
        </div>
      </div>
    </form>
  );
};

export default Liquidity;
