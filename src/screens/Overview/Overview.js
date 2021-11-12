import React, { useState, useEffect } from "react";
import BarChart from "../../components/UI/BarChart";
import LineChart from "../../components/UI/LineChart";
import { randomID } from "../../Utils/utils";

import classes from "./Overview.module.css";

const summaries = [
  {
    title: "Volume 24H",
    data: {
      value: "1.65b",
      change: "-5.57%",
    },
  },
  {
    title: "Fees 24H",
    data: {
      value: "3.36m",
      change: "-4.42%",
    },
  },
  {
    title: "TVL",
    data: {
      value: "3.84b",
      change: "+0.71%",
    },
  },
];

const Overview = (props) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    regenerateData();
  }, []);

  const regenerateData = () => {
    const chartData = [];
    for (let i = 0; i < 20; i++) {
      const value = Math.floor(Math.random() * i + 3);
      chartData.push({
        label: i,
        value,
        tooltipContent: `<b>x: </b>${i}<br><b>y: </b>${value}`,
      });
    }
    setData(chartData);
  };

  return (
    <div className={classes.overview}>
      <div className={classes.header}>Overview</div>
      <button onClick={regenerateData}>Change Data</button>
      <LineChart data={data} width={400} height={300} />
      <BarChart data={data} width={400} height={300} />
      <div className={classes.summary}>
        {summaries.map((summary) => (
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
    </div>
  );
};

export default Overview;
