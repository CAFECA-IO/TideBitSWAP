import React, { useState, useRef } from "react";

import List from "../UI/List";
import SearchInput from "../UI/SearchInput";

import classes from "./FilterList.module.css";

const FilterList = (props) => {
  const [entered, setEntered] = useState("");
  const inputRef = useRef();

  const filteredOptions = props.data.filter((option) => {
    return (
      !inputRef.current ||
      option[props.filterProperty].toLowerCase().includes(inputRef.current.value.toLowerCase())
    );
  });

  const changeHandler = (event) => {
    setEntered(event.target.value.replace(/[^A-Za-z]/gi, ""));
  };

  return (
    <div className={classes.pannel}>
      <div className={classes["search-bar"]}>
        <SearchInput
          inputRef={inputRef}
          value={entered}
          onChange={changeHandler}
        />
      </div>
      {!filteredOptions?.length && !!props.hint && (
        <div className={classes.container}>
          <div className={classes.hint}>{props.hint}</div>
        </div>
      )}
      {!!filteredOptions?.length && (
        <List
          className={classes.select}
          data={filteredOptions}
          onClick={props.onSelect}
        >
          {(option) => props.children(option, !!props.isShrink)}
        </List>
      )}
    </div>
  );
};

export default FilterList;
