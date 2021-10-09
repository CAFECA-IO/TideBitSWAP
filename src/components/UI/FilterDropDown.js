import React, { useState } from "react";
import { randomID } from "../../Utils/utils";
import Card from "./Card";
import FilterList from "./FilterList";
import classes from "./FilterDropDown.module.css";

const FilterDropDown = (props) => {
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
        {props.selected && props.children(props.selected)}
        {!props.selected && (
          <div className={classes.placeholder}>{props.placeholder}</div>
        )}
        {!!props.data && <div className={classes.icon}>&#10095;</div>}
      </label>
      {!!props.data && (
        <Card className={classes.options}>
          <FilterList
            onSelect={selectHandler}
            data={props.data}
            filterProperty={props.filterProperty}
            hint={props.hint}
          >
            {(data) => props.children(data)}
          </FilterList>
        </Card>
      )}
    </div>
  );
};

export default FilterDropDown;
