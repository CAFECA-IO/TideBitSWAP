import React, { useContext } from "react";

import ConnectorContext from "../../store/connector-context";
import { formateDecimal, randomID } from "../../Utils/utils";

import NetworkDetail from "../../components/UI/NetworkDetail";
import HistoryTable from "../../components/Table/HistoryTable";
import InvestTable from "../../components/Table/InvestTable";
import TokenTable from "../../components/Table/TokenTable";
import LineChart from "../../components/UI/LineChart";
import BarChart from "../../components/UI/BarChart";

import classes from "./Overview.module.css";

const Overview = (props) => {
  const connectorCtx = useContext(ConnectorContext);

  return (
    <div className={classes.overview}>
      <div className={classes["header-bar"]}>
        <div className={classes.header}>Overview</div>
        <NetworkDetail shrink={true} />
      </div>
      <div className={classes.chart}>
        <LineChart />
        <BarChart />
      </div>
      <div className={classes.summary}>
        {connectorCtx.overview.map((summary) => (
          <div className={classes.group} key={randomID(6)}>
            <div className={classes.title}>{summary.title} :</div>
            <div className={classes.data}>
              <div className={classes.value}>
                {formateDecimal(summary.data.value, 3)}
              </div>
              <div
                className={`${classes.change} ${
                  summary.data.change.includes("-")
                  ? classes.decrease
                  : classes.increase
                }`}
              >
                (
                {formateDecimal(
                  summary.data.change.includes("+") ||
                    summary.data.change.includes("-")
                    ? summary.data.change.slice(1)
                    : summary.data.change,
                  3
                )}
                %)
              </div>
            </div>
          </div>
        ))}
      </div>
      <TokenTable
        tokens={connectorCtx.supportedTokens}
        isLoading={
          !connectorCtx.supportedTokens.length > 0 || connectorCtx.isLoading
        }
      />
      <InvestTable
        pools={connectorCtx.supportedPools}
        isLoading={
          !connectorCtx.supportedPools.length > 0 || connectorCtx.isLoading
        }
      />
      <HistoryTable
        histories={connectorCtx.histories}
        isLoading={connectorCtx.isLoading}
      />
    </div>
  );
};

export default Overview;
