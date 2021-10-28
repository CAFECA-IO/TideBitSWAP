import React from "react";
import { randomID } from "../../Utils/utils";
import classes from "./RadioText.module.css";

const RadioText = (props) => {
  const id = randomID(6);
  return (
    <React.Fragment>
      <input
        className={classes.controller}
        type={props.type || "radio"}
        name={props.name}
        id={id}
        checked={props.checked}
        onChange={props.onChange}
      />
      <label className={classes.tab} htmlFor={id} onClick={props.onSelect}>
        <div className={classes.icon}></div>
        <div className={classes.value}>{props.value}</div>
      </label>
    </React.Fragment>
  );
};

export default RadioText;
