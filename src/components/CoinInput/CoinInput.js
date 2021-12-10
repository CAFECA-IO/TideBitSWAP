import React, { useRef } from "react";
import SafeMath from "../../Utils/safe-math";
import { formateDecimal, randomID } from "../../Utils/utils";
import CoinDialog from "../CoinDialog/CoinDialog";
import classes from "./CoinInput.module.css";

const CoinInput = (props) => {
  const coinDialogRef = useRef();
  const isValid =
    props.removeDetail ||
    !(!!props.readOnly && +props.value > +props.selected?.balanceOf);
  const message = isValid ? "" : "Insufficient amount";
  const changeHandler = (event) => {
    console.log(`onIput`, event.target.value);
    let value = event.target.value
      ? parseFloat(event.target.value).toString()
      : "0";

    if (!SafeMath.gt(value, "0")) value = "0";
    props.onChange(value);
  };
  return (
    <div className={classes["coin-input"]}>
      {/* <CoinDropDown
        label={props.label}
        isShrink={true}
        selected={props.selected}
        onSelect={props.onSelect}
        options={props.options}
      /> */}
      <div className={classes.container}>
        <CoinDialog
          className="coin-input"
          ref={coinDialogRef}
          options={props.options}
          selectedCoin={props.selected}
          onSelect={props.onSelect}
          isShrink={true}
        />
        <div className={classes["input-controller"]}>
          <input
            id={randomID(6)}
            type="number"
            value={props.value}
            onInput={changeHandler}
            readOnly={!!props.readOnly}
            placeholder="0.0"
          />
        </div>
      </div>
      <div className={classes.detail}>
        <div>Balance:</div>
        <div className={classes["input-maximum"]}>
          {formateDecimal(`${props.selected?.balanceOf || 0}`, 14)}
        </div>
        <div className={classes["symbol"]}>{props.selected?.symbol || ""}</div>
        <div
          className={
            classes["input-hint"] +
            (props.value !== "" &&
            props.selected &&
            SafeMath.gt(props.value, props.selected?.balanceOf)
              ? " " + classes.show
              : "")
          }
        >
          (MAX)
        </div>
      </div>
      <div className={classes.message}>
        <div>{message}</div>
      </div>
    </div>
  );
};

export default CoinInput;
