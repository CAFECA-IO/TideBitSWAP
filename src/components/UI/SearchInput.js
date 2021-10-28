import React from "react";
import classes from "./SearchInput.module.css";
import { randomID } from "../../Utils/utils";

const SearchInput = (props) => {
  return (
    <div className={classes["input"]}>
      <div className={classes["search-icon"]}>
        <div className={classes["search-icon__circle"]}></div>
        <div className={classes["search-icon__rectangle"]}></div>
      </div>
      <input
        id={randomID(6)}
        type="text"
        placeholder={props.placeholder}
        ref={props.inputRef}
        value={props.value}
        onChange={props.onChange}
      />
    </div>
  );
};

export default SearchInput;