import React, { useContext } from "react";

import ConnectorContext from "../../store/connector-context";
import { randomID } from "../../Utils/utils";

import HistoryTable from "../../components/Table/HistoryTable";
import InvestTable from "../../components/Table/InvestTable";
import TokenTable from "../../components/Table/TokenTable";
import LineChart from "../../components/UI/LineChart";
import BarChart from "../../components/UI/BarChart";

import classes from "./Overview.module.css";

const Overview = (props) => {
  const connectCtx = useContext(ConnectorContext);

  return (
    <div className={classes.overview}>
      <div className={classes.header}>Overview</div>
      <div className={classes.chart}>
        {/* <LineChart />
        <BarChart /> */}
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
        isLoading={
          !connectCtx.supportedTokens.length > 0 || connectCtx.isLoading
        }
      />
      <InvestTable
        pools={connectCtx.supportedPools}
        isLoading={
          !connectCtx.supportedPools.length > 0 || connectCtx.isLoading
        }
      />
      <HistoryTable
        histories={connectCtx.histories}
        isLoading={connectCtx.isLoading}
      />
    </div>
  );
};

export default Overview;
