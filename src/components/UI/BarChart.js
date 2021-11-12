import React, { useEffect } from "react";
import * as d3 from "d3";

import classes from "./BarChart.module.css";

const BarChart = (props) => {
  const { data, width, height } = props;

  const drawChart = () => {};

  useEffect(() => {
    console.log(`drwaChart`, data);
    if (!!data.length) drawChart();
  }, [data]);

  return <div id="bar-container" />;
};

export default BarChart;
