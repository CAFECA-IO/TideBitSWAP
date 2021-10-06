import React, { useState, useRef } from "react";

import { randomID } from "../../Utils/utils";
import CoinOption from "../CoinOption/CoinOption";
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
    setEntered(event.target.value.replace(/[^A-Za-z]/gi, ""));
  };


  return (
    <div className={classes.pannel}>
      <div className={classes["input"]}>
        <div className={classes["search-icon"]}>
          <div className={classes["search-icon__circle"]}></div>
          <div className={classes["search-icon__rectangle"]}></div>
        </div>
        <input
          id={randomID(6)}
          type="text"
          placeholder="Search"
          ref={inputRef}
          value={entered}
          onChange={changeHandler}
        />
      </div>
      <div
        className={
          classes.select + (props.isShrink ? " " + classes.shrink : "")
        }
      >
        {filteredOptions.map((option) => (
          <CoinOption
            key={props.name + "-" + randomID(6)}
            name={option.name}
            iconSrc={option.iconSrc}
            symbol={option.symbol}
            onSelect={() => props.onSelected(option)}
          />
        ))}
      </div>
    </div>
  );
};

export default CoinSearchPannel;
