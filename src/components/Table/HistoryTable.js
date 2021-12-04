import React, { useContext, useState, useEffect } from "react";
import { transactionType } from "../../constant/constant";
import ConnectorContext from "../../store/connector-context";
import { formateDecimal } from "../../Utils/utils";
import LoadingIcon from "../UI/LoadingIcon";

import classes from "./Table.module.css";

const HistoriesTitle = (props) => {
  return (
    <div className={classes["title-bar"]}>
      <div className={classes["header-bar"]}>
        <div className={classes.title}>Type</div>
        <div
          className={classes.button}
          onClick={() => props.onFilter(transactionType.ALL)}
        >
          All
        </div>
        <div
          className={classes.button}
          onClick={() => props.onFilter(transactionType.SWAPS)}
        >
          Swaps
        </div>
        <div
          className={classes.button}
          onClick={() => props.onFilter(transactionType.ADDS)}
        >
          Adds
        </div>
        <div
          className={classes.button}
          onClick={() => props.onFilter(transactionType.REMOVES)}
        >
          Removes
        </div>
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
      <div className={classes.index}>{props.index}</div>
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
      <div className={classes.data}>{props.history.time}</div>
    </div>
  );
};

const HistoryTable = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [filteredHistories, setFilterHistories] = useState(props.histories);

  const filterHistories = (type, histories) => {
    const moddifiedHistories =
      type === transactionType.ALL
        ? histories
        : histories.filter((history) => history.type === type);
    setFilterHistories(moddifiedHistories);
  };

  useEffect(() => {
    filterHistories(transactionType.ALL, connectorCtx.histories);
    return () => {};
  }, [connectorCtx.histories]);

  return (
    <div className={`${classes.table} ${classes.history}`}>
      <div className={classes.header}>Transactions</div>
      <div className={classes.container}>
        <HistoriesTitle onFilter={filterHistories} />
        <div className={classes.content}>
          {!filteredHistories.length && !props.isLoading && (
            <div className={classes.hint}>No record found.</div>
          )}
          {!!filteredHistories.length &&
            filteredHistories.map((history, index) => (
              <HistoryTile
                history={history}
                key={history.id}
                index={index + 1}
              />
            ))}
          {props.isLoading && <LoadingIcon />}
        </div>
      </div>
    </div>
  );
};

export default HistoryTable;
