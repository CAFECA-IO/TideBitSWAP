import React from "react";
import { randomID } from "../../Utils/utils";
import classes from "./PoolOption.module.css";

const poolOption = (props) => {
  return (
    <option
      value={props.name}
      className={classes.option + (props.isShrink ? " " + classes.shrink : "")}
    >
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
      <div className={classes.value}>{props.volume}</div>
      <button className={classes.operation}>{props.operation}</button>
    </option>
  );
};

const shrinkPoolOption = (props) => {
  const id = randomID(6);
  return (
    <option
      value={props.name}
      className={classes.option + (props.isShrink ? " " + classes.shrink : "")}
    >
      <input
        type="radio"
        name="shrink-pool-option"
        id={id}
        class={classes.controller}
      />
      <label className={classes.main} htmlFor={id}>
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
        <button className={classes.operation}>{props.operation}</button>
      </div>
    </option>
  );
};

const PoolOption = (props) => (props.isShrink ? shrinkPoolOption : poolOption);

export default PoolOption;
