import React, { useRef, useReducer } from "react";

import FilterButton from "./FilterButton";
import PoolDetailTitle from "./PoolDetailTitle";
import PoolDetailOption from "./PoolDetailOption";
import SearchInput from "../UI/SearchInput";
import Button from "../UI/Button";
import { randomID } from "../../Utils/utils";
import classes from "./PoolSearchPannel.module.css";
import img from "../../resource/no-product-found.png";
import { poolTypes, sortingConditions } from "../../constant/constant";

const filterInput = (options, filterProperty, currentInputValue) => {
  return options.filter((option) =>
    option[filterProperty]
      .toLowerCase()
      .includes(currentInputValue.toLowerCase())
  );
};

const filterType = (key, options) =>
  poolTypes[key] === poolTypes.ALL
    ? options
    : options.filter((pool) => pool.poolType === poolTypes[key]);

const sorting = (key, options) => {
  switch (sortingConditions[key]) {
    case sortingConditions.YIELD:
      return options.sort(
        (a, b) => +b.yield.replace("%", "") - +a.yield.replace("%", "")
      );
    case sortingConditions.LIQUIDITY:

      return options.sort(
        (a, b) => +b.liquidity.split(" ")[0] - +a.liquidity.split(" ")[0]
      );
    case sortingConditions.VOLUME:

      return options.sort(
        (a, b) => +b.volume.split(" ")[0] - +a.volume.split(" ")[0]
      );
    default:
  }
};

const filterReducer = (prevState, action) => {
  let filteredPools,
    selectedPoolType,
    currentInputValue,
    selectedSortCondition,
    matchMyAssets;
  switch (action.type) {
    case "POOL_TYPE_UPDATE":
      selectedPoolType = action.value.selectedPoolType;
      currentInputValue = currentInputValue || prevState.currentInputValue;
      break;
    case "USER_INPUT":
      currentInputValue = action.value.currentInputValue;
      break;
    case "SORTING_CONDITION_UPDATE":
      selectedSortCondition = action.value.selectedSortCondition;
      currentInputValue = currentInputValue || prevState.currentInputValue;
      break;
    case "MATCH_CONDITION_UPDATE":
      matchMyAssets = action.value.matchMyAssets;
      currentInputValue = currentInputValue || prevState.currentInputValue;
      break;
    case "RESET":
      selectedPoolType = Object.keys(poolTypes)[0];
      currentInputValue = "";
      selectedSortCondition = Object.keys(sortingConditions)[0];
      matchMyAssets = false;
      break;
    default:
  }

  filteredPools = prevState.pools;
  selectedPoolType = selectedPoolType || prevState.selectedPoolType;
  selectedSortCondition =
    selectedSortCondition || prevState.selectedSortCondition;
  matchMyAssets = matchMyAssets || prevState.matchMyAssets;

  filteredPools = filterType(selectedPoolType, filteredPools);
  filteredPools = filterInput(
    filteredPools,
    prevState.filterProperty,
    currentInputValue
  );
  filteredPools = sorting(selectedSortCondition, filteredPools);

  return {
    pools: prevState.pools,
    filterProperty: prevState.filterProperty,
    filteredPools,
    selectedPoolType,
    currentInputValue,
    selectedSortCondition,
    matchMyAssets,
  };
};

const PoolSearchPannel = (props) => {
  const inputRef = useRef();
  const filteredPools = sorting(
    Object.keys(sortingConditions)[0],
    props.options
  );
  const [filterState, dispatchFilter] = useReducer(filterReducer, {
    pools: props.options,
    filteredPools: filteredPools,
    selectedPoolType: Object.keys(poolTypes)[0],
    filterProperty: props.filterProperty,
    currentInputValue: "",
    selectedSortCondition: Object.keys(sortingConditions)[0],
    matchMyAssets: false,
  });
  const changeHandler = (event) => {
    dispatchFilter({
      type: "USER_INPUT",
      value: {
        currentInputValue: event.target.value.replace(/[^A-Za-z]/gi, ""),
      },
    });
  };

  const handlerPoolTypeChange = (key) => {
    dispatchFilter({
      type: "POOL_TYPE_UPDATE",
      value: { selectedPoolType: key },
    });
  };

  const handlersSortConditionChange = (key) => {
    dispatchFilter({
      type: "SORTING_CONDITION_UPDATE",
      value: { selectedSortCondition: key },
    });
  };

  const handlerMatchMyAssets = (checked) => {
    dispatchFilter({
      type: "MATCH_CONDITION_UPDATE",
      value: { matchMyAssets: checked },
    });
  };

  const resetHandler = () => {
    dispatchFilter({
      type: "RESET",
      value: null,
    });
  };

  return (
    <div className={classes.pannel}>
      <div className={classes["search-bar"]}>
        <SearchInput
          inputRef={inputRef}
          value={filterState.currentInputValue}
          onChange={changeHandler}
        />
        {/* <FilterButton
          filterConditions={poolTypes}
          selectedFilter={filterState.selectedPoolType}
          onSelectFilter={handlerPoolTypeChange}
          sortingConditions={sortingConditions}
          selectedSorting={filterState.selectedSortCondition}
          onSelectSorting={handlersSortConditionChange}
          onReset={resetHandler}
          matchMyAssets={props.matchMyAssets}
          onMatch={handlerMatchMyAssets}
          onSearch={() => {}}
        /> */}
      </div>
      <PoolDetailTitle />
      <div className={classes.select}>
        {!filterState.filteredPools.length && (
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
        {!!filterState.filteredPools.length &&
          filterState.filteredPools.map((option) => (
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
