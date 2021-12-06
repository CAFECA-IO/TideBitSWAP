import React, { useState, useEffect, useContext } from "react";

import ConnectorContext from "../../store/connector-context";
import Chart from "react-apexcharts";
import classes from "./Chart.module.css";

const getVolumeSettings = (data) => ({
  options: {
    chart: {
      id: "basic-bar",
      toolbar: {
        show: false,
      },
    },
    title: {
      text: "Volume 24H",
      align: "left",
    },
    xaxis: {
      categories: data.map((d) => d.date),
      tickAmount: 12,
      labels: { rotate: 0 },
    },

    dataLabels: {
      enabled: false,
    },
  },
  series: [
    {
      name: "Volume",
      data: data.map((d) => d.value),
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
