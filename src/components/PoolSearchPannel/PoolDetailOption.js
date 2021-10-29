import React, { useState, useEffect } from "react";
import { formateDecimal } from "../../Utils/utils";
import classes from "./PoolDetailOption.module.css";

const ExpandPoolDetailOption = (props) => {
  return (
    <div
      key={props.data.id}
      value={props.data.name}
      className={classes.option + " " + classes.expand}
    >
      <input
        type="checkbox"
        name="shrink-pool-option"
        id={props.data.id}
        className={classes.controller}
      />
      <label className={classes.main} htmlFor={props.data.id}>
        <div className={classes.pair}>
          <div className={classes.icon}>
            <img
              src={props.data.token0.iconSrc}
              alt={`${props.data.token0.symbol}`}
            />
          </div>
          <div className={classes.icon}>
            <img
              src={props.data.token1.iconSrc}
              alt={`${props.data.token1.symbol}`}
            />
          </div>
          <div className={classes.name}>{props.data.name}</div>
        </div>
        <div className={classes.liquidity}>
          <div className={classes.value}>{props.data.liquidity}</div>
          <div className={classes.value}>{`${formateDecimal(
            props.data.poolBalanceOfToken0,
            12,
            2
          )} ${props.data.token0.symbol} + ${formateDecimal(
            props.data.poolBalanceOfToken1,
            12,
            2
          )} ${props.data.token1.symbol}`}</div>
        </div>
        <div className={classes.yield}>{props.data.yield}</div>
        {/* <div className={classes.reward}>
          <div className={classes.icon}>
            <img src={props.data.rewardIconSrc} alt={props.data.rewardCoinSymbol} />
          </div>
          <div className={classes.value}>{props.data.rewardCoinSymbol}</div>
        </div> */}
        <div className={classes.value + " " + classes.volume}>
          {props.data.volume}
        </div>
        <div className={classes.toggle}>&#10095;</div>
      </label>
      <div className={classes.detail}>
        <button
          className={classes.operation}
          type="button"
          onClick={props.onClick}
        >
          Liquidity
        </button>
      </div>
    </div>
  );
};

const shrinkPoolOptionDetail = (props) => {
  return (
    <div
      key={props.data.id}
      value={props.data.name}
      className={classes.option + " " + classes.shrink}
    >
      <input
        type="checkbox"
        name="shrink-pool-option"
        id={props.data.id}
        className={classes.controller}
      />
      <label className={classes.main} htmlFor={props.data.id}>
        <div className={classes.pair}>
          <div className={classes.icon}>
            <img
              src={props.data.token0.iconSrc}
              alt={`${props.data.token0.symbol}`}
            />
          </div>
          <div className={classes.icon}>
            <img
              src={props.data.token1.iconSrc}
              alt={`${props.data.token1.symbol}`}
            />
          </div>
          <div className={classes.name}>{props.data.name}</div>
        </div>
        <div className={classes.yield}>{props.data.yield}</div>
        <div className={classes.toggle}>&#10095;</div>
      </label>
      <div className={classes.detail}>
        <div className={classes.data}>
          <div className={classes.title}>Liquidity</div>
          <div className={classes.liquidity}>
            <div className={classes.value}>{props.data.liquidity}</div>
            <div className={classes.value}>{`${formateDecimal(
              props.data.poolBalanceOfToken0,
              12,
              2
            )} ${props.data.token0.symbol} + ${formateDecimal(
              props.data.poolBalanceOfToken1,
              12,
              2
            )} ${props.data.token1.symbol}`}</div>
          </div>
        </div>
        <div className={classes.data}>
          <div className={classes.title}>Volume (24hr)</div>
          <div className={classes.value}>{props.data.volume}</div>
        </div>
        {/* <div className={classes.data}>
          <div className={classes.title}>Reward Coins</div>
          <div className={classes.reward}>
            <div className={classes["icon"]}>
              <img src={props.data.rewardIconSrc} alt={props.data.rewardCoinSymbol} />
            </div>
            <div className={classes.value}>{props.data.rewardCoinSymbol}</div>
          </div>
        </div> */}
        <button
          className={classes.operation}
          type="button"
          onClick={props.onClick}
        >
          Liquidity
        </button>
      </div>
    </div>
  );
};

const PoolDetailOption = (props) => {
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

  return width < breakpoint
    ? shrinkPoolOptionDetail(props)
    : ExpandPoolDetailOption(props);
};

export default PoolDetailOption;
