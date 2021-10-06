import React, { useState } from "react";
import { randomID } from "../../Utils/utils";
import Card from "../UI/Card";
import PoolOption from "../PoolOption/PoolOption";
import PoolSearchPannel from "../PoolSearchPannel/PoolSearchPannel";
import classes from "./PoolDropDown.module.css";
import { dummyPools } from "../../constant/dummy-data";

const PoolDropDown = (props) => {
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
        {props.selected && (
          <div className={classes.container}>
            {PoolOption(props.selected)}
            <div className={classes.toggle}>&#10095;</div>
          </div>
        )}
        {!props.selected && (
          <div className={classes.placeholder}>Select Pool</div>
        )}
      </label>
      <Card className={classes.options}>
        <PoolSearchPannel
          options={dummyPools}
          onSelect={selectHandler}
          isDetail={false}
          displayTitle={false}
        />
      </Card>
    </div>
  );
};

export default PoolDropDown;
