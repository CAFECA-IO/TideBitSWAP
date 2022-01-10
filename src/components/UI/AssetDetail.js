import React, { useContext } from "react";
import ConnectorContext from "../../store/connector-context";
import TraderContext from "../../store/trader-context";

import { addressFormatter, formateDecimal } from "../../Utils/utils";
import classes from "./AssetDetail.module.css";
import LoadingIcon from "./LoadingIcon";

const AssetDetail = () => {
  const traderCtx = useContext(TraderContext);
  const connectorCtx = useContext(ConnectorContext);

  return (
    <div className={classes.asset}>
      <div className={classes.title}>Connected Account</div>
      <div className={classes.content}>
        {connectorCtx.connectedAccount && (
          <div className={classes.paragraph}>
            {addressFormatter(connectorCtx.connectedAccount?.contract, 10)}
          </div>
        )}
        <div className={classes.icon}>
          <div></div>
          <div></div>
        </div>
      </div>
      {connectorCtx.isLoading ? (
        <LoadingIcon />
      ) : (
        <div className={classes.content}>
          <div className={classes.header1}>{`${
            traderCtx.fiat.dollarSign
          } ${formateDecimal(
            traderCtx.getPrice(connectorCtx.totalBalance),
            6
          )}`}</div>
          <div className={classes.subtitle}>
            <div className={classes.header2}>{`${
              formateDecimal(
                connectorCtx.connectedAccount?.balanceOf || "0",
                4
              ) || "--"
            } ${
              connectorCtx.currentNetwork?.nativeCurrency?.symbol || "--"
            }`}</div>
            <div className={classes.header2}>{`${
              connectorCtx.connectedAccount?.balanceOf
                ? formateDecimal(
                    traderCtx.getPrice(
                      connectorCtx.connectedAccount?.balanceOf
                    ) || "0",
                    4
                  )
                : "--"
            }`}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetail;
