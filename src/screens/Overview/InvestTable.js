import React, { useContext } from "react";
import LoadingIcon from "../../components/UI/LoadingIcon";
import UserContext from "../../store/user-context";

import classes from "./Table.module.css";

const InvestsTitle = (props) => {
  return (
    <thead>
      <tr className={classes["title-bar"]}>
        <th className={classes.leading}>#</th>
        <th className={classes["title-box"]}>
          <div className={classes.title}>TOKEN</div>
          <div className={classes.icon}></div>
        </th>
        <th className={classes["title-box"]}>
          <div className={classes.title}>TVL</div>
          <div className={classes.icon}></div>
        </th>
        <th className={classes["title-box"]}>
          <div className={classes.title}>IRR</div>
          <div className={classes.icon}></div>
        </th>
      </tr>
    </thead>
  );
};

const InvestTile = (props) => {
  return (
    <tr className={classes.tile}>
      <td className={classes.index}>{`${props.index + 1}`}</td>
      <td className={classes.group}>
        <div className={classes.icon}>
          <img src={props.pool.iconSrc} alt={`${props.pool.symbol}`} />
        </div>
        <div className={classes.title}>{props.pool.symbol}</div>
      </td>
      <td className={classes.data}>{`${props.fiat.dollarSign} ${
        props.pool.tvl || "--"
      }`}</td>
      <td className={classes.data}>{`${props.pool.irr || "--"}`} %</td>
      <div className={classes.action}>
        <a className={classes.button} href={`#/swap/${props.pool.contract}`}>
          Invest
        </a>
      </div>
    </tr>
  );
};

const InvestTable = (props) => {
  const userCtx = useContext(UserContext);
  return (
    <div className={`${classes.table} ${classes.invest}`}>
      <div className={classes.header}>Invest</div>
      <div className={classes.container}>
        <InvestsTitle />
        <div className={classes.content}>
          {!props.pools.length && !userCtx.isLoading && (
            <div className={classes.hint}>No token found.</div>
          )}
          {!!props.pools.length &&
            props.pools.map((pool, index) => (
              <InvestTile
                index={index}
                pool={pool}
                fiat={userCtx.fiat}
                key={pool.id}
              />
            ))}
          {userCtx.isLoading && <LoadingIcon />}
        </div>
      </div>
    </div>
  );
};

export default InvestTable;
