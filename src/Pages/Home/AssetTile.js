import React from "react";
import classes from "./AssetTile.module.css";

const AssetTile = (props) => {
  return (
    <div className={classes["asset-tile"]}>
      <div className={classes.icon}>
        <img src={props.iconSrc} alt={props.coin} />
      </div>
      <div className={classes.name}>{props.coin}</div>
      <div className={classes.composition}>
        <span>{props.composition[0]} + </span>
        <span>{props.composition[1]}</span>
        <div className={classes["tooltip"]}>Locked</div>
      </div>
      <div className={classes.balance}>{props.balance}</div>
    </div>
  );
};

export default AssetTile;
