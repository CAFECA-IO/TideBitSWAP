import React, { useContext } from "react";
import LoadingIcon from "../../components/UI/LoadingIcon";
import TraderContext from "../../store/trader-context";
import SafeMath from "../../Utils/safe-math";
import { formateDecimal, randomID } from "../../Utils/utils";
import classes from "./Invests.module.css";

const InvestsTitle = (props) => {
  return (
    <div className={classes["title-bar"]}>
      <div className={classes["title-box"]}>
        <div className={classes.title}>TOKEN</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes.title}>MYSHARE</div>
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
      <div className={classes["title-box"]}>
        <div className={classes.title}>REWARD</div>
        <div className={classes.icon}></div>
      </div>
    </div>
  );
};

const InvestTile = (props) => {
  return (
    <div
      className={`${classes.tile} ${
        props.pool?.pending ? classes.pending : ""
      }`}
    >
      <div className={classes.group}>
        <div className={classes.icons}>
          <div className={classes.icon}>
            <img
              src={props.pool.token0.iconSrc}
              alt={`${props.pool.token0.symbol}`}
            />
          </div>
          <div className={classes.icon}>
            <img
              src={props.pool.token1.iconSrc}
              alt={`${props.pool.token1.symbol}`}
            />
          </div>
        </div>
        <div className={classes.title}>
          {props.pool?.pending && <LoadingIcon className="small" />}
          {props.pool.name}
        </div>
      </div>
      <div className={classes.data}>{`${formateDecimal(
        SafeMath.mult(props.pool.share, "100"),
        4
      )}%`}</div>
      <div className={classes.data}>{`${props.fiat.dollarSign} ${
        formateDecimal(props.pool.tvl.value, 6) || "--"
      }`}</div>
      <div className={classes.data}>
        {`${formateDecimal(SafeMath.mult(props.pool.irr, "100"), 4) || "--"}`} %
      </div>
      <div className={classes.data}>{`${props.fiat.dollarSign} ${
        props.pool.reward || "0"
      }`}</div>
      <div className={classes.action}>
        <a
          className={classes.button}
          href={`#/add-liquidity/${props.pool.token0.contract}/${props.pool.token1.contract}`}
        >
          Add
        </a>
        <a
          className={classes.button}
          href={
            props.pool?.pending
              ? `#/assets`
              : `#/redeem-liquidity/${props.pool.poolContract}`
          }
        >
          Remove
        </a>
      </div>
    </div>
  );
};

const Invests = (props) => {
  const traderCtx = useContext(TraderContext);
  return (
    <div className={classes.list}>
      <div className={classes.title}>Pools</div>
      <div className={classes.container}>
        <InvestsTitle />
        <div className={classes.content}>
          {!props.invests.length && !props.isLoading && (
            <div className={classes.hint}>No token found.</div>
          )}
          {!!props.invests.length &&
            props.invests.map((pool) => (
              <InvestTile
                pool={pool}
                fiat={traderCtx.fiat}
                key={`${pool.poolContract}-${randomID(6)}`}
              />
            ))}
          {props.isLoading && <LoadingIcon />}
        </div>
      </div>
    </div>
  );
};

export default Invests;
