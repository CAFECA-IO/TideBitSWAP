import React,{useState} from "react";
import { HashRouter, Route } from "react-router-dom";

import Swap from "./screens/Swap/Swap";
import Tokens from "./screens/Tokens/Tokens";
import Assets from "./screens/Assets/Assets";
import AddLiquidity from "./screens/AddLiquidity/AddLiquidity";
import Remove from "./screens/Remove/Remove";
import Pools from "./screens/Pools/Pools";
import Overview from "./screens/Overview/Overview";

import Menu from "./components/UI/Menu";
import DetailAsset from "./screens/Detail/DetailAsset";
import DetailPool from "./screens/Detail/DetailPool";
import Navigator from "./components/UI/Navigator";
import Stakes from "./screens/Stakes/Stakes";

const App = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  return (
    <React.Fragment>
      
      <Menu />
      <Navigator />
      <HashRouter>
        <Route exact path="/">
          <Swap />
        </Route>
        <Route exact path="/charts">
          <Overview />
        </Route>
        <Route path="/stakes">
          <Stakes />
        </Route>
        <Route path="/tokens">
          <Tokens />
        </Route>
        <Route path="/pools">
          <Pools />
        </Route>
        <Route path="/pool">
          <DetailPool />
        </Route>
        {/*
        <Route path="/history">
          <History />
        </Route> */}
        {/* <UserProvider> */}
        <Route path="/assets">
          <Assets />
        </Route>
        <Route path="/asset">
          <DetailAsset />
        </Route>
        <Route path="/swap">
          <Swap />
        </Route>
        <Route path="/add-liquidity">
          <AddLiquidity />
        </Route>
        <Route path="/redeem-liquidity">
          <Remove />
        </Route>
        {/* <Route path="/import-token">
            <ImportToken />
          </Route> */}
        {/* <Route path="/race">
            <Race />
          </Route> */}
        {/* </UserProvider> */}
      </HashRouter>
    </React.Fragment>
  );
};

export default App;
