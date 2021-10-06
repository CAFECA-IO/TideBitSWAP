import React, { useState } from "react";
import CoinDropDown from "../CoinDropDown/CoinDropDown";
import InputAmount from "../UI/InputAmount";
import classes from "./CoinInput.module.css";

const CoinInput = (props) => {
  const selectedHandler = (option) => {
    props.onSelect(option);
  };

  return (
    <div className={classes["coin-input"]}>
      <CoinDropDown
        label={props.label}
        isShrink={true}
        selected={props.selected}
        onSelect={selectedHandler}
        options={props.options}
      />
      <InputAmount
        label="Amount"
        max={props.selected?.max||0}
        symbol={props.selected?.symbol || ""}
        amountRef={props.amountRef}
      />
    </div>
  );
};

export default CoinInput;
