import React from "react";

import { assetsData } from "../../constant/dummy-data";
import DonutChart from "../../components/DonutChart/DonutChart";
import List from "../../components/UI/List";
import AssetTile from "./AssetTile";
import classes from "./Assets.module.css";

const Assets = (props) => {
  const donutData = [
    { name: "Bitcoin", value: 57911.2 },
    { name: "Ethereum", value: 24532.23 },
  ];

  return (
    <div className={classes.assets}>
      <DonutChart title={"Asset Distribution"} data={donutData} />
      <List title={"Asset List"} className="asset-list" data={assetsData}>
        {AssetTile}
      </List>
    </div>
  );
};

export default Assets;
