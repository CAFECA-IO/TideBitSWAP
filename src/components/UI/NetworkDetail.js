import React from "react";

import classes from "./NetworkDetail.module.css";

const NetworkDetail = (props) => {
  return (
    <div className={classes.network}>
      <div className={classes.content}>
        <div className={classes.title}>Network</div>
        <div className={classes.header1}>{props.chainName}</div>
        <div className={classes.paragraph}>Last Block: 13547750</div>
      </div>
      <div className={classes.icon}>
        <img src="https://www.tidebit.one/icons/eth.png" alt={props.chainName}/>
      </div>
    </div>
  );
};

export default NetworkDetail;
