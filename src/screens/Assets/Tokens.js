import React, { useContext } from "react";
import UserContext from "../../store/user-context";
import SafeMath from "../../Utils/safe-math";
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
      {/* <div className={classes["title-box"]}></div> */}
    </div>
  );
};

const TokenTile = (props) => {
  const userCtx = useContext(UserContext);
  return (
    <div className={classes.tile}>
      <div className={classes.group}>
        <div className={classes.icon}>
          <img src={props.token.iconSrc} alt={`${props.token.symbol}`} />
        </div>
        <div className={classes.title}>{props.token.symbol}</div>
      </div>
      <div
        className={classes.data}
      >{`${userCtx.fiat.dollarSign} ${props.token.price}`}</div>
      <div className={classes.data}>{props.token.priceChange} %</div>
      <div
        className={classes.data}
      >{`${props.token.balance} ${props.token.symbol}`}</div>
      <div className={classes.data}>{`${
        userCtx.fiat.dollarSign
      } ${SafeMath.mult(props.token.balance, userCtx.fiat.exchangeRate)}`}</div>
      <div className={classes.action}>
        <div className={classes.button}>Swap</div>
      </div>
    </div>
  );
};

const Tokens = (props) => {
  return (
    <div className={classes.list}>
      <div className={classes.title}>Tokens</div>
      <div className={classes.container}>
        <TokensTitle />
        <div className={classes.content}>
          {!props.tokens.length && (
            <div className={classes.hint}>No token found.</div>
          )}
          {!!props.tokens.length &&
            props.tokens.map((token) => (
              <TokenTile token={token} key={token.id} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Tokens;
