import React from "react";
import classes from "./PoolOption.module.css";

const PoolOption = (props) => {
  return (
    <div className={classes.pair}  onClick={props.onSelect}>
      <div className={classes.icon}>
        <img src={props.iconSrcs[0]} alt={props.name} />
      </div>
      <div className={classes.icon}>
        <img src={props.iconSrcs[1]} alt={props.name} />
      </div>
      <div className={classes.name}>{props.name}</div>
    </div>
  );
};

export default PoolOption;
