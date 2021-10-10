import React from "react";

import classes from "./Navigator.module.css";

const Navigator = (props) => {
  return (
    <ul className={classes.navigators}>
      <li>
        <a href="#/deposit">Deposit</a>
      </li>
      <li>
        <a href="#/earn">Earn</a>
      </li>
      <li onClick={props.openSwap}>
        <a href="#/">Swap</a>
      </li>
      <li>
        <a href="#/withdraw">Withdraw</a>
      </li>
    </ul>
  );
};

export default Navigator;
