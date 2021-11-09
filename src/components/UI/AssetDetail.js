import React from "react";
import { addressFormatter } from "../../Utils/utils";
import classes from "./AssetDetail.module.css";

const AssetDetail = (props) => {
  return (
    <div className={classes.asset}>
      <div className={classes.title}>Connected Account</div>
      <div className={classes.content}>
        <div className={classes.paragraph}>
          {addressFormatter(props.account, 10)}
        </div>
        <div className={classes.icon}>
          <div></div>
          <div></div>
        </div>
      </div>
      <div className={classes.content}>
        <div className={classes.header1}>{props.balanceInFiat}</div>
        <div className={classes.header2}>{props.balance}</div>
      </div>
    </div>
  );
};

export default AssetDetail;
