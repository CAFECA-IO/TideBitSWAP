import React, { useContext } from "react";
import LoadingIcon from "../../components/UI/LoadingIcon";
import ConnectorContext from "../../store/connector-context";
import SafeMath from "../../Utils/safe-math";
import { formateDecimal, randomID } from "../../Utils/utils";
import classes from "./Pairs.module.css";

const calculateSwapOut = (pool, fee = 0.0) => {
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
    <div className={classes.tile} onClick={() => props.onSelect()}>
      <div className={classes.name}>
        {`1 ${props.pool.token0.symbol}`} &#8776;
        {` ${formateDecimal(calculateSwapOut(props.pool), 18)} ${
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
const connectorCtx = useContext(ConnectorContext);
  return (
    <div className={classes.list}>
      <div className={classes.title}>Swap</div>
      <div className={classes.content}>
        {!connectorCtx.supportedPools.length && !connectorCtx.isLoading && (
          <div className={classes.hint}>No Pair found.</div>
        )}
        {!!connectorCtx.supportedPools.length &&
          connectorCtx.supportedPools.map((pool) => (
            <PairTile
              pool={pool}
              key={`${pool.poolContract}-${randomID(6)}`}
              onSelect={() => props.onSelect(pool)}
            />
          ))}
        {connectorCtx.isLoading && <LoadingIcon />}
      </div>
    </div>
  );
};

export default Pairs;
