import React, { useContext } from "react";
import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
import SafeMath from "../../Utils/safe-math";
import { addressFormatter } from "../../Utils/utils";
import classes from "./AssetDetail.module.css";
import LoadingIcon from "./LoadingIcon";

const AssetDetail = () => {
  const userCtx = useContext(UserContext);
  const connectorCtx = useContext(ConnectorContext);
  return (
    <div className={classes.asset}>
      <div className={classes.title}>Connected Account</div>
      <div className={classes.content}>
        {connectorCtx.connectedAccount && (
          <div className={classes.paragraph}>
            {addressFormatter(connectorCtx.connectedAccount, 10)}
          </div>
        )}
        <div className={classes.icon}>
          <div></div>
          <div></div>
        </div>
      </div>
      {userCtx.isLoading ? (
        <LoadingIcon />
      ) : (
        <div className={classes.content}>
          <div className={classes.header1}>{`${
            userCtx.fiat.dollarSign
          } ${SafeMath.mult(
            userCtx.totalBalance,
            userCtx.fiat.exchangeRate
          )}`}</div>
          <div className={classes.header2}>{`${userCtx.totalBalance} ${connectorCtx.currentNetwork.nativeCurrency.symbol}`}</div>
        </div>
      )}
    </div>
  );
};

export default AssetDetail;
