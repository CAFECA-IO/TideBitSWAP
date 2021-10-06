import React from "react";
import { randomID } from "../../Utils/utils";
import classes from "./RadionButton.module.css";

const RadionButton = (props) => {
  const id = randomID(6);
  return (
    <React.Fragment>
      <input
        className={classes.controller}
        type="radio"
        name={props.name}
        id={id}
        checked={props.checked}
      />
      <label className={classes.tab} htmlFor={id}>
        <div className={classes.icon}></div>
        <div className={classes.value}>{props.value}</div>
      </label>
    </React.Fragment>
  );
};

export default RadionButton;
