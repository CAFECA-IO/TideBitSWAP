import React, { useEffect, useContext, useState } from "react";
import ReactDOM from "react-dom";
import classes from "./Navigator.module.css";
import ConnectorContext from "../../store/connector-context";
import Dialog from "./Dialog";
import ConnectOptions from "./ConnectOptions";
import { useLocation } from "react-router";

const NavigatorOptions = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const loacation = useLocation();

  return (
    <div className={classes.navigator}>
      <div
        className={`${classes.menuOption} ${
          loacation.hash === "#/" || loacation.hash.includes("swap")
            ? classes.active
            : ""
        }`}
      >
        <a className={classes.menuOptionText} href="#/swap">
          swap
        </a>
      </div>

      <div
        className={`${classes.menuOption} ${
          loacation.hash.includes("add-liquidity") ? classes.active : ""
        }`}
      >
        <a className={classes.menuOptionText} href="#/add-liquidity">
          pool
        </a>
      </div>
      <div
        className={`${classes.menuOption} ${
          loacation.hash === "#/charts" ? classes.active : ""
        }`}
      >
        <a className={classes.menuOptionText} href="/#/charts">
          overview
        </a>
      </div>
      {connectorCtx.isConnected && connectorCtx.connectedAccount && (
        <div
          className={`${classes.menuOption} ${
            loacation.hash.includes("assets") ? classes.active : ""
          }`}
        >
          <a className={classes.menuOptionText} href="#/assets">
            assets
          </a>
        </div>
      )}
    </div>
  );
};

const Navigator = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [openDialog, setOpenDialog] = useState(false);
  const cancelHandler = () => {
    setOpenDialog(false);
  };
  const connectHandler = () => {
    console.log(`connectHandler`);
    setOpenDialog(true);
  };

  useEffect(() => {
    if (connectorCtx.isConnected && connectorCtx.connectedAccount)
      setOpenDialog(false);
    return () => {};
  }, [connectorCtx.connectedAccount, connectorCtx.isConnected]);

  return (
    <React.Fragment>
      {openDialog && (
        <Dialog title="Connect Wallet" onCancel={cancelHandler}>
          <ConnectOptions onClick={connectHandler} />
        </Dialog>
      )}
      {ReactDOM.createPortal(
        <div
          className={`${classes.container} ${
            connectorCtx.isConnected && connectorCtx.connectedAccount
              ? classes.connected
              : ""
          }`}
        >
          <NavigatorOptions onConnect={connectHandler} />
          {window.ethereum &&
            (!connectorCtx.isConnected || !connectorCtx.connectedAccount) && (
              <div className={`${classes.menuOption} ${classes.highlight}`}>
                <div
                  className={classes.menuOptionText}
                  onClick={() => setOpenDialog(true)}
                >
                  Connect
                </div>
              </div>
            )}
        </div>,
        document.getElementById("side-menu")
      )}
    </React.Fragment>
  );
};

export default Navigator;
