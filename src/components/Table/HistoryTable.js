import React, { useContext, useState } from "react";
import { transactionType } from "../../constant/constant";
import UserContext from "../../store/user-context";
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
      <div
        className={classes.data}
      >{`${props.history.tokenA.amount} ${props.history.tokenA.symbol}`}</div>
      <div
        className={classes.data}
      >{`${props.history.tokenB.amount} ${props.history.tokenB.symbol}`}</div>
      <div className={classes.data}>{props.history.time}</div>
    </div>
  );
};

const HistoryTable = (props) => {
  const userCtx = useContext(UserContext);
  const histories = props.histories;
  const [filteredHistories, setFilterHistories] = useState(props.histories);

  const filterHistories = (type) => {
    const moddifiedHistories =
      type === transactionType.ALL
        ? histories
        : histories.filter((history) => history.type === type);
    setFilterHistories(moddifiedHistories);
  };

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
            filteredHistories.map((history) => (
              <HistoryTile history={history} key={history.id} />
            ))}
          {props.isLoading && <LoadingIcon />}
        </div>
      </div>
    </div>
  );
};

export default HistoryTable;
