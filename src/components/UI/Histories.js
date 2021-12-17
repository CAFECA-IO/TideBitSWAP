import React, { useState, useEffect, useCallback } from "react";
import LoadingIcon from "./LoadingIcon";
import { transactionType } from "../../constant/constant";
// import ConnectorContext from "../../store/connector-context";
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
        <div className={classes.title}>Token Amount</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes.title}>Token Amount</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes.title}>Time</div>
        <div className={classes.icon}></div>
      </div>
    </div>
  );
};

const HistoryTile = (props) => {
  return (
    <div
      className={`${classes.tile} ${
        props.history.pending ? classes.pending : ""
      }`}
    >
      <div className={classes.data}>
        {props.history.pending && <LoadingIcon className="small" />}
        <div>{`${props.history.type} ${props.history.tokenA.symbol} for ${props.history.tokenB.symbol}`}</div>
      </div>
      <div className={classes.data}>{`${formateDecimal(
        props.history.tokenA.amount,
        6
      )} ${props.history.tokenA.symbol}`}</div>
      <div className={classes.data}>{`${formateDecimal(
        props.history.tokenB.amount,
        6
      )} ${props.history.tokenB.symbol}`}</div>
      <div className={`${classes.data} ${classes.timestamp}`}>
        <div>{props.history.dateTime.time}</div>
        <div>{props.history.dateTime.date}</div>
      </div>
    </div>
  );
};

const Histories = (props) => {
  // const connectorCtx = useContext(ConnectorContext);
  const [filterType, setFilterType] = useState(transactionType.ALL);
  const [filteredHistories, setFilteredHistories] = useState(props.histories);

  const filterHistories = useCallback((type, histories) => {
    const moddifiedHistories =
      type === transactionType.ALL
        ? histories
        : histories.filter((history) => history.type === type);
    setFilteredHistories(moddifiedHistories);
  }, []);

  useEffect(() => {
    console.log(`filterType`, filterType);
    console.log(`Histories`, props.histories);
    filterHistories(filterType, props.histories);
    return () => {};
  }, [filterHistories, filterType, props.histories]);

  return (
    <div className={classes.list}>
      <div className={classes["header-bar"]}>
        <div className={classes.header}>Transactions</div>
        <div
          className={`${classes.button} ${
            filterType === transactionType.ALL ? classes.active : ""
          }`}
          onClick={() => setFilterType(transactionType.ALL)}
        >
          All
        </div>
        <div
          className={`${classes.button} ${
            filterType === transactionType.SWAPS ? classes.active : ""
          }`}
          onClick={() => setFilterType(transactionType.SWAPS)}
        >
          Swaps
        </div>
        <div
          className={`${classes.button} ${
            filterType === transactionType.ADDS ? classes.active : ""
          }`}
          onClick={() => setFilterType(transactionType.ADDS)}
        >
          Adds
        </div>
        <div
          className={`${classes.button} ${
            filterType === transactionType.REMOVES ? classes.active : ""
          }`}
          onClick={() => setFilterType(transactionType.REMOVES)}
        >
          Removes
        </div>
      </div>
      <div className={classes.content}>
        <HistoriesTitle />
        {!filteredHistories.length && !props.isLoading && (
          <div className={classes.hint}>No record found.</div>
        )}
        {!!filteredHistories.length &&
          filteredHistories.map((history) => (
            <HistoryTile history={history} key={history.id} />
          ))}
        {props.isLoading && <LoadingIcon />}
      </div>
    </div>
  );
};

export default Histories;
