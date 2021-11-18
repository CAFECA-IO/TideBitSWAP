import React, { useContext } from "react";

import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
import { randomData, randomID } from "../../Utils/utils";
import HistoryTable from "./HistoryTable";
import InvestTable from "./InvestTable";

import classes from "./Overview.module.css";
import TokenTable from "./TokenTable";

import Chart from "react-apexcharts";

const tvlData = randomData(new Date(2021, 10, 1), new Date());
const volumeData = randomData(new Date(2021, 10, 1), new Date());
console.log(tvlData);
const tvls = {
  options: {
    chart: {
      id: "line",
      toolbar: {
        show: false
      },
    },
    xaxis: {
      categories: tvlData.map((d) => d.date),
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
        show: false
      },
    },
    xaxis: {
      categories: volumeData.map((d) => d.date),
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
        <Chart options={tvls.options} series={tvls.series} type="line" />
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
        histories={userCtx.histories}
        isLoading={connectCtx.isLoading}
      />
    </div>
  );
};

export default Overview;
