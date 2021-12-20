import React, { useState, useEffect, useContext } from "react";

import ConnectorContext from "../../store/connector-context";
import Chart from "react-apexcharts";
import classes from "./Chart.module.css";
import { formateDecimal } from "../../Utils/utils";

const getTVLSettings = (data) => ({
  options: {
    chart: {
      // id: "line",
      type: "area",
      toolbar: {
        show: false,
      },
    },
    title: {
      text: "TVL",
      align: "left",
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return `$${formateDecimal(value, 4)}`;
        },
      },
    },
    xaxis: {
      categories: data ? data.map((d) => d.date):[],
      tickAmount: 12,
      labels: { rotate: 0 },
    },
    stroke: {
      curve: "straight",
      width: 1,
    },
    dataLabels: {
      enabled: false,
    },
  },
  series: [
    {
      name: "TVL",
      data: data ? data.map((d) => d.value):[],
    },
  ],
});
const LineChart = (props) => {
  const [settings, setSettings] = useState(getTVLSettings([]));
  const connectorCtx = useContext(ConnectorContext);

  useEffect(() => {
    setSettings(getTVLSettings(connectorCtx.tvlChartData));
    return () => {};
  }, [connectorCtx.tvlChartData]);
  return (
    <div className={classes.chart}>
      <Chart options={settings.options} series={settings.series} type="area" />
    </div>
  );
};

export default LineChart;
