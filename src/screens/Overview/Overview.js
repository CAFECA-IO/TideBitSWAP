import React, { useContext } from "react";

import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
import { randomDates, randomID } from "../../Utils/utils";
import HistoryTable from "./HistoryTable";
import InvestTable from "./InvestTable";

import classes from "./Overview.module.css";
import TokenTable from "./TokenTable";

import Chart from "react-apexcharts";

const Overview = (props) => {
  const connectCtx = useContext(ConnectorContext);
  const userCtx = useContext(UserContext);

  const d = randomDates(new Date(2021, 10, 1), new Date());

  const data = {
    options: {
      chart: {
        id: "basic-bar",
      },
      xaxis: {
        categories: d,
      },
    },
    series: [
      {
        name: "series-1",
        data: [30, 40, 45, 50, 49, 60, 70, 91, 12, 1],
      },
    ],
  };

  return (
    <div className={classes.overview}>
      <div className={classes.header}>Overview</div>
      <div className={classes.chart}>
        <Chart
          options={data.options}
          series={data.series}
          type="bar"
          width="500"
        />
        <Chart
          options={data.options}
          series={data.series}
          type="line"
          width="500"
        />
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
