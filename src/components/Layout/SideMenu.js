import React, { useState } from "react";
import ReactDOM from "react-dom";
import Swap from "../Swap/Swap";
import Dialog from "../UI/Dialog";
import classes from "./SideMenu.module.css";

const Content = (props) => {
  return (
    <div className={classes.did} open={!!props.open}>
      <div className={classes.title}>TideBit</div>

      <div className={classes.card}>
        <div className={classes.user}>TideBit User</div>
        <div className={classes.address}>
          0x1F6f37e92AC9ed2292144D0a12E6D8f9b0D2D25b
        </div>
        <div className={classes.value}>3517.48</div>
        <div
          href="https://buy.chainbits.com/"
          traget="_blank"
          className={classes.buy}
        ></div>
        <a href="/#" className={classes.history}>
          History
        </a>
      </div>
      <div className={classes.menu}>
        <a href="/#" className={classes.button + " " + classes.dashboard}>
          Assets
        </a>
        {/* <a href="#/deposit" className={classes.button + " " + classes.dapp}>
          Deposit
        </a> */}
        <a
          // href="#/"
          onClick={props.openDialog}
          className={classes.button + " " + classes.swap}
        >
          Swap
        </a>
        <a href="#/earn" className={classes.button + " " + classes.investing}>
          Earn
        </a>
        {/* <a href="#/withdraw" className={classes.button + " " + classes.lending}>
          Withdraw
        </a> */}

        <hr />

        <a
          href="/#"
          className={classes.button + " " + classes.logout}
          onClick={props.onDisconnect}
        >
          Disconnect
        </a>
      </div>

      <div className={classes.version}>v1.0.0 TideBit © 2021</div>
    </div>
  );
};


const SideMenu = (props) => {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const handleToggle = (_) => {
    setSideMenuOpen((prev) => !prev);
  };
  const [openDialog, setOpenDialog] = useState(false);
  const cancelHandler = () => {
    setOpenDialog(false);
  };

  return (
    <React.Fragment>
      {sideMenuOpen &&
        ReactDOM.createPortal(
          <div className={classes.backdrop} onClick={handleToggle} />,
          document.getElementById("backdrop-root")
        )}
      {openDialog && (
        <Dialog title="Swap" onCancel={cancelHandler} expand={true}>
          <Swap />
        </Dialog>
      )}
      {/* {sideMenuOpen && */}
      {ReactDOM.createPortal(
        <Content
          open={sideMenuOpen}
          openDialog={() => {
            setSideMenuOpen(false);
            setOpenDialog(true);
          }}
          onDisconnect={() => {
            props.onDisconnect();
            handleToggle();
          }}
        />,
        document.getElementById("overlay-root")
      )}
      <button
        className={classes["icon"]}
        onClick={handleToggle}
        open={sideMenuOpen ? "open" : ""}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </React.Fragment>
  );
};

export default SideMenu;
