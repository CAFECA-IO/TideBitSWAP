import React, { useState, useRef, useEffect } from "react";

import List from "../UI/List";
import SearchInput from "../UI/SearchInput";
import FilterButton from "./FilterButton";

import classes from "./FilterList.module.css";

const FilterList = (props) => {
  const [entered, setEntered] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(props.data);

  useEffect(() => {
    setFilteredOptions(props.data);
    return () => {};
  }, [props.data]);

  const inputRef = useRef();

  const changeHandler = async (event) => {
    setEntered(event.target.value.replace(/[^0-9A-Za-z]/gi, ""));
    if (/^0x[a-fA-F0-9]{40}$/.test(event.target.value)) {
      const option = await props.onSearch(event.target.value);
      console.log(`searchToken`, option);
      if (option) {
        setFilteredOptions([option]);
      }
    } else {
      setFilteredOptions(
        props.data.filter(
          (option) =>
            !inputRef.current ||
            option[props.filterProperty]
              .toLowerCase()
              .includes(inputRef.current.value.toLowerCase())
        )
      );
    }
  };

  return (
    <div className={`${classes.pannel} ${classes[props.className]}`}>
      <div className={classes["search-bar"]}>
        <SearchInput
          inputRef={inputRef}
          value={entered}
          onChange={changeHandler}
          placeholder="Search"
        />
        {props.displayFilterButton && (
          <FilterButton
            filterConditions={props.filterConditions}
            selectedFilter={props.selectedFilterConditions}
            onSelectFilter={props.handleFilterConditionsChange}
            sortingConditions={props.sortingConditions}
            selectedSorting={props.selectedSortCondition}
            onSelectSorting={props.handleSortConditionChange}
            onReset={props.resetHandler}
            matchMyAssets={props.matchMyAssets}
            onMatch={props.handleMatchMyAssets}
            onSearch={() => {}}
          />
        )}
      </div>
      {props.header && <div className={classes.header}>{props.header}</div>}
      {!filteredOptions?.length && !!props.hint && (
        <div className={classes["hint-container"]}>
          <div className={classes.hint}>{props.hint}</div>
        </div>
      )}
      <div className={classes.container}>
        {props.titleBar && props.titleBar()}
        <div className={classes.content}>
          {!!filteredOptions?.length && (
            <List
              className={classes.select}
              data={filteredOptions}
              onClick={props.onSelect}
              isLoading={props.isLoading}
            >
              {(option) => props.children(option, !!props.isShrink)}
            </List>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterList;
