import React, { useRef } from "react";
import CoinDialog from "../CoinDialog/CoinDialog";
// import CoinDropDown from "../CoinDropDown/CoinDropDown";
// import CoinOption from "../CoinOption/CoinOption";
// import FilterDropDown from "../UI/FilterDropDown";
import InputAmount from "../UI/InputAmount";
import classes from "./CoinInput.module.css";

const CoinInput = (props) => {
  const coinDialogRef = useRef();
  const isValid =
    props.removeDetail ||
    !(!!props.readOnly && +props.value > +props.selected?.balanceOf);
  const message = isValid ? "" : "Insufficient amount";
  return (
    <div className={classes["coin-input"]}>
      {/* <CoinDropDown
        label={props.label}
        isShrink={true}
        selected={props.selected}
        onSelect={props.onSelect}
        options={props.options}
      /> */}
      <CoinDialog
        ref={coinDialogRef}
        options={props.options}
        selectedCoin={props.selected}
        onSelect={props.onSelect}
        isShrink={true}
      />
      <InputAmount
        label="Amount"
        max={props.selected?.balanceOf || 0}
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
