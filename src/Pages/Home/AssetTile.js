import React from "react";
import classes from "./AssetTile.module.css";

const AssetTile = (props) => {
  return (
    <div className={classes["asset-tile"]}>
      <div className={classes.icon}>
        <img src={props.data.iconSrc} alt={props.data.coin} />
      </div>
      <div className={classes.name}>{props.data.coin}</div>
      <div className={classes.composition}>
        <span>{props.data.composition[0]} + </span>
        <span>{props.data.composition[1]}</span>
        <div className={classes["tooltip"]}>Locked</div>
      </div>
      <div className={classes.balance}>{props.data.balance}</div>
    </div>
  );
};

export default AssetTile;
