import React, { useState, useRef } from "react";

import List from "../UI/List";
import SearchInput from "../UI/SearchInput";

import classes from "./PoolSortingPannel.module.css";
import img from "../../resource/no-product-found.png";
import { poolTypes, sortingConditions } from "../../constant/dummy-data";
import PoolDetailTitle from "../PoolDetailTitle/PoolDetailTitle";
import Button from "../UI/Button";
import FilterButton from "../UI/FilterButton";

const PoolSortingPannel = (props) => {
  const inputRef = useRef();
  const originalData = props.data;
  const [modifiedData, setModifiedData] = useState(originalData);
  const [entered, setEntered] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(poolTypes[0]);
  const [selectedSorting, setSelectedSorting] = useState(sortingConditions[0]);

  const inputFilter = (data) =>
    data.filter((option) =>
    !inputRef.current ||  option[props.filterProperty]
        .toLowerCase()
        .includes(inputRef.current?.value.toLowerCase())
    );

  const updateData = () => {
    let _data = inputFilter(originalData);
    // filter by type
    // sort by condition
    setModifiedData(_data);
  };

  const filterChangeHandler = (filter) => {
    setSelectedFilter(filter);
    updateData();
  };
  const sortingChangeHandler = (sorting) => {
    setSelectedSorting(sorting);
    updateData();
  };
  const checkedMatchChangeHandler = (checked) => {
    props.onMatch(checked); //??
    // updateData();
  };

  const changeHandler = (event) => {
    setEntered(event.target.value.replace(/[^A-Za-z]/gi, ""));
    updateData();
  };

  const searchHandler = () => {};

  const resetHandler = () => {
    props.onMatch(false); //??
    setSelectedFilter(poolTypes[0]);
    setSelectedSorting(sortingConditions[0]);
    updateData();
  };

  return (
    <div className={classes.pannel}>
      <div className={classes["search-bar"]}>
        <SearchInput
          inputRef={inputRef}
          value={entered}
          onChange={changeHandler}
        />
        <FilterButton
          filterConditions={Object.values(poolTypes)}
          selectedFilter={selectedFilter}
          onSelectFilter={filterChangeHandler}
          sortingConditions={Object.values(sortingConditions)}
          selectedSorting={selectedSorting}
          onSelectSorting={sortingChangeHandler}
          matchMyAssets={props.matchMyAssets}
          onMatch={checkedMatchChangeHandler}
          onSearch={searchHandler}
          onReset={resetHandler}
        />
      </div>
      <PoolDetailTitle />
      {!modifiedData?.length && (
        <div className={classes.container}>
          <div className={classes.hint}>{props.hint}</div>
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
      {!!modifiedData?.length && (
        <List
          className={classes.select}
          data={modifiedData}
          onClick={props.onSelect}
        >
          {(option) => props.children(option)}
        </List>
      )}
    </div>
  );
};

export default PoolSortingPannel;
