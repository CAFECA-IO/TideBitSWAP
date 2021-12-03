import React, { useContext } from "react";

import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
import {
  randomFixedDirectionData,
  randomData,
  randomID,
} from "../../Utils/utils";

import HistoryTable from "../../components/Table/HistoryTable";
import InvestTable from "../../components/Table/InvestTable";
import TokenTable from "../../components/Table/TokenTable";

import classes from "./Overview.module.css";

import Chart from "react-apexcharts";

const tvlData = randomFixedDirectionData(new Date(2021, 9, 15), new Date());
const volumeData = randomData(new Date(2021, 9, 15), new Date());
// https://blog.logrocket.com/developing-responsive-layouts-with-react-hooks/ ToDo
// https://stackoverflow.com/questions/63283055/set-a-certain-interval-for-x-axis-ticks-in-apexcharts
const tvls = {
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
    xaxis: {
      categories: tvlData.map((d) => d.date),
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
      data: tvlData.map((d) => d.value),
    },
  ],
};

const volumes = {
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
      categories: volumeData.map((d) => d.date),
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
      data: volumeData.map((d) => d.value),
    },
  ],
};

const Overview = (props) => {
  const connectCtx = useContext(ConnectorContext);
  const userCtx = useContext(UserContext);

  return (
    <div className={classes.overview}>
      <div className={classes.header}>Overview</div>
      <div className={classes.chart}>
        <Chart options={tvls.options} series={tvls.series} type="area" />
        <Chart options={volumes.options} series={volumes.series} type="bar" />
      </div>
      <div className={classes.summary}>
        {connectCtx.overview.map((summary) => (
          <div className={classes.group} key={randomID(6)}>
            <div className={classes.title}>{summary.title} :</div>
            <div className={classes.data}>
              <div className={classes.value}>{summary.data.value}</div>
              <div
                className={`${classes.change} ${
                  summary.data.change.includes("+")
                    ? classes.increase
                    : classes.decrease
                }`}
              >
                ({summary.data.change.slice(1)})
              </div>
            </div>
          </div>
        ))}
      </div>
      <TokenTable
        tokens={connectCtx.supportedTokens}
        isLoading={connectCtx.isLoading}
      />
      <InvestTable
        pools={connectCtx.supportedPools}
        isLoading={connectCtx.isLoading}
      />
      <HistoryTable
        histories={connectCtx.histories}
        isLoading={connectCtx.isLoading}
      />
    </div>
  );
};

export default Overview;
