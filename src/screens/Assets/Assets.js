import React, { useContext } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
import SafeMath from "../../Utils/safe-math";
import classes from "./Assets.module.css";

const Assets = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const userCtx = useContext(UserContext);
  return (
    <div className={classes.assets}>
      <div className={classes.header}>My Assets</div>
      <div className={classes.details}>
        <AssetDetail
          account={connectorCtx.connectedAccount}
          balance={`${userCtx.totalBalance} ETH`}
          balanceInFiat={`${userCtx.fiat.dollarSign} ${SafeMath.mult(
            userCtx.totalBalance,
            userCtx.fiat.exchangeRate
          )}`}
        />
        <NetworkDetail chainName={connectorCtx.currentNetwork.chainName} />
      </div>
    </div>
  );
};

export default Assets;
