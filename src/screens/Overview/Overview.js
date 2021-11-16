import React, { useContext } from "react";

import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
import { randomID } from "../../Utils/utils";
import HistoryTable from "./HistoryTable";
import InvestTable from "./InvestTable";

import classes from "./Overview.module.css";
import TokenTable from "./TokenTable";

const Overview = (props) => {
  const connectCtx = useContext(ConnectorContext);
  const userCtx = useContext(UserContext);

  return (
    <div className={classes.overview}>
      <div className={classes.header}>Overview</div>
      <div className={classes.chart}></div>
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
