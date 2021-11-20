import React from "react";
import { HashRouter, Route } from "react-router-dom";

import UserProvider from "./store/UserProvider";

import Swap from "./screens/Swap/Swap";
import Market from "./screens/Market/Market";
import Assets from "./screens/Assets/Assets";
import Asset from "./screens/Asset/Asset";
import Earn from "./screens/Earn/Earn";
import Remove from "./screens/Remove/Remove";
import History from "./screens/History/History";
import Invest from "./screens/Invest/Invest";
import Overview from "./screens/Overview/Overview";
import Race from "./screens/Race/Race";

import Menu from "./components/UI/Menu";
import ImportToken from "./screens/ImportToken/ImportToken";

const App = () => {
  return (
    <React.Fragment>
      <Menu />
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
        {/*
        <Route path="/history">
          <History />
        </Route> */}
        <UserProvider>
          <Route path="/assets">
            <Assets />
          </Route>
          <Route path="/asset">
            <Asset />
          </Route>
          <Route path="/swap">
            <Swap />
          </Route>
          <Route path="/earn">
            <Earn />
          </Route>
          <Route path="/redeem">
            <Remove />
          </Route>
          <Route path="/import-token">
            <ImportToken />
          </Route>
          {/* <Route path="/race">
            <Race />
          </Route> */}
        </UserProvider>
      </HashRouter>
    </React.Fragment>
  );
};

export default App;
