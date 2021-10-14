import React from "react";
import { randomID } from "../../utils/utils";

import classes from "./RadioGroupButton.module.css";

const RadionButton = (props) => {
  return (
    <React.Fragment>
      <input
        className={classes.controller}
        type="radio"
        name={props.name}
        id={props.id}
        checked={props.checked}
        readOnly
      />
      <label
        className={classes.tab}
        htmlFor={props.id}
        onClick={props.onSelect}
      >
        <div className={classes.icon}>&#10003;</div>
        <div className={classes.value}>{props.value}</div>
        <div className={classes.detail}>{props.detail}</div>
      </label>
    </React.Fragment>
  );
};

const RadioGroupButton = (props) => {
  return (
    <div className={classes.container}>
      {props.options.map((option, index) => (
        <RadionButton
          key={randomID(6)}
          name={props.name}
          checked={index === props.selected}
          value={option.value}
          detail={option.detail}
          onSelect={() => props.onSelect(index)}
        />
      ))}
    </div>
  );
};

export default RadioGroupButton;
