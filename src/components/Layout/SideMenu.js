import React, { useContext, useState } from "react";
import ConnectorContext from "../../store/connector-context";
import Swap from "../Swap/Swap";
import Dialog from "../UI/Dialog";
import List from "../UI/List";

import classes from "./SideMenu.module.css";
import packageJson from "../../../package.json";

const NetworkOption = (props) => {
  return <div className={classes.option}>{props.chainName}</div>;
};

const SideMenu = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [disale, setDisable] = useState(false);
  const [openNetworkOptions, setOpenNetworkOptions] = useState(false);
  const networkHandler = () => {
    if (disale) return;
    setDisable(true);
    props.onClose();
    setOpenNetworkOptions(true);
  };

  const changeNetworkHandler = async (selected) => {
    console.log(`changeNetworkHandler selected`, selected);

    setOpenNetworkOptions(false);
    try {
      await connectorCtx.switchNetwork(selected);
    } catch (error) {}
    setDisable(false);
  };

  const clickHandler = () => {
    setOpenDialog(true);
    props.onClose();
  };
  return (
    <React.Fragment>
      {openNetworkOptions && (
        <Dialog
          title="Network Options"
          onCancel={() => setOpenNetworkOptions(false)}
        >
          <List
            data={connectorCtx.supportedNetworks}
            onClick={changeNetworkHandler}
          >
            {NetworkOption}
          </List>
        </Dialog>
      )}
      {openDialog && (
        <Dialog
          title="Swap"
          onCancel={() => setOpenDialog(false)}
          expand={true}
        >
          <Swap onClose={() => setOpenDialog(false)} />
        </Dialog>
      )}
      <div className={classes.did} open={!!props.open}>
        <div className={classes.title}>TideBit</div>
        <div className={classes.card}>
          <div className={classes.user}>TideBit User</div>
          <div className={classes.address}>{connectorCtx.connectedAccount}</div>
          <div className={classes.value}>0.0</div>
          <div
            href="https://buy.chainbits.com/"
            traget="_blank"
            className={classes.buy}
          ></div>
          <div onClick={networkHandler} className={classes.network}>
            Network
          </div>
        </div>
        <div className={classes.menu}>
          <a href="/#" className={classes.button + " " + classes.dashboard}>
            Assets
          </a>
          {/* <a href="#/deposit" className={classes.button + " " + classes.dapp}>
          Deposit
        </a> */}
          <div
            // href="#/"
            onClick={clickHandler}
            className={classes.button + " " + classes.swap}
          >
            Swap
          </div>
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
        <div className={classes.version}>
          v{packageJson.version}(Alpha) TideBit © 2021
        </div>
      </div>
    </React.Fragment>
  );
};

export default SideMenu;
