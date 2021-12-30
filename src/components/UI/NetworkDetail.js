import React, { useState, useContext, useEffect } from "react";
import ConnectorContext from "../../store/connector-context";
import Dialog from "./Dialog";
import List from "./List";
import Button from "./Button";
import { useHistory, useLocation } from "react-router";
import classes from "./NetworkDetail.module.css";
import ConnectOptions from "./ConnectOptions";

const NetworkOption = (props) => {
  return <div className={classes.option}>{props.chainName}</div>;
};

const NetworkDetail = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [disale, setDisable] = useState(false);
  const [openNetworkOptions, setOpenNetworkOptions] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const [openDialog, setOpenDialog] = useState(false);

  const cancelHandler = () => {
    setOpenDialog(false);
  };
  const connectHandler = () => {
    console.log(`connectHandler`);
    setOpenDialog(true);
  };

  const networkHandler = () => {
    if (disale) return;
    setOpenNetworkOptions(true);
  };

  const changeNetworkHandler = async (selected) => {
    console.log(`changeNetworkHandler selected`, selected);
    setDisable(true);
    setOpenNetworkOptions(false);
    try {
      if (
        location.pathname.includes("/pool/") ||
        location.pathname.includes("/asset/") ||
        location.pathname.includes("/redeem-liquidity/")
      )
        history.push({ pathname: `/` });
      await connectorCtx.switchNetwork(selected);
    } catch (error) {}
    setDisable(false);
  };

  useEffect(() => {
    if (connectorCtx.isConnected && connectorCtx.connectedAccount)
      setOpenDialog(false);
    return () => {};
  }, [connectorCtx.connectedAccount, connectorCtx.isConnected]);
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
      {!window.ethereum && (
        <a
          className={`${classes.network} ${
            props.shrink ? classes.shrink : ""
          } ${classes.highlight}`}
          href="https://metamask.io/download.html"
          target="_blank"
          rel="noreferrer"
        >
          Install metamask
        </a>
      )}
      {window.ethereum &&
        (!connectorCtx.isConnected || !connectorCtx.connectedAccount) && (
          <Button
            className={classes.button}
            onClick={() => setOpenDialog(true)}
          >
            Connect
          </Button>
        )}
      {window.ethereum &&
        connectorCtx.isConnected &&
        connectorCtx.connectedAccount && (
          <div
            className={`${classes.network} ${
              props.shrink ? classes.shrink : ""
            }`}
            onClick={networkHandler}
          >
            <div className={classes.content}>
              <div className={classes.title}>Network</div>
              <div className={classes.header1}>
                {connectorCtx.currentNetwork.chainName}
              </div>
              <div className={classes.paragraph}>Last Block: 13547750</div>
            </div>
            <div className={classes.icon}>
              <img
                src="https://www.tidebit.one/icons/eth.png"
                alt={connectorCtx.currentNetwork.chainName}
              />
            </div>
          </div>
        )}
    </React.Fragment>
  );
};

export default NetworkDetail;
