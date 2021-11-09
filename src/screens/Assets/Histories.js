import React from "react";
import classes from "./Histories.module.css";

const HistoriesTitle = (props) => {
  return (
    <div className={classes["title-bar"]}>
      <div className={classes["title-box"]}>
        <div className={classes.title}>Type</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes["title-box"]}>Token Amount</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes["title-box"]}>Token Amount</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes["title-box"]}>Time</div>
        <div className={classes.icon}></div>
      </div>
    </div>
  );
};

const HistoryTile = (props) => {
  return (
    <div className={classes.tile}>
      <div className={classes.data}>
        <div className={classes.icon}>
          <img
            src={props.pool.token.iconSrc}
            alt={`${props.pool.token.symbol}`}
          />
        </div>
        <div className={classes.title}>{props.pool.token.symbol}</div>
      </div>
      <div className={classes.data}>{props.pool.share}</div>
      <div className={classes.data}>{props.pool.tvl}</div>
      <div className={classes.data}>{props.pool.irr}</div>
      <div className={classes.data}>{props.pool.rewards}</div>
      <div className={classes.action}>Swap</div>
    </div>
  );
};

const Histories = (props) => {
  return (
    <div className={classes.list}>
      <div className={classes["header-bar"]}>
        <div className={classes.header}>Transactions</div>
        <div className={classes.button}>All</div>
        <div className={classes.button}>Swaps</div>
        <div className={classes.button}>Adds</div>
        <div className={classes.button}>Removes</div>
      </div>
      <div className={classes.content}>
        <HistoriesTitle />
        {!props.histories.length && (
          <div className={classes.hint}>No record found.</div>
        )}
        {!!props.histories.length &&
          props.histories.map((token) => (
            <HistoryTile token={token} id={token.id} />
          ))}
      </div>
    </div>
  );
};

export default Histories;
