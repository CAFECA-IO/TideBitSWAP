import React, { useState, useRef } from "react";

import SearchInput from "../UI/SearchInput";
import classes from "./PoolSearchPannel.module.css";

import img from "../../resource/no-product-found.png";
import Button from "../UI/Button";
import PoolDetailOption from "../PoolDetailOption/PoolDetailOption";
import PoolOption from "../PoolOption/PoolOption";
import { poolTypes, sortingConditions } from "../../constant/dummy-data";
import FilterButton from "../UI/FilterButton";
import PoolDetailTitle from "../PoolDetailTitle/PoolDetailTitle";

const PoolSearchPannel = (props) => {
  const inputRef = useRef();
  const poolOptions = props.options;
  const [filteredPools, setFilteredOptions] = useState(poolOptions);
  const [entered, setEntered] = useState("");
  const [selectedPoolType, setSelectedPoolType] = useState(
    Object.keys(poolTypes)[0]
  );
  const [selectedSortCondition, setSelectedSortCondition] = useState(
    Object.keys(sortingConditions)[0]
  );

  const changeHandler = (event) => {
    setEntered(event.target.value.replace(/[^A-Za-z]/gi, ""));
    setFilteredOptions(inputFilter(poolOptions));
  };

  const inputFilter = (options) =>
    options.filter((option) => {
      return (
        !inputRef.current ||
        option.name
          .toLowerCase()
          .includes(inputRef.current?.value.toLowerCase())
      );
    });

  const resetHandler = () => {
    setFilteredOptions(inputFilter(poolOptions));
  };

  const matchHandler = (checked) => {
    props.onMatch(checked);
  };

  const handlerPoolTypeChange = (key) => {
    resetHandler();
    setSelectedPoolType(key);
    handlersSortConditionChange(selectedSortCondition, poolOptions);
    if (poolTypes[key] === poolTypes.ALL) {
      return;
    }
    setFilteredOptions((prev) =>
      prev.filter((pool) => pool.poolType === poolTypes[key])
    );
  };

  const handlersSortConditionChange = (key) => {
    setSelectedSortCondition(key);
    if (sortingConditions[key] === sortingConditions.YIELD) {
      setFilteredOptions((prev) => prev.sort());
    } else if (sortingConditions[key] === sortingConditions.LIQUIDITY) {
      setFilteredOptions((prev) => prev.sort());
    } else if (sortingConditions[key] === sortingConditions.VOLUME) {
      setFilteredOptions((prev) => prev.sort());
    }
  };

  return (
    <div
      className={
        props.isDetail ? classes.pannel + " " + classes.detail : classes.pannel
      }
    >
      {props.isDetail ? (
        <div className={classes["search-bar"]}>
          <SearchInput
            inputRef={inputRef}
            entered={entered}
            onChange={changeHandler}
          />
          <FilterButton
            filterConditions={Object.keys(poolTypes)}
            selectedFilter={selectedPoolType}
            onSelectFilter={handlerPoolTypeChange}
            sortingConditions={Object.keys(sortingConditions)}
            selectedSorting={selectedSortCondition}
            onSelectSorting={handlersSortConditionChange}
            onReset={resetHandler}
            matchMyAssets={props.matchMyAssets}
            onMatch={matchHandler}
            onSearch={() => {}}
          />
        </div>
      ) : (
        <SearchInput
          inputRef={inputRef}
          entered={entered}
          onChange={changeHandler}
        />
      )}
      {!!props.displayTitle && <PoolDetailTitle />}
      <div className={classes.select}>
        {!filteredPools.length && !!props.onCreate && (
          <div className={classes.container}>
            <div className={classes.hint}>No product found. Create one!</div>
            <div className={classes.image}>
              <img src={img} alt="" />
            </div>
            <div className={classes.button}>
              <Button type="button" onClick={props.onCreate}>
                Create
              </Button>
            </div>
          </div>
        )}
        {!filteredPools.length && !props.onCreate && (
          <div className={classes.container}>
            <div className={classes.hint}>No product found.</div>
          </div>
        )}
        {!!filteredPools.length &&
          filteredPools.map((option) =>
            props.isDetail ? (
              <PoolDetailOption
                id={option.id}
                key={option.id}
                name={option.name}
                iconSrcs={option.iconSrcs}
                liquidity={option.liquidity}
                composition={option.composition}
                yield={option.yield}
                rewardIconSrc={option.rewardIconSrc}
                rewardCoinSymbol={option.rewardCoinSymbol}
                volume={option.volume}
                onSelect={() => props.onSelect(option)}
              />
            ) : (
              <PoolOption
                id={option.id}
                key={option.id}
                name={option.name}
                iconSrcs={option.iconSrcs}
                onSelect={() => props.onSelect(option)}
              />
            )
          )}
      </div>
    </div>
  );
};

export default PoolSearchPannel;
