import React, { useContext } from "react";
import LoadingIcon from "../UI/LoadingIcon";
import UserContext from "../../store/user-context";

import classes from "./Table.module.css";
import { useHistory } from "react-router";
import { formateDecimal } from "../../Utils/utils";
import SafeMath from "../../Utils/safe-math";

export const PoolsTitle = (props) => {
  return (
    <div className={`${classes["title-bar"]} ${classes.invest}`}>
      <div className={classes.leading}>#</div>
      <div className={classes["title-box"]}>
        <div className={classes.title}>Pool</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes.title}>TVL</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes.title}>IRR</div>
        <div className={classes.icon}></div>
      </div>
    </div>
  );
};

export const PoolTile = (props) => {
  const history = useHistory();
  const selectHandler = (option) => {
    if (option.poolContract)
      history.push({
        pathname: `/pool/${option.poolContract}`,
      });
  };
  return (
    <div
      className={`${classes.tile} ${
        props.pool?.pending ? classes.pending : ""
      } ${classes.invest}`}
      onClick={() => {
        selectHandler(props.pool);
      }}
    >
      <div className={classes.index}>{`${props.index + 1}`}</div>
      <div className={classes.group}>
        <div className={classes.icons}>
          <div className={classes.icon}>
            <img
              src={props.pool.token0?.iconSrc}
              alt={`${props.pool.token0.symbol}`}
            />
          </div>
          <div className={classes.icon}>
            <img
              src={props.pool.token1?.iconSrc}
              alt={`${props.pool.token1.symbol}`}
            />
          </div>
        </div>
        <div className={classes.title}>
          {props.pool?.pending && <LoadingIcon className="small" />}
          {props.pool.name}
        </div>
      </div>
      <div className={classes.data}>{`${props.fiat.dollarSign} ${
        formateDecimal(props.pool.tvl.value, 6) || "--"
      }`}</div>
      <div className={classes.data}>
        {`${
          props.pool?.irr
            ? formateDecimal(SafeMath.mult(props.pool.irr, "100"), 2)
            : "--"
        }`}{" "}
        %
      </div>
      <div className={classes.action}>
        <a
          className={classes.button}
          href={`#/add-liquidity/${props.pool.token0.contract}/${props.pool.token1.contract}`}
        >
          Invest
        </a>
      </div>
    </div>
  );
};

const PoolTable = (props) => {
  const userCtx = useContext(UserContext);

  return (
    <div className={`${classes.table} ${classes.invest}`}>
      <div className={classes.header}>Pools</div>
      <div className={classes.container}>
        <PoolsTitle />
        <div className={classes.content}>
          {!props.pools.length && !props.isLoading && (
            <div className={classes.hint}>No pool found.</div>
          )}
          {!!props.pools.length &&
            props.pools.map((pool, index) => (
              <PoolTile
                index={index}
                pool={pool}
                fiat={userCtx.fiat}
                key={`${index}-${pool.poolContract}`}
                onClick={() => {}}
              />
            ))}
          {props.isLoading && <LoadingIcon />}
        </div>
      </div>
    </div>
  );
};

export default PoolTable;