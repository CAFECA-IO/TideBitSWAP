import React from "react";

import DonutChart from "../UI/DonutChart";
import List from "../UI/List";
import AssetTile from "./AssetTile";

import classes from "./Assets.module.css";
import { assetsData } from "../../constant/dummy-data";

const Assets = (props) => {
  const donutData = [
    { name: "Bitcoin", value: 57911.2 },
    { name: "Ethereum", value: 24532.23 },
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
