import React, { useContext } from "react";
import LoadingIcon from "../UI/LoadingIcon";
import UserContext from "../../store/user-context";

import classes from "./Table.module.css";
import { useHistory } from "react-router";

export const TokensTitle = (props) => {
  return (
    <div className={classes["title-bar"]}>
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
        <div className={classes.title}>Price change 24H</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes.title}>Trading Volume 24H</div>
        <div className={classes.icon}></div>
      </div>
    </div>
  );
};

export const TokenTile = (props) => {
  return (
    <div className={classes.tile} onClick={props.onClick}>
      <div className={classes.index}>{`${props.index + 1}`}</div>
      <div className={classes.group}>
        <div className={classes.icon}>
          <img src={props.token.iconSrc} alt={`${props.token.symbol}`} />
        </div>
        <div className={classes.title}>{props.token.symbol}</div>
      </div>
      <div className={classes.data}>{`${props.fiat.dollarSign} ${
        props.token.price.value || "--"
      }`}</div>
      <div
        className={`${classes.data} ${
          props.token.price.change.includes("+")
            ? classes.increase
            : classes.decrease
        }`}
      >
        {`${props.token.price.change.slice(1) || "--"}`} %
      </div>
      <div className={classes.data}>{`${props.fiat.dollarSign} ${
        props.token.volume.value || "--"
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
  const history = useHistory();

  const selectHandler = (option) => {
    console.log(`option`, option);
    if (!option.contract) {
      history.push({
        pathname: `/import-token/${option.contract}`,
      });
    } else {
      history.push({
        pathname: `/asset/${option.contract}`,
      });
    }
  };
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
                key={token.id}
                onClick={()=>selectHandler(token)}
              />
            ))}
          {props.isLoading && <LoadingIcon />}
        </div>
      </div>
    </div>
  );
};

export default TokenTable;
