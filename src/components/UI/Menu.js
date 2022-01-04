import React, { useContext } from "react";
import ReactDOM from "react-dom";
import { AiOutlineFundProjectionScreen, AiOutlineSwap } from "react-icons/ai";
import { BiCoin } from "react-icons/bi";
import { BsCurrencyExchange } from "react-icons/bs";
import { FaHandHoldingUsd, FaChild } from "react-icons/fa";
// import { ReactComponent as Logo } from "../../resources/logo.svg";
import Logo from "../../resources/logo512.png";
import packageJson from "../../../package.json";

import classes from "./Menu.module.css";
import ConnectorContext from "../../store/connector-context";
import { useLocation } from "react-router";
import AssetDetail from "./AssetDetail";

const MenuOptions = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const loacation = useLocation();
  return (
    <React.Fragment>
      <div className={classes.brand}>
        <div className={classes.logo}>
          <img src={Logo} alt="LOGO" />
        </div>{" "}
        TideBit Swap
      </div>
      {connectorCtx.isConnected && <AssetDetail />}
      <div
        className={`${classes.menuOption} ${
          loacation.hash === "#/charts" ? classes.active : ""
        }`}
      >
        <div className={classes.menuOptionIcon}>
          <AiOutlineFundProjectionScreen size="1.5em" />
        </div>
        <a className={classes.menuOptionText} href="/#/charts">
          overview
        </a>
      </div>

      <div
        className={`${classes.menuOption} ${
          loacation.hash.includes("tokens") ? classes.active : ""
        }`}
      >
        <div className={classes.menuOptionIcon}>
          <BiCoin size="1.5em" />
        </div>
        <a className={classes.menuOptionText} href="#/tokens">
          tokens
        </a>
      </div>

      <div
        className={`${classes.menuOption} ${
          loacation.hash.includes("pools") ? classes.active : ""
        }`}
      >
        <div className={classes.menuOptionIcon}>
          <BsCurrencyExchange size="1.5em" />
        </div>
        <a className={classes.menuOptionText} href="#/pools">
          pools
        </a>
      </div>

      <div
        className={`${classes.menuOption} ${
          loacation.hash.includes("stakes") ? classes.active : ""
        }`}
      >
        <div className={classes.menuOptionIcon}>
          <BsCurrencyExchange size="1.5em" />
        </div>
        <a className={classes.menuOptionText} href="#/stakes">
          stakes
        </a>
      </div>
      <div
        className={`${classes.menuOption} ${
          loacation.hash.includes("assets") ? classes.active : ""
        }`}
      >
        <div className={classes.menuOptionIcon}>
          <FaChild size="1.5em" />
        </div>
        <a className={classes.menuOptionText} href="#/assets">
          my assets
        </a>
      </div>

      <div
        className={`${classes.menuOption} ${
          loacation.hash === "#/" || loacation.hash.includes("swap")
            ? classes.active
            : ""
        }`}
      >
        <div className={classes.menuOptionIcon}>
          <AiOutlineSwap size="1.5em" />
        </div>
        <a className={classes.menuOptionText} href="#/swap">
          swap
        </a>
      </div>

      <div
        className={`${classes.menuOption} ${
          loacation.hash.includes("add-liquidity") ? classes.active : ""
        }`}
      >
        <div className={classes.menuOptionIcon}>
          <FaHandHoldingUsd size="1.5em" />
        </div>
        <a className={classes.menuOptionText} href="#/add-liquidity">
          liquidity
        </a>
      </div>
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
  return (
    <React.Fragment>
      {ReactDOM.createPortal(
        <div className="menu">
          <MenuOptions />
          <Footer />
        </div>,
        document.getElementById("side-menu")
      )}
    </React.Fragment>
  );
};

export default Menu;
