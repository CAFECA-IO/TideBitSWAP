import React, { useState, useEffect, useContext } from "react";
import { HashRouter, Route } from "react-router-dom";
import ReactGA from 'react-ga';

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

import ConnectorContext from "./store/connector-context";
import { useSnackbar } from "notistack";
import Snackbar from "@mui/material/Snackbar";
import ErrorDialog from "./components/UI/ErrorDialog";

const App = () => {
  const trackingId = "G-151PY7K930";
  const connectorCtx = useContext(ConnectorContext);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [error, setError] = useState(null);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);

  useEffect(()=>{
    ReactGA.initialize(trackingId);
    return ()=>{}
  },[])

  useEffect(() => {
    if (!!connectorCtx.notice) enqueueSnackbar(connectorCtx.notice);
    return () => {};
  }, [connectorCtx.notice, enqueueSnackbar]);

  useEffect(() => {
    if (connectorCtx.noticeError?.message) {
      enqueueSnackbar(connectorCtx.noticeError?.message, {
        variant: "error",
      });
    }
    return () => {};
  }, [connectorCtx.noticeError, enqueueSnackbar]);

  useEffect(() => {
    if (connectorCtx.error) {
      setError(connectorCtx.error);
      setOpenErrorDialog(true);
    }
    return () => {};
  }, [connectorCtx.error]);

  return (
    <React.Fragment>
      {openErrorDialog && (
        <ErrorDialog
          message={error?.message || error?.toString()}
          onConfirm={() => setOpenErrorDialog(false)}
        />
      )}
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
      </HashRouter>
    </React.Fragment>
  );
};

export default App;
