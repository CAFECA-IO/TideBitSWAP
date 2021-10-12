import React from "react";
import { randomID } from "../../Utils/utils";

import classes from "./Input.module.css";

const InputAmount = (props) => {
  const id = randomID(6);
  const changeHandler = (event) => {
    let amount = event.target.value;
    // const test = /^(([1-9]\d*)|([0]{1}))(\.\d+)?$/.test(amount);
    // if (!test) amount = amount.substring(0, amount.length - 1);
    props.onChange(+amount);
  };

  return (
    <div
      className={`${classes.input} ${
        props.isValid === false ? classes.invalid : ""
      }`}
    >
      <label htmlFor={id} className={classes.label}>
        {props.label}
      </label>
      <div className={classes["input-controller"]}>
        <input
          id={id}
          type="number"
          min="0"
          step="0.01"
          max={props.max}
          value={props.value}
          onChange={changeHandler}
          readOnly={!!props.readOnly}
        />
        <div
          className={
            classes["input-hint"] +
            (props.value !== "" && +props.value === +props.max
              ? " " + classes.show
              : "")
          }
        >
          MAX
        </div>
      </div>
      {!props.removeDetail && (
        <React.Fragment>
          <div className={classes.detail}>
            <div>Available:</div>
            <div className={classes["input-maximum"]}>{props.max}</div>
            {props.symbol && (
              <div className={classes["symbol"]}>{props.symbol}</div>
            )}
          </div>
          <div className={classes.message}>
            <div>{props.message}</div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default InputAmount;
