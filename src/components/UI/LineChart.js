import React, { useState, useEffect, useContext } from "react";

import ConnectorContext from "../../store/connector-context";
import Chart from "react-apexcharts";
import classes from "./Chart.module.css";
import { formateDecimal, toFixed } from "../../Utils/utils";

const getTVLSettings = (data) => ({
  options: {
    // sparkline: {
    //   enabled: true,
    // },
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
      style: {
        color: "#c3c5cb",
      },
    },
    noData: {
      text: "Loading...",
    },
    grid: {
      show: false,
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    yaxis: {
      show: false,
      labels: {
        formatter: (value) => `$${formateDecimal(toFixed(value), 4)}`,
      },
    },
    xaxis: {
      categories: data ? data.map((d) => d.date) : [],
      tickAmount: 12,
      labels: {
        rotate: 0,
        axisTicks: {
          show: false,
        },
        style: {
          color: "#c3c5cb",
        },
      },
      axisBorder: {
        show: false,
      },
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
      data: data?.length > 0 ? data.map((d) => d.value) : [],
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
