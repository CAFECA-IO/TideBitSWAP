import React, { useContext } from "react";
import LoadingIcon from "../../components/UI/LoadingIcon";
import UserContext from "../../store/user-context";

import classes from "./Table.module.css";

const InvestsTitle = (props) => {
  return (
    <div className={classes["title-bar"]}>
      <div className={classes.leading}>#</div>
      <div className={classes["title-box"]}>
        <div className={classes.title}>TOKEN</div>
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

const InvestTile = (props) => {
  return (
    <div className={classes.tile}>
      <div className={classes.index}>{`${props.index + 1}`}</div>
      <div className={classes.group}>
        <div className={classes.icon}>
          <img
            src={props.pool.token0.iconSrc}
            alt={`${props.pool.token0.symbol}`}
          />
        </div>
        <div className={classes.title}>{props.pool.token0.symbol}</div>
      </div>
      <div className={classes.data}>{`${props.fiat.dollarSign} ${
        props.pool.tvl || "--"
      }`}</div>
      <div className={classes.data}>{`${props.pool.irr || "--"}`} %</div>
      <div className={classes.action}>
        <a className={classes.button} href={`#/swap/${props.pool.contract}`}>
          Invest
        </a>
      </div>
    </div>
  );
};

const InvestTable = (props) => {
  const userCtx = useContext(UserContext);
  return (
    <div className={`${classes.table} ${classes.invest}`}>
      <div className={classes.header}>Invest</div>
      <div className={classes.container}>
        <InvestsTitle />
        {!props.pools.length && !props.isLoading && (
          <div>
            <div className={classes.hint}>No token found.</div>
          </div>
        )}
        <div className={classes.content}>
          {!!props.pools.length &&
            props.pools.map((pool, index) => (
              <InvestTile
                index={index}
                pool={pool}
                fiat={userCtx.fiat}
                key={pool.id}
              />
            ))}
          {props.isLoading && <LoadingIcon />}
        </div>
      </div>
    </div>
  );
};

export default InvestTable;
