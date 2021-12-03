import React, { useContext } from "react";
import LoadingIcon from "../../components/UI/LoadingIcon";
import UserContext from "../../store/user-context";
import SafeMath from "../../Utils/safe-math";
import { formateDecimal, formateNumber } from "../../Utils/utils";
import classes from "./Tokens.module.css";

const TokensTitle = (props) => {
  return (
    <div className={classes["title-bar"]}>
      <div className={classes["title-box"]}>
        <div className={classes.title}>TOKEN</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes.title}>PRICE</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes.title}>PRICE 24H</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes.title}>BALANCE</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes.title}>inFIAT</div>
        <div className={classes.icon}></div>
      </div>
      {/* <div className={classes["title-box"]}></div> */}
    </div>
  );
};

const TokenTile = (props) => {
  return (
    <div className={classes.tile}>
      <div className={classes.group}>
        <div className={classes.icon}>
          <img src={props.token.iconSrc} alt={`${props.token.symbol}`} />
        </div>
        <div className={classes.title}>{props.token.symbol}</div>
      </div>
      <div className={classes.data}>{`${props.fiat.dollarSign} ${
        formateNumber(props.token.priceToEth.value) || "--"
      }`}</div>
      <div
        className={`${classes.data} ${
          props.token.priceToEth.change.includes("+")
            ? classes.increase
            : classes.decrease
        }`}
      >
        {`${formateNumber(props.token.priceToEth.change.slice(1)) || "--"}`} %
      </div>
      <div className={classes.data}>{`${formateNumber(props.token.balanceOf)} ${
        props.token.symbol
      }`}</div>
      <div className={classes.data}>{`${props.fiat.dollarSign} ${formateNumber(
        SafeMath.mult(props.token.balanceOf, props.fiat.exchangeRate)
      )}`}</div>
      <div className={classes.action}>
        <a className={classes.button} href={`#/swap/${props.token.contract}`}>
          Swap
        </a>
      </div>
    </div>
  );
};

const Tokens = (props) => {
  const userCtx = useContext(UserContext);
  return (
    <div className={classes.list}>
      <div className={classes.title}>Tokens</div>
      <div className={classes.container}>
        <TokensTitle />
        <div className={classes.content}>
          {!props.tokens.length && !props.isLoading && (
            <div className={classes.hint}>No token found.</div>
          )}
          {!!props.tokens.length &&
            props.tokens.map((token) => (
              <TokenTile
                token={token}
                fiat={userCtx.fiat}
                key={token.contract}
              />
            ))}
          {props.isLoading && <LoadingIcon />}
        </div>
      </div>
    </div>
  );
};

export default Tokens;
