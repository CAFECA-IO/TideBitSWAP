import React from "react";
import { historyData } from "../../constant/dummy-data";
import DonutChart from "../../components/UI/DonutChart";
import List from "../../components/UI/List";
import HistoryTile from "./HistoryTile";
import classes from "./Porfolio.module.css";


const Porfolio = (props) => {
  const donutData = [
    { name: "Liquidity", value: Math.round(Math.random() * 100) },
    { name: "Static", value: Math.round(Math.random() * 100) },
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