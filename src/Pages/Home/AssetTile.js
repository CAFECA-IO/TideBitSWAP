import React, { useContext } from "react";
import UserContext from "../../store/user-context";
import { formateDecimal } from "../../Utils/utils";
import classes from "./AssetTile.module.css";

const AssetTile = (props) => {
  const userCtx = useContext(UserContext);
  return (
    <div className={classes["asset-tile"]}>
      <div className={classes.icon}>
        <img src={props.iconSrc} alt={props.symbol} />
      </div>
      <div className={classes.name}>{props.symbol}</div>
      <div className={classes.composition}>
        <span>
          {props.balanceOf ? formateDecimal(props.balanceOf, 12, 2) : "--"} +
        </span>
        <div className="tooltip">
          <div>
             {props.balanceInPools
              ? formateDecimal(props.balanceInPools, 12, 2)
              : ""}
          </div>
          <div className={`tooltiptext ${classes.tooltiptext}`}>Locked</div>
        </div>
      </div>
      <div className={classes.balance}>
        {`${userCtx.fiat.dollarSign} ${props.balance ? props.balance : "--"}`}
      </div>
    </div>
  );
};

export default AssetTile;
