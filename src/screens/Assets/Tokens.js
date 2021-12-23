import React, { useContext } from "react";
import LoadingIcon from "../../components/UI/LoadingIcon";
import TraderContext from "../../store/trader-context";
import { formateDecimal } from "../../Utils/utils";
import classes from "./Tokens.module.css";
import { useHistory } from "react-router";

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
  const traderCtx = useContext(TraderContext);
  const history = useHistory();

  const selectHandler = (option) => {
    console.log(`option`, option);
    history.push({
      pathname: `/asset/${option.contract}`,
    });
  };

  return (
    <div
      className={classes.tile}
      onClick={() => {
        selectHandler(props.token);
      }}
    >
      <div className={classes.group}>
        <div className={classes.icon}>
          <img src={props.token.iconSrc} alt={`${props.token.symbol}`} />
        </div>
        <div className={classes.title}>{props.token.symbol}</div>
      </div>
      <div className={classes.data}>{`${props.fiat.dollarSign} ${
        formateDecimal(traderCtx.getPrice(props.token.priceToEth.value), 6) ||
        "--"
      }`}</div>
      <div
        className={`${classes.data} ${
          props.token.priceToEth.change.includes("-")
            ? classes.decrease
            : classes.increase
        }`}
      >
        {props.token?.priceToEth?.change
          ? formateDecimal(
              props.token.priceToEth.change.includes("+") ||
                props.token.priceToEth.change.includes("-")
                ? props.token.priceToEth.change.slice(1)
                : props.token.priceToEth.change,
              6
            )
          : "--"}
        %
      </div>
      <div className={classes.data}>{`${formateDecimal(
        props.token.balanceOf,
        6
      )} ${props.token.symbol}`}</div>
      <div className={classes.data}>{`${props.fiat.dollarSign} ${formateDecimal(
        traderCtx.getPrice(props.token.balanceOf),
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
  const traderCtx = useContext(TraderContext);
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
                fiat={traderCtx.fiat}
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
