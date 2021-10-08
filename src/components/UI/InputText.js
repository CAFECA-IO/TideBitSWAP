import React from "react";
import { randomID } from "../../Utils/utils";

import classes from "./InputText.module.css";

const InputText = (props) => {
  const id = randomID(6);

  return (
    <div
      className={
        props.error ? classes.error + " " + classes.input : classes.input
      }
    >
      <label htmlFor={id} className={classes.label}>
        {props.label}
      </label>
      <div className={classes["input-controller"]}>
        <input
          id={id}
          type="text"
          value={props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
        />
      </div>
      <div className={classes.error}>
        <div>{props.errorText}</div>
      </div>
    </div>
  );
};

export default InputText;
