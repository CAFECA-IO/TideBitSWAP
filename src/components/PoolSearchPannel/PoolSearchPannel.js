import React, { useState, useRef } from "react";

import FilterButton from "./FilterButton";
import PoolDetailTitle from "./PoolDetailTitle";
import PoolDetailOption from "./PoolDetailOption";
import SearchInput from "../UI/SearchInput";
import Button from "../UI/Button";
import { randomID } from "../../Utils/utils";
import classes from "./PoolSearchPannel.module.css";
import { poolTypes, sortingConditions } from "../../constant/dummy-data";
import img from "../../resource/no-product-found.png";

const PoolSearchPannel = (props) => {
  const inputRef = useRef();
  const pools = props.options;
  const [entered, setEntered] = useState("");
  const [filteredPools, setFilteredOptions] = useState(pools);
  const [selectedPoolType, setSelectedPoolType] = useState(
    Object.keys(poolTypes)[0]
  );
  const [selectedSortCondition, setSelectedSortCondition] = useState(
    Object.keys(sortingConditions)[0]
  );

  const filterInput = (options) =>
    options.filter((option) =>
      option[props.filterProperty]
        .toLowerCase()
        .includes(inputRef.current?.value.toLowerCase())
    );

  const filterType = (key, options) =>
    poolTypes[key] === poolTypes.ALL
      ? options
      : options.filter((pool) => pool.poolType === poolTypes[key]);

  const sorting = (key, options) => {
    switch (sortingConditions[key]) {
      case sortingConditions.YIELD:
        return options.sort();
      case sortingConditions.LIQUIDITY:
        return options.sort();
      case sortingConditions.VOLUME:
        return options.sort();
      default:
    }
  };

  const onUpdatePools = () => {
    setFilteredOptions(pools);
    console.log("-----------START---------");
    console.log(filteredPools);
    if (poolTypes[selectedPoolType] !== poolTypes.ALL) {
      setFilteredOptions((prev) => filterType(selectedPoolType, prev));
    }
    console.log(filteredPools);

    setFilteredOptions((prev) => filterInput(prev));
    console.log(filteredPools);

    setFilteredOptions((prev) => sorting(selectedSortCondition, prev));
    console.log("-----------END---------");
    // let updatePools = pools;
    // console.log(pools);
    // if (poolTypes[selectedPoolType] !== poolTypes.ALL) {
    //   updatePools = filterType(selectedPoolType, updatePools);
    // }

    // updatePools = filterInput(updatePools);
    // console.log(pools);

    // updatePools = sorting(selectedSortCondition, updatePools);
    // setFilteredOptions(updatePools);
  };

  const changeHandler = (event) => {
    setEntered(event.target.value.replace(/[^A-Za-z]/gi, ""));
    onUpdatePools();
  };

  const handlerPoolTypeChange = (key) => {
    setSelectedPoolType(key);
    onUpdatePools();
  };

  const handlersSortConditionChange = (key) => {
    setSelectedSortCondition(key);
    onUpdatePools();
  };

  const matchHandler = (checked) => {
    props.onMatch(checked);
    onUpdatePools();
  };

  const resetHandler = () => {
    matchHandler(false);
    setSelectedPoolType(Object.keys(poolTypes)[0]);
    setSelectedSortCondition(Object.keys(sortingConditions)[0]);
    setEntered();
    setFilteredOptions(pools);
  };

  return (
    <div className={classes.pannel}>
      <div className={classes["search-bar"]}>
        <SearchInput
          inputRef={inputRef}
          entered={entered}
          onChange={changeHandler}
        />
        <FilterButton
          filterConditions={poolTypes}
          selectedFilter={selectedPoolType}
          onSelectFilter={handlerPoolTypeChange}
          sortingConditions={sortingConditions}
          selectedSorting={selectedSortCondition}
          onSelectSorting={handlersSortConditionChange}
          onReset={resetHandler}
          matchMyAssets={props.matchMyAssets}
          onMatch={matchHandler}
          onSearch={() => {}}
        />
      </div>
      <PoolDetailTitle />
      <div className={classes.select}>
        {!filteredPools.length && (
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
        {!!filteredPools.length &&
          filteredPools.map((option) => (
            <PoolDetailOption
              data={option}
              onClick={() => props.onClick(option)}
              key={randomID(6)}
            />
          ))}
      </div>
    </div>
  );
};

export default PoolSearchPannel;
