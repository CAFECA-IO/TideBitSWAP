import React from "react";
import CoinOption from "../CoinOption/CoinOption";
import FilterDropDown from "../UI/FilterDropDown";
import InputAmount from "../UI/InputAmount";
import classes from "./CoinInput.module.css";

const CoinInput = (props) => {
  return (
    <div className={classes["coin-input"]}>
      <FilterDropDown
        label={props.label}
        data={props.options}
        selected={props.selected}
        onSelect={props.onSelect}
        filterProperty="symbol"
        placeholder="Select Coin"
      >
        {(data) => CoinOption(data, true)}
      </FilterDropDown>
      <InputAmount
        label="Amount"
        max={props.selected?.max || 0}
        symbol={props.selected?.symbol || ""}
        value={props.value}
        onChange={props.onChange}
        readOnly={props.readOnly}
      />
    </div>
  );
};

export default CoinInput;
