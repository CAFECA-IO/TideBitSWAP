import React, { useContext } from "react";
import UserContext from "../../store/user-context";
import classes from "./Pairs.module.css";

export const PairTile = (props) => {
  const userCtx = useContext(UserContext);
  return (
    <div className={classes.tile} onClick={() => props.onSelect()}>
      <div className={classes.group}>
        <div className={classes.icon}>
          <img src={props.pool.token1.iconSrc} alt={props.pool.token1.symbol} />
        </div>
        <div className={classes.name}>{props.pool.token1.symbol}</div>
      </div>
      <div className={classes.data}>{props.pool.yield} %</div>
      <div
        className={classes.data}
      >{`${userCtx.fiat.dollarSign} ${props.pool.volume}`}</div>
    </div>
  );
};

const PaitTitle = (props) => {
  return (
    <div className={classes["title-bar"]}>
      <div className={classes.title}>Yield</div>
      <div className={classes.title}>Volume</div>{" "}
    </div>
  );
};

const Pairs = (props) => {
  return (
    <div className={classes.list}>
      <div className={classes.title}>Invest</div>
      <PaitTitle />
      <div className={classes.content}>
        {!props.pools.length && (
          <div className={classes.hint}>No Token found.</div>
        )}
        {!!props.pools.length &&
          props.pools.map((pool) => <PairTile pool={pool} key={pool.id} />)}
      </div>
    </div>
  );
};

export default Pairs;
