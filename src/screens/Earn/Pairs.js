import React, { useContext } from "react";
import LoadingIcon from "../../components/UI/LoadingIcon";
import UserContext from "../../store/user-context";
import classes from "./Pairs.module.css";

export const PairTile = (props) => {
  return (
    <div className={classes.tile}>
      <div className={classes.group}>
        <div className={classes.icon}>
          <img src={props.pool.token1.iconSrc} alt={props.pool.token1.symbol} />
        </div>
        <div className={classes.name}>{props.pool.token1.symbol}</div>
      </div>
      <div className={classes.data}>{props.pool.yield} %</div>
      <div
        className={classes.data}
      >{`${props.fiat.dollarSign} ${props.pool.volume}`}</div>
    </div>
  );
};

const PairTitle = (props) => {
  return (
    <div className={classes["title-bar"]}>
      <div className={classes.title}>Yield</div>
      <div className={classes.title}>Volume</div>{" "}
    </div>
  );
};

const Pairs = (props) => {
  const userCtx = useContext(UserContext);
  return (
    <div className={classes.list}>
      <div className={classes.title}>Invest</div>
      <PairTitle />
      <div className={classes.content}>
        {!props.pools.length && !userCtx.isLoading && (
          <div className={classes.hint}>No Token found.</div>
        )}
        {!!props.pools.length &&
          props.pools.map((pool) => (
            <PairTile pool={pool} fiat={userCtx.fiat} key={pool.id} />
          ))}
        {userCtx.isLoading && <LoadingIcon />}
      </div>
    </div>
  );
};

export default Pairs;
