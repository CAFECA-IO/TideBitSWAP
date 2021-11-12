import React, { useContext } from "react";
import LoadingIcon from "../../components/UI/LoadingIcon";
import UserContext from "../../store/user-context";

import classes from "./Table.module.css";

const TokensTitle = (props) => {
  return (
    <thead>
      <tr className={classes["title-bar"]}>
        <th className={classes.leading}>#</th>
        <th className={classes["title-box"]}>
          <div className={classes.title}>Name</div>
          <div className={classes.icon}></div>
        </th>
        <th className={classes["title-box"]}>
          <div className={classes.title}>Price</div>
          <div className={classes.icon}></div>
        </th>
        <th className={classes["title-box"]}>
          <div className={classes.title}>Price change 24H</div>
          <div className={classes.icon}></div>
        </th>
        <th className={classes["title-box"]}>
          <div className={classes.title}>Trading Volume 24H</div>
          <div className={classes.icon}></div>
        </th>
      </tr>
    </thead>
  );
};

const TokenTile = (props) => {
  return (
    <tr className={classes.tile}>
      <td className={classes.index}>{`${props.index + 1}`}</td>
      <td className={classes.group}>
        <div className={classes.icon}>
          <img src={props.token.iconSrc} alt={`${props.token.symbol}`} />
        </div>
        <div className={classes.title}>{props.token.symbol}</div>
      </td>
      <td className={classes.data}>{`${props.fiat.dollarSign} ${
        props.token.price || "--"
      }`}</td>
      <td className={classes.data}>{`${props.token.priceChange || "--"}`} %</td>
      <td className={classes.data}>{`${props.fiat.dollarSign} ${
        props.token.volume || "--"
      }`}</td>
      <td className={classes.action}>
        <a className={classes.button} href={`#/swap/${props.token.contract}`}>
          Swap
        </a>
      </td>
    </tr>
  );
};

const TokenTable = (props) => {
  const userCtx = useContext(UserContext);
  return (
    <div className={`${classes.table} ${classes.token}`}>
      <div className={classes.header}>Tokens</div>
      <table className={classes.container}>
        <TokensTitle />
        <tbody className={classes.content}>
          {!props.tokens.length && !userCtx.isLoading && (
            <div className={classes.hint}>No token found.</div>
          )}
          {!!props.tokens.length &&
            props.tokens.map((token, index) => (
              <TokenTile
                index={index}
                token={token}
                fiat={userCtx.fiat}
                key={token.id}
              />
            ))}
          {userCtx.isLoading && <LoadingIcon />}
        </tbody>
      </table>
    </div>
  );
};

export default TokenTable;
