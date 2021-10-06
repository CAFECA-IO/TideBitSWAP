import React, { useRef } from "react";

import { randomID } from "../../Utils/utils";
import classes from "./SearchPannel.module.css";

/**
 * 
 * type? coin/pool
 * shrink size?
 * with filter?
 * 
 */



const SearchPannel = (props) => {
  const inputRef = useRef();

  const filterOptions = props.options?.filter((option) => {
    return option.toLowerCase().includes(inputRef.current.value.toLowerCase());
    // option.toLowerCase().search(inputRef.current.value.toLowerCase()) !== -1
  });

  const dropdownChangeHandler = (event) => {
    props.onChangeFilter(event.target.value);
  };

  return (
    <div className={classes.pannel}>
      <input id={randomID(6)} type="text" />
      <select value={props.selected} onChange={dropdownChangeHandler}>
          <option value='2022'>2022</option>
          <option value='2021'>2021</option>
          <option value='2020'>2020</option>
          <option value='2019'>2019</option>
        </select>
    </div>
  );
};

export default SearchPannel;
