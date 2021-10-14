import React, { useContext, Fragment } from "react";
import { HashRouter, Route } from "react-router-dom";

import Landing from "./Pages/Landing/Landing";
import Home from "./Pages/Home/Home";
import Earn from "./Pages/Earn/Earn";
import Deposit from "./Pages/Deposit/Deposit";
import Withdraw from "./Pages/Withdraw/Withdraw";
import ConnectorContext from "./store/connector-context";
import UserProvider from "./store/UserProvider";

function App() {
  const connectorCtx = useContext(ConnectorContext);
  return (
    <Fragment>
      {connectorCtx.isConnected ? (
        <UserProvider>
          <HashRouter>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/deposit">
              <Deposit />
            </Route>
            <Route path="/earn">
              <Earn />
            </Route>
            <Route path="/withdraw">
              <Withdraw />
            </Route>
          </HashRouter>
        </UserProvider>
      ) : (
        <Landing />
      )}
    </Fragment>
  );
}

export default App;
