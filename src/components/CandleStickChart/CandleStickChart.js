import React, { useState } from "react";

import classes from "./CandleStickChart.module.css";
import * as d3 from "d3";
 // barchart

const CandleStickChart = (props) => {
  return (
    <div className={classes.chart}>
      <div className={classes.demobox}>
        <div className={classes.csbox}>
          <div className={classes.option}>
            <input id="oneM" name="1M" type="button" value="1M" />
            <input id="threeM" name="3M" type="button" value="3M" />
            <input id="sixM" name="6M" type="button" value="6M" />
            <input id="oneY" name="1Y" type="button" value="1Y" />
            <input id="twoY" name="2Y" type="button" value="2Y" />
            <input id="fourY" name="4Y" type="button" value="4Y" />
          </div>
          <div className={classes.infobar}>
            <div id="infodate" className={classes.infohead}></div>
            <div id="infoopen" className={classes.infobox}></div>
            <div id="infohigh" className={classes.infobox}></div>
            <div id="infolow" className={classes.infobox}></div>
            <div id="infoclose" className={classes.infobox}></div>
          </div>
          <div id="chart1"></div>
        </div>
      </div>
    </div>
  );
};

export default CandleStickChart;
