import React, { useState, useRef } from "react";

import SearchInput from "../UI/SearchInput";
import classes from "./PoolSearchPannel.module.css";
import PoolTitle from "./PoolTitle";
import img from "../../resource/no-product-found.png";
import Button from "../UI/Button";
import PoolOptionDetail from "../PoolOptionDetail/PoolOptionDetail";
import PoolOption from "../PoolOption/PoolOption";
import FilterDialog from "../FilterDialog/FilterDialog";
import { poolTypes, sortConditions } from "../../constant/dummy-data";

const PoolSearchPannel = (props) => {
  const inputRef = useRef();
  const poolOptions = props.options;
  const [filteredPools, setFilteredOptions] = useState(poolOptions);
  const [entered, setEntered] = useState("");
  const [selectedPoolType, setSelectedPoolType] = useState(poolTypes[0]);
  const [selectedSortCondition, setSelectedSortCondition] = useState(
    sortConditions[0]
  );

  const changeHandler = (event) => {
    setEntered(event.target.value.replace(/[^A-Za-z]/gi, ""));
    setFilteredOptions((filteredPools) => inputFilter(filteredPools));
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

  const matchHandler = () => {};

  const handlerPoolTypeChange = (option) => {
    setSelectedPoolType(option);
    if (option.includes("All")) {
      handlersSortConditionChange(selectedSortCondition, poolOptions);
      return;
    }
    setFilteredOptions((prev) =>
      prev.filter((pool) => option.includes(pool.poolType))
    );
  };

  const handlersSortConditionChange = (option, options) => {
    setSelectedSortCondition(option);
    if (option.includes("")) {
      setFilteredOptions(prev=>(!!options ? options : prev).sort());
    } else if (option.includes("")) {
       setFilteredOptions(prev=>(!!options ? options : prev).sort());
    } else if (option.includes("")) {
       setFilteredOptions(prev=>(!!options ? options : prev).sort());
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
          <FilterDialog
            poolTypes={poolTypes}
            selectedType={selectedPoolType}
            onSelectType={handlerPoolTypeChange}
            sortConditions={sortConditions}
            selectedCondition={selectedSortCondition}
            onSelectCondition={handlersSortConditionChange}
            onReset={resetHandler}
            onMatch={matchHandler}
          />
        </div>
      ) : (
        <SearchInput
          inputRef={inputRef}
          entered={entered}
          onChange={changeHandler}
        />
      )}
      {!!props.displayTitle && <PoolTitle />}
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
              <PoolOptionDetail
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
