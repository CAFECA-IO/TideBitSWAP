import React, { useState, useRef } from "react";

import { randomID } from "../../Utils/utils";
import CoinOption from "../CoinOption/CoinOption";
import SearchInput from "../UI/SearchInput";
import classes from "./CoinSearchPannel.module.css";

const CoinSearchPannel = (props) => {
  const inputRef = useRef();
  const [entered, setEntered] = useState("");

  const filteredOptions = props.options.filter((option) => {
    return (
      !inputRef.current ||
      option.symbol.toLowerCase().includes(inputRef.current.value.toLowerCase())
    );
  });

  const changeHandler = (event) => {
    setEntered(event.target.value.replace(/[^0-9A-Za-z]/gi, ""));
  };

  return (
    <div className={classes.pannel}>
      <SearchInput
        inputRef={inputRef}
        value={entered}
        onChange={changeHandler}
        placeholder="Search or Paste address"
      />
      <div
        className={
          props.isShrink
            ? classes.select + " " + classes.shrink
            : classes.select
        }
      >
        {filteredOptions.map((option) => (
          <CoinOption
            key={props.name + "-" + randomID(6)}
            name={option.name}
            iconSrc={option.iconSrc}
            symbol={option.symbol}
            onSelect={() => props.onSelect(option)}
          />
        ))}
      </div>
    </div>
  );
};

export default CoinSearchPannel;
