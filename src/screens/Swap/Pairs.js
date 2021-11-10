import React from "react";
import SafeMath from "../../Utils/safe-math";
import { formateDecimal } from "../../Utils/utils";
import classes from "./Pairs.module.css";

const calculateSwapOut = (pool, fee = 0.03) => {
  const a = SafeMath.div("1", pool.poolBalanceOfToken0);
  const r = 1 - fee;
  const tokenBAmount = SafeMath.mult(
    SafeMath.div(SafeMath.mult(a, r), SafeMath.plus(1, SafeMath.mult(a, r))),
    pool.poolBalanceOfToken1
  );
  return tokenBAmount;
};

const PairTile = (props) => {
  return (
    <div className={classes.tile}>
      <div className={classes.name}>
        {`1 ${props.pool.token0.symbol}/ ${formateDecimal(calculateSwapOut(props.pool))} ${
          props.pool.token1.symbol
        }`}
      </div>
      <div className={classes.pair}>
        <div className={classes.icon}>
          <img src={props.pool.token0.iconSrc} alt={props.pool.token0.symbol} />
        </div>
        <div className={classes["icon-switch"]}>&#8644;</div>
        <div className={classes.icon}>
          <img src={props.pool.token1.iconSrc} alt={props.pool.token1.symbol} />
        </div>
      </div>
    </div>
  );
};

const Pairs = (props) => {
  return (
    <div className={classes.list}>
      <div className={classes.title}>Swap</div>
      <div className={classes.content}>
        {!props.pools.length && (
          <div className={classes.hint}>No Pair found.</div>
        )}
        {!!props.pools.length &&
          props.pools.map((pool) => (
            <PairTile pool={pool} key={pool.id} />
          ))}
      </div>
    </div>
  );
};

export default Pairs;
