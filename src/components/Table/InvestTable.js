import React, { useContext } from "react";
import LoadingIcon from "../UI/LoadingIcon";
import UserContext from "../../store/user-context";

import classes from "./Table.module.css";
import { useHistory } from "react-router";
import { formateDecimal } from "../../Utils/utils";

export const InvestsTitle = (props) => {
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

export const InvestTile = (props) => {
  const history = useHistory();
  const selectHandler = (option) => {
    history.push({
      pathname: `/pool/${option.poolContract}`,
    });
  };
  return (
    <div
      className={classes.tile}
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
        <div className={classes.title}>{props.pool.name}</div>
      </div>
      <div className={classes.data}>{`${props.fiat.dollarSign} ${
        formateDecimal(props.pool.tvl.value, 6) || "--"
      }`}</div>
      <div className={classes.data}>
        {`${props.pool?.irr ? formateDecimal(props.pool.irr, 4) : "--"}`} %
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

const InvestTable = (props) => {
  const userCtx = useContext(UserContext);

  return (
    <div className={`${classes.table} ${classes.invest}`}>
      <div className={classes.header}>Pools</div>
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

export default InvestTable;
