import React, { useState } from "react";
import { randomID } from "../../Utils/utils";

import classes from "./InputAmount.module.css";

const InputAmount = (props) => {
  const id = randomID(6);
  const max = props.max;
  const [enteredAmount, setEnteredAmount] = useState(props.value);
  const [reachMax, setReachMax] = useState(false);

  const amountChangeHandler = (event) => {
    const test = /^(([1-9]\d*)|([0]{1}))(\.\d+)?$/.test(event.target.value);
    let amount = event.target.value;
    if (!test)
      amount = event.target.value.substring(0, event.target.value.length - 1);
    if (amount >= max) {
      amount = max;
      setReachMax(true);
    } else setReachMax(false);
    setEnteredAmount(amount);

    props.onChange(amount);
  };

  return (
    <div className={classes["input"]}>
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
          value={enteredAmount}
          onChange={amountChangeHandler}
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
