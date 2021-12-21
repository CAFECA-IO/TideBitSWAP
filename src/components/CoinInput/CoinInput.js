import React, { useRef, useState } from "react";
import { useEffect } from "react/cjs/react.development";
import SafeMath from "../../Utils/safe-math";
import { formateDecimal, randomID } from "../../Utils/utils";
import CoinDialog from "../CoinDialog/CoinDialog";
import classes from "./CoinInput.module.css";

const CoinInput = (props) => {
  const coinDialogRef = useRef();
  // const [timer, setTimer] = useState(null);
  const isValid =
    props.removeDetail ||
    !(!!props.readOnly && +props.value > +props.selected?.balanceOf);
  const message = isValid ? "" : "Insufficient amount";

  const changeHandler = (event) => {
    console.log(`onIput`, event.target.value);
    let amount = +event.target.value < 0 ? "0" : event.target.value;
    props.onChange(+amount);
    // setTimer((prev) => {
    //   if (prev) clearTimeout(prev);
    //   if (timer) clearTimeout(timer);
    //   return setTimeout(() => {
    //     amount = parseFloat(amount);
    //     props.onChange(+amount);
    //   }, 500);
    // });
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
          readOnly={!!props.readOnly}
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
