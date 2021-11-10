import React from "react";
import InputAmount from "../../components/UI/InputAmount";
import Summary from "../../components/UI/Summary";
import { dummyDetails } from "../../constant/dummy-data";
import classes from "./EarnPannel.module.css";

const EarnPannel = (props) => {
  const changeAmountHandler = () => {};
  return (
    <div className={classes.earn}>
        <main className={classes.main}>
      <div className={classes.header}>
        <div className={classes.group}>
          <div className={classes.icon}>
            <img
              src={props.pool.token1.iconSrc}
              alt={props.pool.token1.symbol}
            />
          </div>
          <div className={classes.name}>{props.pool.token1.symbol}</div>
        </div>
        <div className={classes.button}>Search</div>
      </div>
      <div className={classes.content}>
        <div className={classes.main}>
          <InputAmount
            max={props.pool.poolBalanceOfToken1}
            symbol={props.pool.token1.symbol}
            onChange={changeAmountHandler}
          />
        </div>
        <div className={classes.sub}>
          <div className={classes.detail}>
            <div className={classes.data}>
              <div className={classes.title}>My Share</div>
              <div className={classes.amount}>{props.pool.share}</div>
            </div>
            <hr />
            <div className={classes.data}>
              <div className={classes.title}>Total Reward</div>
              <div className={classes.amount}>{props.pool.rewards}</div>
            </div>
          </div>
        </div>
      </div>
      <div className={classes.button}>Confirm</div>
      </main>
      <div className="sub">
        <Summary details={dummyDetails} />
      </div>
    </div>
  );
};

export default EarnPannel;
