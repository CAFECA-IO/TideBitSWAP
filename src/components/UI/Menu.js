import React from "react";
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

import classes from "./Menu.module.css";

const MenuOptions = (props) => {
  return (
    <div>
      <div className={classes.brand}>
        <Logo /> TideBit
      </div>
      <div className={classes.menuOption}>
        <div className={classes.menuOptionIcon}>
          <AiOutlineFundProjectionScreen size="1.5em" />
        </div>
        <div className={classes.menuOptionText}>overview</div>
      </div>

      <div className={classes.menuOption}>
        <div className={classes.menuOptionIcon}>
          <BiCoin size="1.5em" />
        </div>
        <div className={classes.menuOptionText}>tokens</div>
      </div>

      <div className={classes.menuOption}>
        <div className={classes.menuOptionIcon}>
          <BsCurrencyExchange size="1.5em" />
        </div>
        <div className={classes.menuOptionText}>pairs</div>
      </div>

      <div className={classes.menuOption}>
        <div className={classes.menuOptionIcon}>
          <AiOutlineLogin size="1.5em" />
        </div>
        <div className={classes.menuOptionText}>login</div>
      </div>

      <div className={classes.menuOption}>
        <div className={classes.menuOptionIcon}>
          <FaChild size="1.5em" />
        </div>
        <div className={classes.menuOptionText}>my assets</div>
      </div>

      <div className={classes.menuOption}>
        <div className={classes.menuOptionIcon}>
          <AiOutlineSwap size="1.5em" />
        </div>
        <div className={classes.menuOptionText}>swap</div>
      </div>

      <div className={classes.menuOption}>
        <div className={classes.menuOptionIcon}>
          <FaHandHoldingUsd size="1.5em" />
        </div>
        <div className={classes.menuOptionText}>earn</div>
      </div>

      <div className={classes.menuOption}>
        <div className={classes.menuOptionIcon}>
          <BiCrown size="1.5em" />
        </div>
        <div className={classes.menuOptionText}>race</div>
      </div>

      <div className={classes.menuOption}>
        <div className={classes.menuOptionIcon}>
          <AiOutlineLogout size="1.5em" />
        </div>
        <div className={classes.menuOptionText}>logout</div>
      </div>
    </div>
  );
};

const Footer = (props) => {
  return (
    <div className={classes.footer}>
      <div>v0.9.0 BETA</div>
      <div>©2021 TideBit. All rights reserved.</div>
      <div>Power By CAFECA</div>
    </div>
  );
};

const Menu = (props) => {
  return (
    <div className={classes.sideMenu}>
      <MenuOptions />
      <Footer />
    </div>
  );
};

export default Menu;
