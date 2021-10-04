import React from "react";
import DonutChart from "../UI/DonutChart";
import List from "../UI/List";
import HistoryTile from "./HistoryTile";
import { randomID } from "../../Utils/utils";

import classes from "./Porfolio.module.css";

const Porfolio = (props) => {
  const donutData = [
    { name: "Liquidity", value: Math.round(Math.random() * 100) },
    { name: "Static", value: Math.round(Math.random() * 100) },
  ];
  const historyData = [
    {
      id: randomID(6),
      type: "deposite",
      coin: "Bitcoin",
      iconSrc: "https://www.tidebit.one/icons/btc.png",
      amount: "0.1 BTC",
      date: Date.now(),
    },
    {
      id: randomID(6),
      type: "deposite",
      coin: "Ethereum",
      iconSrc: "https://www.tidebit.one/icons/eth.png",
      amount: "1 ETH",
      date: Date.now(),
    },
    {
      id: randomID(6),
      type: "create-pool",
      pair: "BTC/ETH",
      iconSrcs: [
        "https://www.tidebit.one/icons/btc.png",
        "https://www.tidebit.one/icons/eth.png",
      ],
      amount: "0.1 BTC + 1 ETH",
      date: Date.now(),
    },
    {
        id: randomID(6),
        type: "add-liquidity",
        pair: "BTC/ETH",
        iconSrcs: [
          "https://www.tidebit.one/icons/btc.png",
          "https://www.tidebit.one/icons/eth.png",
        ],
        amount: "0.1 BTC + 1 ETH",
        date: Date.now(),
      },
      {
        id: randomID(6),
        type: "take-liquidity",
        pair: "BTC/ETH",
        iconSrcs: [
          "https://www.tidebit.one/icons/btc.png",
          "https://www.tidebit.one/icons/eth.png",
        ],
        amount: "0.1 BTC + 1 ETH",
        date: Date.now(),
      },
      {
        id: randomID(6),
        type: "swap",
        pair: "BTC/ETH",
        iconSrcs: [
          "https://www.tidebit.one/icons/btc.png",
          "https://www.tidebit.one/icons/eth.png",
        ],
        amount: "0.1 BTC / 1 ETH",
        date: Date.now(),
      },
  ];
  return (
    <div className={classes.porfolio}>
      <DonutChart title={"Asset Allocation"} data={donutData} />
      <List title={"History"}>
        {historyData.map((data) => (
          <HistoryTile data={data} key={data.id}/>
        ))}
      </List>
    </div>
  );
};

export default Porfolio;
