import React, { useContext, Fragment } from "react";
import { HashRouter, Route } from "react-router-dom";

import Landing from "./pages/Landing/Landing";
import Home from "./pages/Home/Home";
import Earn from "./pages/Earn/Earn";
import Deposit from "./pages/Deposit/Deposit";
import Withdraw from "./pages/Withdraw/Withdraw";
import AuthContext from "./store/auth-context";
import UserProvider from "./store/UserProvider";

function App() {
  const authCtx = useContext(AuthContext);
  return (
    <Fragment>
      {authCtx.isConnected ? (
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
