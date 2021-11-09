import React from "react";
import classes from "./Invests.module.css";

const InvestsTitle = (props) => {
  return (
    <div className={classes["title-bar"]}>
      <div className={classes["title-box"]}>
        <div className={classes.title}>TOKEN</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes["title-box"]}>MYSHARE</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes["title-box"]}>TVL</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes["title-box"]}>IRR</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes["title-box"]}>REWARD</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}></div>
    </div>
  );
};

const InvestTile = (props) => {
  return (
    <div className={classes.tile}>
      <div className={classes.data}>
        <div className={classes.icon}>
          <img
            src={props.pool.token.iconSrc}
            alt={`${props.pool.token.symbol}`}
          />
        </div>
        <div className={classes.title}>{props.pool.token.symbol}</div>
      </div>
      <div className={classes.data}>{props.pool.share}</div>
      <div className={classes.data}>{props.pool.tvl}</div>
      <div className={classes.data}>{props.pool.irr}</div>
      <div className={classes.data}>{props.pool.rewards}</div>
      <div className={classes.action}>Swap</div>
    </div>
  );
};

const Invests = (props) => {
  return (
    <div className={classes.list}>
      <div className={classes.title}>Invests</div>
      <div className={classes.content}>
        <InvestsTitle />
        {!props.invests.length && (
          <div className={classes.hint}>No token found.</div>
        )}
        {!!props.invests.length &&
          props.invests.map((token) => (
            <InvestTile token={token} id={token.id} />
          ))}
      </div>
    </div>
  );
};

export default Invests;
