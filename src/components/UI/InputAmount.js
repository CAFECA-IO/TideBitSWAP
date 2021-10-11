import React, { useState } from "react";
import { randomID } from "../../Utils/utils";

import classes from "./InputAmount.module.css";

const InputAmount = (props) => {
  const id = randomID(6);
  const max = +props.max;
  const [reachMax, setReachMax] = useState(false);

  const changeHandler = (event) => {
    let amount = event.target.value;
    const test = /^(([1-9]\d*)|([0]{1}))(\.\d+)?$/.test(amount);
    if (!test) amount = amount.substring(0, amount.length - 1);

    if (amount >= max) {
      amount = max;
      setReachMax(true);
    } else setReachMax(false);

    props.onChange(amount);
  };

  return (
    <div className={`${classes.input} ${props.error ? classes.error : ""}`}>
      <label htmlFor={id} className={classes.label}>
        {props.label}
      </label>
      <div className={classes["input-controller"]}>
        <input
          id={id}
          type="number"
          min="0"
          step="0.01"
          max={max}
          value={props.value}
          onKeyPress={(evt) => {
            if (evt.which === 46) return;
            if (evt.which < 48 || evt.which > 57) {
              evt.preventDefault();
            }
          }}
          onChange={changeHandler}
          readOnly={!!props.readOnly}
        />
        <div
          className={
            classes["input-hint"] + (reachMax ? " " + classes.show : "")
          }
        >
          MAX
        </div>
      </div>
      <div className={classes.detail}>
        <div>Available:</div>
        <div className={classes["input-maximum"]}>{max}</div>
        {props.symbol && (
          <div className={classes["symbol"]}>{props.symbol}</div>
        )}
      </div>
    </div>
  );
};

export default InputAmount;
