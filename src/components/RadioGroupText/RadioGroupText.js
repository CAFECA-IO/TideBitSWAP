import React from "react";
import { randomID } from "../../Utils/utils";
import classes from "./RadioGroupText.module.css";

const RadioText = (props) => {
  const id = randomID(6);
  return (
    <React.Fragment>
      <input
        className={classes.controller}
        type="radio"
        name={props.name}
        id={id}
        checked={props.checked}
        onChange={props.onSelect}
      />
      <label className={classes.tab} htmlFor={id} onClick={props.onSelect}>
        <div className={classes.icon}></div>
        <div className={classes.value}>{props.value}</div>
      </label>
    </React.Fragment>
  );
};

const RadioGroupText = (props) => {
  return (
    <div className={classes.container}>
      {props.options.map((option, index) => (
        <RadioText
          key={randomID(6)}
          name={props.name}
          checked={index === props.selected}
          value={option}
          onSelect={() => props.onSelect(index)}
        />
      ))}
    </div>
  );
};

export default RadioGroupText;
