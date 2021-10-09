import React, { useState } from "react";
import { randomID } from "../../Utils/utils";
import Card from "../UI/Card";
import classes from "./FilterDropDown.module.css";

const FilterDropDown = (props) => {
  const id = randomID(6);

  const [checked, setChecked] = useState(false);
  const selectHandler = (option) => {
    console.log(option);
    setChecked(false);
    props.onSelect(option);
  };
  const clickHandler = () => {
    setChecked((prev) => !prev);
  };
  return (
    <div className={classes.dropdown + " dropdown"}>
      <div className={classes.label}>{props.label}</div>
      <input
        className={classes.controller}
        type="checkbox"
        id={id}
        checked={checked}
        readOnly
      />
      <label className={classes.button} htmlFor={id} onClick={clickHandler}>
        {props.selected && (
          <div className={classes.selected}>{props.selected}</div>
        )}
        {!props.selected && (
          <div className={classes.placeholder}>{props.placeholder}</div>
        )}
        {!!props.options && <div className={classes.icon}>&#10095;</div>}
      </label>
      {!!props.options && (
        <Card className={classes.options}>
          {props.options.map((option) => (
            <button
              className={classes.option}
              onClick={() => selectHandler(option)}
              key={randomID(6)}
            >
              {option}
            </button>
          ))}
        </Card>
      )}
    </div>
  );
};

export default FilterDropDown;
