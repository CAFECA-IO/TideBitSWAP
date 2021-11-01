import React, { useState, useEffect } from "react";
import classes from "./PoolDetailTitle.module.css";

const ShrinkPoolDetailTitle = (props) => {
  return (
    <div className={classes["title-bar"] + " " + classes.shrink}>
      <div className={classes.title}>Pool</div>
      <div className={classes.title}>Total Yield</div>
    </div>
  );
};

const ExpandPoolDetailTitle = (props) => {
  return (
    <div className={classes["title-bar"] + " " + classes.expand}>
      <div className={classes.title}>Pool</div>
      <div className={classes.title}>Share</div>
      <div className={classes.title}>Liquidity</div>
      <div className={classes.title}>Total Yield</div>
      {/* <div className={classes.title}>Reward Coins</div> */}
      <div className={classes.title}>Volume</div>
    </div>
  );
};

const PoolDetailTitle = (props) => {
  const [width, setWidth] = useState(window.innerWidth);
  const breakpoint = 648;

  /*
  https://blog.logrocket.com/developing-responsive-layouts-with-react-hooks/
  */
  useEffect(() => {
    /* Inside of a "useEffect" hook add an event listener that updates
       the "width" state variable when the window size changes */
    const handleWindowResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleWindowResize);

    /* passing an empty array as the dependencies of the effect will cause this
          effect to only run when the component mounts, and not each time it updates.
          We only want the listener to be added once */

    // Return a function from the effect that removes the event listener
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  return width < breakpoint ? ShrinkPoolDetailTitle(props) : ExpandPoolDetailTitle(props);
};

export default PoolDetailTitle;
