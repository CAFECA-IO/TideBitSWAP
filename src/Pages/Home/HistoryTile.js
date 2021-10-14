import React from "react";
import { dateFormatter } from "../../utils/utils";

import classes from "./HistoryTile.module.css";

const HistoryTile = (props) => {
  const formattedDate = dateFormatter(props.date);
  const tile1 = (data) => (
    <div className={classes["history-tile"]}>
      <div className={classes.type}>{data.type}</div>
      <div className={classes.coin}>
        <div className={classes.icon}>
          <img src={data.iconSrc} alt={data.coin} />
        </div>
        <div className={classes.name}>{data.coin}</div>
      </div>
      <div className={classes.amount}>{data.amount}</div>
      <div className={classes.date}>
        <div>{formattedDate.date}</div>
        <div>{formattedDate.time}</div>
      </div>
    </div>
  );
  const tile2 = (data) => {
    const _type = data.type.split(" ");
    return (
      <div className={classes["history-tile"]}>
        <div className={classes.type}>
          {_type.map((t) => (
            <div key={data.id + t}>{t}</div>
          ))}
        </div>
        <div className={classes.pair}>
          <div className={classes.icon}>
            <img src={data.iconSrcs[0]} alt={data.name} />
          </div>
          <div className={classes.icon}>
            <img src={data.iconSrcs[1]} alt={data.name} />
          </div>
          {/* <div className={classes.name}>{data.name}</div> */}
        </div>
        <div className={classes.amount}>{data.amount}</div>
        <div className={classes.date}>
          <div>{formattedDate.date}</div>
          <div>{formattedDate.time}</div>
        </div>
      </div>
    );
  };

  switch (props.type) {
    case "Deposit":
    case "Withdraw":
      return tile1(props);
    default:
      return tile2(props);
  }
};

export default HistoryTile;
