import React, { useState } from "react";
import { randomID } from "../../Utils/utils";
import Card from "../UI/Card";
import CoinOption from "../CoinOption/CoinOption";
import CoinSearchPannel from "../CoinSearchPannel/CoinSearchPannel";
import classes from "./CoinDropDown.module.css";

const CoinDropDown = (props) => {
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
          <CoinOption
            isShrink={true}
            name={props.selected.name}
            iconSrc={props.selected.iconSrc}
            symbol={props.selected.symbol}
            onSelect={() => {}}
          />
        )}
        {!props.selected && (
          <div className={classes.placeholder}>Select Coin</div>
        )}
        {!!props.options && <div className={classes.icon}>&#10095;</div>}
      </label>
      {!!props.options && (
        <Card className={classes.options}>
          <CoinSearchPannel onSelect={selectHandler} options={props.options} />
        </Card>
      )}
    </div>
  );
};

export default CoinDropDown;
