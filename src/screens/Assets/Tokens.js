import React, { useContext } from "react";
import LoadingIcon from "../../components/UI/LoadingIcon";
import ConnectorContext from "../../store/connector-context";
import SafeMath from "../../Utils/safe-math";
import { formateDecimal } from "../../Utils/utils";
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
        formateDecimal(props.token.priceToEth.value, 6) || "--"
      }`}</div>
      <div
        className={`${classes.data} ${
          props.token.priceToEth.change.includes("+")
            ? classes.increase
            : classes.decrease
        }`}
      >
        {`${formateDecimal(props.token.priceToEth.change.slice(1), 6) || "--"}`}{" "}
        %
      </div>
      <div className={classes.data}>{`${formateDecimal(
        props.token.balanceOf,
        6
      )} ${props.token.symbol}`}</div>
      <div className={classes.data}>{`${props.fiat.dollarSign} ${formateDecimal(
        SafeMath.mult(props.token.balanceOf, props.fiat.exchangeRate),
        6
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
  const connectorCtx = useContext(ConnectorContext);
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
                fiat={connectorCtx.fiat}
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
