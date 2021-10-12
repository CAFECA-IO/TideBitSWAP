import React from "react";
import CoinDropDown from "../CoinDropDown/CoinDropDown";
// import CoinOption from "../CoinOption/CoinOption";
// import FilterDropDown from "../UI/FilterDropDown";
import InputAmount from "../UI/InputAmount";
import classes from "./CoinInput.module.css";

const CoinInput = (props) => {
  const isValid =
    props.removeDetail ||
    !(!!props.readOnly && +props.value > +props.selected?.max);
  const message = isValid ? "" : "Insufficient amount";
  return (
    <div className={classes["coin-input"]}>
      <CoinDropDown
        label={props.label}
        isShrink={true}
        selected={props.selected}
        onSelect={props.onSelect}
        options={props.options}
      />
      <InputAmount
        label="Amount"
        max={props.selected?.max || 0}
        symbol={props.selected?.symbol || ""}
        value={props.value}
        onChange={props.onChange}
        readOnly={props.readOnly}
        isValid={isValid}
        message={message}
        removeDetail={props.removeDetail}
      />
    </div>
  );
};

export default CoinInput;
