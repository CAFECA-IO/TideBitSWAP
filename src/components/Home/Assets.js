import React from "react";

import DonutChart from "../UI/DonutChart";
import List from "../UI/List";
import AssetTile from "./AssetTile";

import classes from "./Assets.module.css";
import { randomID } from "../../Utils/utils";

const Assets = (props) => {
  const donutData = [
    { name: "Bitcoin", value: 57911.2 },
    { name: "Ethereum", value: 24532.23 },
  ];
  const assetsData = [
    {
      id: randomID(6),
      coin: "Bitcoin",
      iconSrc: "https://www.tidebit.one/icons/btc.png",
      composition: ["0.1 BTC", "0 BTC"],
      balance: "$57,911.20",
    },
    {
      id: randomID(6),

      coin: "Ethereum",
      iconSrc: "https://www.tidebit.one/icons/eth.png",
      composition: ["1 ETH", "0 ETH"],
      balance: "$24,532.23",
    },
  ];
  return (
    <div className={classes.assets}>
      <DonutChart title={"Asset Distribution"} data={donutData} />
      <List title={"History"}>
        {assetsData.map((data) => (
          <AssetTile data={data} key={data.id} />
        ))}
      </List>
    </div>
  );
};

export default Assets;
