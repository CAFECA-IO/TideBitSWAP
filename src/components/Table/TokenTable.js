import React, { useContext } from "react";
import LoadingIcon from "../UI/LoadingIcon";
import UserContext from "../../store/user-context";

import classes from "./Table.module.css";
import { useHistory } from "react-router";
import { formateDecimal } from "../../Utils/utils";
import TraderContext from "../../store/trader-context";

export const TokensTitle = (props) => {
  return (
    <div className={`${classes["title-bar"]} ${classes.token}`}>
      <div className={classes.leading}>#</div>
      <div className={classes["title-box"]}>
        <div className={classes.title}>Name</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes.title}>Price</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes.title}>Price change</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes.title}>Volume 24H</div>
        <div className={classes.icon}></div>
      </div>
    </div>
  );
};

export const TokenTile = (props) => {
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
      className={`${classes.tile} ${classes.token}`}
      onClick={() => {
        selectHandler(props.token);
      }}
    >
      <div className={classes.index}>{`${props.index + 1}`}</div>
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
      <div className={classes.data}>{`${props.fiat.dollarSign} ${
        formateDecimal(props.token.volume.value, 6) || "--"
      }`}</div>
      <div className={classes.action}>
        <a className={classes.button} href={`#/swap/${props.token.condivact}`}>
          Swap
        </a>
      </div>
    </div>
  );
};

const TokenTable = (props) => {
  const userCtx = useContext(UserContext);

  return (
    <div className={`${classes.table} ${classes.token}`}>
      <div className={classes.header}>Tokens</div>
      <div className={classes.container}>
        <TokensTitle />
        <div className={classes.content}>
          {!props.tokens.length && !props.isLoading && (
            <div className={classes.hint}>No token found.</div>
          )}
          {!!props.tokens.length &&
            props.tokens.map((token, index) => (
              <TokenTile
                index={index}
                token={token}
                fiat={userCtx.fiat}
                key={token.contract}
                onClick={() => {}}
              />
            ))}
          {props.isLoading && <LoadingIcon />}
        </div>
      </div>
    </div>
  );
};

export default TokenTable;
