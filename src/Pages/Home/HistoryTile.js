import React from "react";
import { dateFormatter } from "../../Utils/utils";

import classes from "./HistoryTile.module.css";




const HistoryTile = (props) => {

  const tile1 = (data) => (
      <div className={classes["history-tile"]}>
        <div className={classes.type}>{data.type}</div>
        <div className={classes.icon}>
          <img src={data.iconSrc} alt={data.coin} />
        </div>
        <div className={classes.name}>{data.coin}</div>
        <div className={classes.amount}>{data.amount}</div>
        <div className={classes.date}>{dateFormatter(data.date)}</div>
      </div>
    );
  ;
  const tile2 = (data) => (
    <div className={classes["history-tile"]}>
      <div className={classes.type}>{data.type}</div>
      <div className={classes.icons}>
        <div className={classes.icon}>
          <img src={data.iconSrcs[0]} alt={data.pair} />
        </div>
        <div className={classes.icon}>
          <img src={data.iconSrcs[1]} alt={data.pair} />
        </div>
      </div>
      <div className={classes.amount}>{data.amount}</div>
      <div className={classes.date}>{dateFormatter(data.date)}</div>
    </div>
  );

  switch (props.data.type) {
    case "deposit":
    case "withdraw":
      return tile1(props.data);
    default:
      return tile2(props.data);
  }
};

export default HistoryTile;
