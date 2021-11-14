import React, { useState, useContext } from "react";
import ConnectorContext from "../../store/connector-context";
import Dialog from "./Dialog";
import List from "./List";

import classes from "./NetworkDetail.module.css";

const NetworkOption = (props) => {
  return <div className={classes.option}>{props.chainName}</div>;
};

const NetworkDetail = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [disale, setDisable] = useState(false);
  const [openNetworkOptions, setOpenNetworkOptions] = useState(false);

  const networkHandler = () => {
    if (disale) return;
    setDisable(true);
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
      <div className={classes.network} onClick={networkHandler}>
        <div className={classes.content}>
          <div className={classes.title}>Network</div>
          <div className={classes.header1}>{connectorCtx.currentNetwork.chainName}</div>
          <div className={classes.paragraph}>Last Block: 13547750</div>
        </div>
        <div className={classes.icon}>
          <img
            src="https://www.tidebit.one/icons/eth.png"
            alt={connectorCtx.currentNetwork.chainName}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default NetworkDetail;
