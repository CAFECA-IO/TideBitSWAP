import React from "react";
import { randomID } from "../../Utils/utils";

import classes from "./InputText.module.css";

const InputText = (props) => {
  const id = randomID(6);

  const changeHandler = (event) => {
    const value = event.target.value;
    props.onChange(value);
  };

  return (
    <div className={`${classes.input} ${props.isValid ===false ? classes.invalid : ""}`}>
      <label htmlFor={id} className={classes.label}>
        {props.label}
      </label>
      <div className={classes["input-controller"]}>
        <input
          id={id}
          type={props.type || "text"}
          value={props.value}
          onChange={changeHandler}
          onBlur={props.onBlur}
          placeholder={props.placeholder}
        />
      </div>
      <div className={classes.message}>
        <div>{props.message}</div>
      </div>
    </div>
  );
};

export default InputText;
