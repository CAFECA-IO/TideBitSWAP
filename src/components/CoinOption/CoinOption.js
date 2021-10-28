import React from "react";
import classes from "./CoinOption.module.css";

const CoinOption = (props, isShrink) => {
  return (
    <div
      value={props.name}
      className={`${classes.option} ${!!isShrink ? classes.shrink : ""}`}
      onClick={props.onSelect}
    >
      <div className={classes.icon}>
        <img src={props.iconSrc} alt={props.name} />
      </div>
      <div className={classes.symbol}>{props.symbol}</div>
      <div className={classes.name}>{props.name}</div>
    </div>
  );
};

export default CoinOption;
