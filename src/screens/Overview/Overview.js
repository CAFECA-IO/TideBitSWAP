import React, { useState, useEffect, useContext } from "react";

import { transactionType } from "../../constant/constant";
import UserContext from "../../store/user-context";
import { randomID } from "../../Utils/utils";
import HistoryTable from "./HistoryTable";
import InvestTable from "./InvestTable";

import classes from "./Overview.module.css";
import TokenTable from "./TokenTable";

const tokens = [
  {
    id: `${randomID(6)}`,
    iconSrc: "https://www.tidebit.one/icons/eth.png",
    symbol: "ETH",
    price: "4534.73",
    priceChange: "-0.71",
    balance: "2.1",
  },
];
const invests = [
  {
    id: `${randomID(6)}`,
    iconSrc: "https://www.tidebit.one/icons/usdt.png",
    symbol: "USDT",
    share: "2.1m",
    tvl: "1.2b",
    reward: "90k",
    irr: "3",
  },
];




const Overview = (props) => {
const userCtx = useContext(UserContext);

  return (
    <div className={classes.overview}>
      <div className={classes.header}>Overview</div>
      <div className={classes.chart}>

      </div>
      <div className={classes.summary}>
        {userCtx.overview.map((summary) => (
          <div className={classes.group} key={randomID(6)}>
            <div className={classes.title}>{summary.title} :</div>
            <div className={classes.data}>
              <div className={classes.value}>{summary.data.value}</div>
              <div
                className={`${classes.change} ${
                  summary.data.change.includes("+")
                    ? classes.increase
                    : classes.decrease
                }`}
              >
                ({summary.data.change.slice(1)})
              </div>
            </div>
          </div>
        ))}
      </div>
      <TokenTable tokens={tokens} />
      <InvestTable pools={invests} />
      <HistoryTable histories={userCtx.histories} />
    </div>
  );
};

export default Overview;
