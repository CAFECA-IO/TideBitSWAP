import React, { useEffect, useContext, useState } from "react";
import ReactDOM from "react-dom";
import {
  AiOutlineFundProjectionScreen,
  AiOutlineSwap,
  AiOutlineLogin,
  AiOutlineLogout,
} from "react-icons/ai";
import { BiCoin, BiCrown } from "react-icons/bi";
import { BsCurrencyExchange } from "react-icons/bs";
import { FaHandHoldingUsd, FaChild } from "react-icons/fa";
import { ReactComponent as Logo } from "../../resources/logo.svg";
import packageJson from "../../../package.json";

import classes from "./Menu.module.css";
import ConnectorContext from "../../store/connector-context";
import Dialog from "./Dialog";
import ConnectOptions from "./ConnectOptions";
import { useLocation } from "react-router";

const MenuOptions = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  return (
    <React.Fragment>
      <div className={classes.brand}>
        <Logo /> TideBit
      </div>
      <div className={classes.menuOption}>
        <div className={classes.menuOptionIcon}>
          <AiOutlineFundProjectionScreen size="1.5em" />
        </div>
        <a className={classes.menuOptionText} href="/#">
          overview
        </a>
      </div>

      <div className={classes.menuOption}>
        <div className={classes.menuOptionIcon}>
          <BiCoin size="1.5em" />
        </div>
        <a className={classes.menuOptionText} href="#/market">
          market
        </a>
      </div>

      <div className={classes.menuOption}>
        <div className={classes.menuOptionIcon}>
          <BsCurrencyExchange size="1.5em" />
        </div>
        <a className={classes.menuOptionText} href="#/invest">
          invest
        </a>
      </div>
      {(!connectorCtx.isConnected || !connectorCtx.connectedAccount) && (
        <div className={classes.menuOption}>
          <div className={classes.menuOptionIcon}>
            <AiOutlineLogin size="1.5em" />
          </div>
          <div className={classes.menuOptionText} onClick={props.onConnect}>
            login
          </div>
        </div>
      )}
      <div className={classes.menuOption}>
        <div className={classes.menuOptionIcon}>
          <FaChild size="1.5em" />
        </div>
        <a className={classes.menuOptionText} href="#/assets">
          my assets
        </a>
      </div>

      <div className={classes.menuOption}>
        <div className={classes.menuOptionIcon}>
          <AiOutlineSwap size="1.5em" />
        </div>
        <a className={classes.menuOptionText} href="#/swap">
          swap
        </a>
      </div>

      <div className={classes.menuOption}>
        <div className={classes.menuOptionIcon}>
          <FaHandHoldingUsd size="1.5em" />
        </div>
        <a className={classes.menuOptionText} href="#/earn">
          earn
        </a>
      </div>

      <div className={classes.menuOption}>
        <div className={classes.menuOptionIcon}>
          <BiCrown size="1.5em" />
        </div>
        <a className={classes.menuOptionText} href="#/race">
          race
        </a>
      </div>
      {connectorCtx.isConnected && connectorCtx.connectedAccount && (
        <div className={classes.menuOption}>
          <div className={classes.menuOptionIcon}>
            <AiOutlineLogout size="1.5em" />
          </div>
          <div
            className={classes.menuOptionText}
            onClick={connectorCtx.onDisconnect}
          >
            logout
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

const Footer = (props) => {
  return (
    <div className={classes.footer}>
      <div>v{packageJson.version} BETA</div>
      <div>©2021 TideBit. All rights reserved.</div>
      <div>Power By CAFECA</div>
    </div>
  );
};

const Menu = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const location = useLocation();
  const [openDialog, setOpenDialog] = useState(false);
  const cancelHandler = () => {
    setOpenDialog(false);
  };
  const connectHandler = () => {
    setOpenDialog(true);
  };
  useEffect(() => {
    // console.log(`location`, location);
    if (!connectorCtx.isConnected) {
      switch (location.hash) {
        case "#/assets":
        case "#/swap":
        case "#/earn":
          setOpenDialog(true);
          break;
        default:
          break;
      }
    }
    return () => {};
  }, [connectorCtx.isConnected, location]);

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
          className={`${classes.sideMenu} ${
            connectorCtx.isConnected && connectorCtx.connectedAccount
              ? classes.connected
              : ""
          }`}
        >
          <MenuOptions onConnect={connectHandler} />
          <Footer />
        </div>,
        document.getElementById("side-menu")
      )}
    </React.Fragment>
  );
};

export default Menu;
