import React from "react";
import classes from "./PoolOption.module.css";

const PoolOption = (props) => {
  return (
    <div className={classes.pair} onClick={props.onSelect}>
      <div className={classes.icon}>
        <img src={props.token0.iconSrc} alt={props.token0.symbol} />
      </div>
      <div className={classes.icon}>
        <img src={props.token1.iconSrc} alt={props.token1.symbol} />
      </div>
      <div className={classes.name}>{props.name}</div>
    </div>
  );
};

export default PoolOption;
