import React, { useState, useContext, useEffect, Fragment } from "react";
import { HashRouter, Route, useLocation } from "react-router-dom";
import Swap from "./components/Swap/Swap";
import Market from "./screens/Market/Market";
import Assets from "./screens/Assets/Assets";
import Earn from "./screens/Earn/Earn";
import History from "./screens/History/History";
import Invest from "./screens/Invest/Invest";
import Overview from "./screens/Overview/Overview";
import Race from "./screens/Race/Race";

import ConnectorContext from "./store/connector-context";
import UserProvider from "./store/UserProvider";
import Dialog from "./components/UI/Dialog";
import ConnectOptions from "./components/UI/ConnectOptions";

const App = () => {
  const connectorCtx = useContext(ConnectorContext);
  const { hash } = useLocation();
  const [openDialog, setOpenDialog] = useState(false);

  const cancelHandler = () => {
    setOpenDialog(false);
  };
  const connectHandler = () => {
    setOpenDialog(false);
  };

  useEffect(() => {
    console.log(`hash`, hash);
    if (
      (hash.includes("assets") ||
        hash.includes("swap") ||
        hash.includes("earn") ||
        hash.includes("race")) &&
      (!connectorCtx.isConnected || !connectorCtx.connectedAccount)
    ) {
      setOpenDialog(true);
    }

    if (connectorCtx.isConnected && connectorCtx.connectedAccount) {
      setOpenDialog(false);
    }
    return () => {};
  }, [connectorCtx.connectedAccount, connectorCtx.isConnected, hash]);

  return (
    <Fragment>
      {openDialog && (
        <Dialog title="Connect Wallet" onCancel={cancelHandler}>
          <ConnectOptions onClick={connectHandler} />
        </Dialog>
      )}
      <HashRouter>
        <Route exact path="/">
          <Overview />
        </Route>
        <Route path="/market">
          <Market />
        </Route>
        <Route path="/invest">
          <Invest />
        </Route>
        <Route path="/history">
          <History />
        </Route>
        {connectorCtx.isConnected && connectorCtx.connectedAccount && (
          <UserProvider>
            <Route path="/assets">
              <Assets />
            </Route>
            <Route path="/swap">
              <Swap />
            </Route>
            <Route path="/earn">
              <Earn />
            </Route>
            <Route path="/race">
              <Race />
            </Route>
          </UserProvider>
        )}
      </HashRouter>
    </Fragment>
  );
};

export default App;
