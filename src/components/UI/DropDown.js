import React, { useState } from "react";
import { randomID } from "../../Utils/utils";
import Card from "../UI/Card";

import classes from "./DropDown.module.css";

const DropDown = (props) => {
  const id = randomID(6);

  const [checked, setChecked] = useState(false);
  const selectHandler = (option) => {
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
        {props.selected && props.selectedItem}
        {!props.selected && (
          <div className={classes.placeholder}>{props.placeholder}</div>
        )}
        {!!props.options && <div className={classes.icon}>&#10095;</div>}
      </label>
      {!!props.options && (
        <Card className={classes.options}>{props.optionsItem}</Card>
      )}
    </div>
  );
};

export default DropDown;
