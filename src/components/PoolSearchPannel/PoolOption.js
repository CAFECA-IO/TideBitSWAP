import React, { useState, useEffect } from "react";
import classes from "./PoolOption.module.css";

const poolOption = (props) => {
  return (
    <div value={props.name} className={classes.option + " " + classes.expand}>
      <input
        type="checkbox"
        name="shrink-pool-option"
        id={props.id}
        className={classes.controller}
      />
      <label className={classes.main} htmlFor={props.id}>
        <div className={classes.pair}>
          <div className={classes.icon}>
            <img src={props.iconSrcs[0]} alt={props.name} />
          </div>
          <div className={classes.icon}>
            <img src={props.iconSrcs[1]} alt={props.name} />
          </div>
          <div className={classes.name}>{props.name}</div>
        </div>
        <div className={classes.liquidity}>
          <div className={classes.value}>{props.liquidity}</div>
          <div className={classes.value}>{props.composition}</div>
        </div>
        <div className={classes.yield}>{props.yield}</div>
        <div className={classes.reward}>
          <div className={classes.icon}>
            <img src={props.rewardIconSrc} alt={props.rewardCoinSymbol} />
          </div>
          <div className={classes.value}>{props.rewardCoinSymbol}</div>
        </div>
        <div className={classes.value + " " + classes.volume}>
          {props.volume}
        </div>
        <div className={classes.toggle}>&#10095;</div>
      </label>
      <div className={classes.detail}>
        <button
          className={classes.operation}
          type="button"
          onClick={props.onSelect}
        >
          Liquidity
        </button>
      </div>
    </div>
  );
};

const shrinkPoolOption = (props) => {
  return (
    <div value={props.name} className={classes.option + " " + classes.shrink}>
      <input
        type="checkbox"
        name="shrink-pool-option"
        id={props.id}
        className={classes.controller}
      />
      <label className={classes.main} htmlFor={props.id}>
        <div className={classes.pair}>
          <div className={classes.icon}>
            <img src={props.iconSrcs[0]} alt={props.name} />
          </div>
          <div className={classes.icon}>
            <img src={props.iconSrcs[1]} alt={props.name} />
          </div>
          <div className={classes.name}>{props.name}</div>
        </div>
        <div className={classes.yield}>{props.yield}</div>
        <div className={classes.toggle}>&#10095;</div>
      </label>
      <div className={classes.detail}>
        <div className={classes.data}>
          <div className={classes.title}>Liquidity</div>
          <div className={classes.liquidity}>
            <div className={classes.value}>{props.liquidity}</div>
            <div className={classes.value}>{props.composition}</div>
          </div>
        </div>
        <div className={classes.data}>
          <div className={classes.title}>Volume (24hr)</div>
          <div className={classes.value}>{props.volume}</div>
        </div>
        <div className={classes.data}>
          <div className={classes.title}>Reward Coins</div>
          <div className={classes.reward}>
            <div className={classes["icon"]}>
              <img src={props.rewardIconSrc} alt={props.rewardCoinSymbol} />
            </div>
            <div className={classes.value}>{props.rewardCoinSymbol}</div>
          </div>
        </div>
        <button
          className={classes.operation}
          type="button"
          onClick={props.onSelect}
        >
          Liquidity
        </button>
      </div>
    </div>
  );
};

const PoolOption = (props) => {
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

  return width < breakpoint ? shrinkPoolOption(props) : poolOption(props);
};

export default PoolOption;
