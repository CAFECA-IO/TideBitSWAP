import React from "react";
import Chart from "../UI/Chart";
import classes from "./DonutChart.module.css";

const DonutChart = (props) => {
  return (
    <div
      className={`${classes["donut-chart"]} ${
        props.className ? props.className : ""
      }`}
    >
      <Chart data={props.data} />
      <div className={classes.title}>{props.title}</div>
    </div>
  );
};

export default DonutChart;
