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
        <span>{formateDecimal(props.composition[0], 12, 2)} + </span>
        <div className="tooltip">
          <div>{formateDecimal(props.composition[1], 12, 2)}</div>
          <div className={`tooltiptext ${classes.tooltiptext}`}>Locked</div>
        </div>
      </div>
      <div className={classes.balance}>
        {`${userCtx.fiat.dollarSign} ${props.balance}`}
      </div>
    </div>
  );
};

export default AssetTile;
