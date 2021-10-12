import React, { useState } from "react";
import Swap from "../Swap/Swap";
import Dialog from "../UI/Dialog";

import classes from "./SideMenu.module.css";

const SideMenu = (props) => {
  const [openDialog, setOpenDialog] = useState(false);

  const clickHandler = () => {
    setOpenDialog(true);
    props.onClose();
  };
  return (
    <React.Fragment>
      {openDialog && (
        <Dialog
          title="Swap"
          onCancel={() => setOpenDialog(false)}
          expand={true}
        >
          <Swap />
        </Dialog>
      )}
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
            onClick={clickHandler}
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
    </React.Fragment>
  );
};

export default SideMenu;
