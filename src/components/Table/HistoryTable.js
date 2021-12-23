import React, { useContext, useState, useEffect, useCallback } from "react";
import { transactionType } from "../../constant/constant";
import ConnectorContext from "../../store/connector-context";
import { formateDecimal } from "../../Utils/utils";
import { FilterOptions, HistoryTile } from "../UI/Histories";
import LoadingIcon from "../UI/LoadingIcon";
import classes from "./Table.module.css";

const TableFilterOptions = (props) => {
  return (
    <React.Fragment>
      <div
        className={`${classes.button} ${
          props.filterType === transactionType.ALL ? classes.active : ""
        }`}
        onClick={() => props.onFilter(transactionType.ALL)}
      >
        All
      </div>
      <div
        className={`${classes.button} ${
          props.filterType === transactionType.SWAPS ? classes.active : ""
        }`}
        onClick={() => props.onFilter(transactionType.SWAPS)}
      >
        Swaps
      </div>
      <div
        className={`${classes.button} ${
          props.filterType === transactionType.ADDS ? classes.active : ""
        }`}
        onClick={() => props.onFilter(transactionType.ADDS)}
      >
        Adds
      </div>
      <div
        className={`${classes.button} ${
          props.filterType === transactionType.REMOVES ? classes.active : ""
        }`}
        onClick={() => props.onFilter(transactionType.REMOVES)}
      >
        Removes
      </div>
    </React.Fragment>
  );
};

const HistoriesTableTitle = (props) => {
  return (
    <div className={classes["title-bar"]}>
      <div className={classes["header-bar"]}>
        <div className={classes.title}>Type</div>
        <TableFilterOptions
          onFilter={props.onFilter}
          filterType={props.filterType}
        />
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

const HistoryTable = (props) => {
  // const connectorCtx = useContext(ConnectorContext);
  const [filterType, setFilterType] = useState(transactionType.ALL);
  const [filteredHistories, setFilterHistories] = useState(props.histories);

  const filterHistories = (type, histories) => {
    const moddifiedHistories =
      type === transactionType.ALL
        ? histories
        : histories.filter((history) => history.type === type);
    setFilterHistories(moddifiedHistories);
    setFilterType(type);
  };

  useEffect(() => {
    console.log(`filterType`, filterType);
    console.log(`Histories`, props.histories);
    filterHistories(filterType, props.histories);
    return () => {};
  }, [filterType, props.histories]);

  return (
    <div className={`${classes.table} ${classes.history}`}>
      <div className={classes.header}>Transactions</div>
      <div className={classes["header-bar"]}>
        <div className={classes.header}>Transactions</div>
        <FilterOptions onFilter={setFilterType} filterType={filterType} />
      </div>
      <div className={classes.container}>
        <HistoriesTableTitle onFilter={setFilterType} filterType={filterType} />
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
