import React from "react";
import classes from "./AssetTile.module.css";

const AssetTile = (props) => {
  return (
    <div className={classes["asset-tile"]}>
      <div className={classes.icon}>
        <img src={props.iconSrc} alt={props.symbol} />
      </div>
      <div className={classes.name}>{props.symbol}</div>
      <div className={classes.composition}>
        <span>{props.composition[0]} + </span>
        <div className="tooltip">
          <div>{props.composition[1]}</div>
          <div className={`tooltiptext ${classes.tooltiptext}`}>Locked</div>
        </div>
      </div>
      <div className={classes.balance}>{props.balance?props.balance:'0.0'}</div>
    </div>
  );
};

export default AssetTile;
