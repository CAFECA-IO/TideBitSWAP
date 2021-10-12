import React from "react";

import DonutChart from "../../components/DonutChart/DonutChart";
import List from "../../components/UI/List";
import classes from "./ChartDetail.module.css";

import HistoryTile from "./HistoryTile";
import AssetTile from "./AssetTile";

const ChartDetail = (props) => {
  return (
    <div className={`${props.className}`}>
      <DonutChart title={props.portionTitle} data={props.portion} />
      {props.title === "Porfolio" && (
        <List
          title={props.detailTitle}
          className={classes.list}
          data={props.detail}
        >
          {HistoryTile}
        </List>
      )}
      {props.title === "Assets" && (
        <List
          title={props.detailTitle}
          className={classes.list}
          data={props.detail}
        >
          {AssetTile}
        </List>
      )}
    </div>
  );
};

export default ChartDetail;
