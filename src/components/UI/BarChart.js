import React, { useState, useEffect, useContext } from "react";

import ConnectorContext from "../../store/connector-context";
import Chart from "react-apexcharts";
import classes from "./Chart.module.css";
import { formateDecimal } from "../../Utils/utils";

const getVolumeSettings = (data) => ({
  options: {
    // sparkline: {
    //   enabled: true,
    // },
    chart: {
      id: "basic-bar",
      toolbar: {
        show: false,
      },
    },
    title: {
      text: "Volume 24H",
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
        formatter: function (value) {
          return `$${formateDecimal(value, 4)}`;
        },
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
    dataLabels: {
      enabled: false,
    },
  },
  series: [
    {
      name: "Volume",
      data: data ? data.map((d) => d.value) : [],
    },
  ],
});
const BarChart = (props) => {
  const [settings, setSettings] = useState(getVolumeSettings([]));
  const connectorCtx = useContext(ConnectorContext);

  useEffect(() => {
    setSettings(getVolumeSettings(connectorCtx.volumeChartData));
    return () => {};
  }, [connectorCtx.volumeChartData]);
  return (
    <div className={classes.chart}>
      <Chart options={settings.options} series={settings.series} type="bar" />
    </div>
  );
};

export default BarChart;
