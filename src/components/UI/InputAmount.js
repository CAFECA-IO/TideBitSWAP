import React, { useState } from "react";
import { randomID } from "../../Utils/utils";

import classes from "./InputAmount.module.css";

const InputAmount = (props) => {
  const id = randomID(6);
  const max = props.max;
  const [enteredAmount, setEnteredAmount] = useState("");
  const [reachMax, setReachMax] = useState(false);

  const amountChangeHandler = (event) => {
    if (event.target.value >= max) {
      setReachMax(true);
      setEnteredAmount(max);
    } else if (event.target.value.length > 1 && event.target.value[0] === "0")
      setEnteredAmount(event.target.value.trim().slice(1));
    else setEnteredAmount(event.target.value.trim());
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
          ref={props.amountRef}
          value={enteredAmount}
          onChange={amountChangeHandler}
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
