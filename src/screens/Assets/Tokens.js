import React from "react";
import classes from "./Tokens.module.css";

const TokensTitle = (props) => {
  return (
    <div className={classes["title-bar"]}>
      <div className={classes["title-box"]}>
        <div className={classes.title}>TOKEN</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes["title-box"]}>PRICE</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes["title-box"]}>24H</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes["title-box"]}>BALANCE</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes["title-box"]}>inFIAT</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}></div>
    </div>
  );
};

const TokenTile = (props) => {
  return (
    <div className={classes.tile}>
      <div className={classes.data}>
        <div className={classes.icon}>
          <img src={props.token.iconSrc} alt={`${props.token.symbol}`} />
        </div>
        <div className={classes.title}>{props.token.symbol}</div>
      </div>
      <div className={classes.data}>{props.token.price}</div>
      <div className={classes.data}>{props.token.priceChange}</div>
      <div className={classes.data}>{props.token.balance}</div>
      <div className={classes.data}>{props.token.inFiat}</div>
      <div className={classes.action}>Swap</div>
    </div>
  );
};

const Tokens = (props) => {
  return (
    <div className={classes.list}>
      <div className={classes.title}>Tokens</div>
      <div className={classes.content}>
        <TokensTitle />
        {!props.tokens.length && (
          <div className={classes.hint}>No token found.</div>
        )}
        {!!props.tokens.length &&
          props.tokens.map((token) => (
            <TokenTile token={token} id={token.id} />
          ))}
      </div>
    </div>
  );
};

export default Tokens;
