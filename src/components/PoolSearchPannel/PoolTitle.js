import React, { useState, useEffect } from "react";
import classes from "./PoolTitle.module.css";

const shrinkPoolTitle = (props) => {
  return (
    <div className={classes["title-bar"] + " " + classes.shrink}>
      <div className={classes.title}>Pool</div>
      <div className={classes.title}>Total Yield</div>
    </div>
  );
};

const expandPoolTitle = (props) => {
  return (
    <div className={classes["title-bar"] + " " + classes.expand}>
      <div className={classes.title}>Pool</div>
      <div className={classes.title}>Liquidity</div>
      <div className={classes.title}>Total Yield</div>
      <div className={classes.title}>Reward Coins</div>
      <div className={classes.title}>Volume</div>
    </div>
  );
};

const PoolTitle = (props) => {
  const [width, setWidth] = useState(window.innerWidth);
  const breakpoint = 648;

  /*
  https://blog.logrocket.com/developing-responsive-layouts-with-react-hooks/
  */
  useEffect(() => {
    /* Inside of a "useEffect" hook add an event listener that updates
       the "width" state variable when the window size changes */
    window.addEventListener("resize", () => setWidth(window.innerWidth));

    /* passing an empty array as the dependencies of the effect will cause this
       effect to only run when the component mounts, and not each time it updates.
       We only want the listener to be added once */
  }, []);

  return width < breakpoint ? shrinkPoolTitle(props) : expandPoolTitle(props);
};

export default PoolTitle;
