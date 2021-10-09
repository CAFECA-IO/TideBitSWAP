import React, { useState, useRef } from "react";

import List from "../UI/List";
import SearchInput from "../UI/SearchInput";

import classes from "./FilterList.module.css";


const FilterList = (props) => {
  const data = props.data;
  const [filteredData, setFilteredData] = useState(data);
  const [entered, setEntered] = useState("");
  const inputRef = useRef();

  const inputFilter = () =>
    data.filter((option) =>
      option[props.filterProperty]
        .toLowerCase()
        .includes(inputRef.current?.value.toLowerCase())
    );

  const changeHandler = (event) => {
    setEntered(event.target.value.replace(/[^A-Za-z]/gi, ""));
    setFilteredData(inputFilter());
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
      {!filteredData?.length && !!props.hint && (
        <div className={classes.container}>
          <div className={classes.hint}>{props.hint}</div>
        </div>
      )}
      {!!filteredData?.length && (
        <List
          className={classes.select}
          data={filteredData}
          onClick={props.onSelect}
        >
          {(option) => props.children(option, !!props.isShrink)}
        </List>
      )}
    </div>
  );
};

export default FilterList;
