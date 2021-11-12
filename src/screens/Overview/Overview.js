import React, { useState, useEffect } from "react";
import BarChart from "../../components/UI/BarChart";
import LineChart from "../../components/UI/LineChart";
import { transactionType } from "../../constant/constant";
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

const histories = [
  {
    id: randomID(6),
    type: transactionType.SWAPS,
    tokenA: {
      symbol: "ETH",
      amount: "1.63k",
    },
    tokenB: {
      symbol: "WBTC",
      amount: "0.4",
    },
    time: "3 hrs ago",
  },
  {
    id: randomID(6),
    type: transactionType.ADDS,
    tokenA: {
      symbol: "ETH",
      amount: "--",
    },
    tokenB: {
      symbol: "WBTC",
      amount: "0.4",
    },
    time: "3 hrs ago",
  },
];

const summaries = [
  {
    title: "Volume 24H",
    data: {
      value: "1.65b",
      change: "-5.57%",
    },
  },
  {
    title: "Fees 24H",
    data: {
      value: "3.36m",
      change: "-4.42%",
    },
  },
  {
    title: "TVL",
    data: {
      value: "3.84b",
      change: "+0.71%",
    },
  },
];

const Overview = (props) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    regenerateData();
  }, []);

  const regenerateData = () => {
    const chartData = [];
    for (let i = 0; i < 20; i++) {
      const value = Math.floor(Math.random() * i + 3);
      chartData.push({
        label: i,
        value,
        tooltipContent: `<b>x: </b>${i}<br><b>y: </b>${value}`,
      });
    }
    setData(chartData);
  };

  return (
    <div className={classes.overview}>
      <div className={classes.header}>Overview</div>
      <div className={classes.chart}>
        <LineChart data={data} />
        <BarChart data={data} />
      </div>
      <div className={classes.summary}>
        {summaries.map((summary) => (
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
      <HistoryTable histories={histories} />
    </div>
  );
};

export default Overview;
