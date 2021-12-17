import React, { useState, useEffect } from "react";
import { transactionType } from "../../constant/constant";
import { formateDecimal } from "../../Utils/utils";
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
        {`${props.history.type} ${props.history.tokenA.symbol} for ${props.history.tokenB.symbol}`}
      </div>
      <div className={classes.data}>{`${formateDecimal(
        props.history.tokenA.amount,
        6
      )} ${props.history.tokenA.symbol}`}</div>
      <div className={classes.data}>{`${formateDecimal(
        props.history.tokenB.amount,
        6
      )} ${props.history.tokenB.symbol}`}</div>
      <div className={classes.data}>{props.history.dateTime.date}</div>
    </div>
  );
};

const Histories = (props) => {
  const [filteredHistories, setFilterHistories] = useState(props.histories);

  const filterHistories = (type, histories) => {
    const moddifiedHistories =
      type === transactionType.ALL
        ? histories
        : histories.filter((history) => history.type === type);
    setFilterHistories(moddifiedHistories);
  };

  useEffect(() => {
    console.log(`Histories`, props.histories);
    filterHistories(transactionType.ALL, props.histories);
    return () => {};
  }, [props.histories]);

  return (
    <div className={classes.list}>
      <div className={classes["header-bar"]}>
        <div className={classes.header}>Transactions</div>
        <div
          className={classes.button}
          onClick={() => filterHistories(transactionType.ALL)}
        >
          All
        </div>
        <div
          className={classes.button}
          onClick={() => filterHistories(transactionType.SWAPS)}
        >
          Swaps
        </div>
        <div
          className={classes.button}
          onClick={() => filterHistories(transactionType.ADDS)}
        >
          Adds
        </div>
        <div
          className={classes.button}
          onClick={() => filterHistories(transactionType.REMOVES)}
        >
          Removes
        </div>
      </div>
      <div className={classes.content}>
        <HistoriesTitle />
        {!filteredHistories.length && (
          <div className={classes.hint}>No record found.</div>
        )}
        {!!filteredHistories.length &&
          filteredHistories.map((history) => (
            <HistoryTile history={history} key={history.id} />
          ))}
      </div>
    </div>
  );
};

export default Histories;
