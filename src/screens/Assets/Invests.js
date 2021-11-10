import React, { useContext } from "react";
import UserContext from "../../store/user-context";
import classes from "./Invests.module.css";

const InvestsTitle = (props) => {
  return (
    <div className={classes["title-bar"]}>
      <div className={classes["title-box"]}>
        <div className={classes.title}>TOKEN</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes["title-box"]}>MYSHARE</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes["title-box"]}>TVL</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes["title-box"]}>IRR</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}>
        <div className={classes["title-box"]}>REWARD</div>
        <div className={classes.icon}></div>
      </div>
      <div className={classes["title-box"]}></div>
    </div>
  );
};

const InvestTile = (props) => {
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
      >{`${userCtx.fiat.dollarSign} ${props.token.share}`}</div>
      <div
        className={classes.data}
      >{`${userCtx.fiat.dollarSign} ${props.token.tvl}`}</div>
      <div className={classes.data}>{props.token.irr} %</div>
      <div
        className={classes.data}
      >{`${userCtx.fiat.dollarSign} ${props.token.reward}`}</div>
      <div className={classes.action}>
        <a className={classes.button} href="#/earn">Add</a>
        <a className={classes.button} href="#/redeem">Remove</a>
      </div>
    </div>
  );
};

const Invests = (props) => {
  return (
    <div className={classes.list}>
      <div className={classes.title}>Invests</div>
      <div className={classes.container}>
        <InvestsTitle />
        <div className={classes.content}>
          {!props.invests.length && (
            <div className={classes.hint}>No token found.</div>
          )}
          {!!props.invests.length &&
            props.invests.map((token) => (
              <InvestTile token={token} key={token.id} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Invests;
