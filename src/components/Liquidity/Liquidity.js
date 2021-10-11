import React, { useState, useEffect } from "react";
import classes from "./Liquidity.module.css";
import PoolOption from "../PoolOption/PoolOption";
import Button from "../UI/Button";
import { dummyPools } from "../../constant/dummy-data";
import FilterDropDown from "../UI/FilterDropDown";
import EmptyPool from "./EmptyPool";
import ActionTabBar from "./ActionTabBar";
import Summary from "./Summary";
import ProvideAmount from "./ProvideAmount";
import TakeAmount from "./TakeAmount";
import RadioOption from "./RadioOption";

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
      <main className="main">
        <ActionTabBar
          types={types}
          typeIndex={typeIndex}
          onSelect={typeChangeHandler}
        />
        {poolOptions.length === 0 && <EmptyPool typeIndex={typeIndex} />}
        {poolOptions.length !== 0 && (
          <React.Fragment>
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
            <RadioOption
              name={props.name}
              radioOption={parsedData.radioOption}
              radioIndex={radioIndex}
              onChange={radioSelectedHandler}
            />
            {typeIndex === 0 && (
              <ProvideAmount
                selectedCoin={selectedCoin}
                selectedCoinAmount={selectedCoinAmount}
                coinOptions={coinOptions}
                onChange={selectedCoinAmountChangedHandler}
              />
            )}
            {typeIndex === 1 && (
              <TakeAmount
                coinOptions={coinOptions}
                shareAmount={shareAmount}
                maxShareAmount={parsedData.maxShareAmount}
                onChange={shareAmountChangedHandler}
              />
            )}
          </React.Fragment>
        )}
      </main>
      <div className="sub">
        <Summary details={parsedData.details} />
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
