import React, { useState, useEffect, useContext } from "react";
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

import Snackbar from "@mui/material/Snackbar";
import ConnectorContext from "./store/connector-context";
import ErrorDialog from "./components/UI/ErrorDialog";

const App = () => {
  const connectorCtx = useContext(ConnectorContext);
  const [message, setMessage] = useState(null);
  const [openNoticeSnackbar, setOpenNoticeSnackbar] = useState(false);
  const [openNoticeErrorSnackbar, setOpenNoticeErrorSnackbar] = useState(false);
  const [openTransactionSnackbar, setOpenTransactionSnackbar] = useState(false);
  const [error, setError] = useState(null);
  const [noticeError, setNoticeError] = useState(null);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);

  useEffect(() => {
    setMessage(connectorCtx.notice);
    setOpenNoticeSnackbar(true);
    return () => {};
  }, [connectorCtx.notice]);

  useEffect(() => {
    if (connectorCtx.noticeError?.message) {
      setNoticeError(connectorCtx.noticeError);
      setOpenNoticeErrorSnackbar(true);
    }
    return () => {};
  }, [connectorCtx.noticeError]);

  useEffect(() => {
    if (connectorCtx.error) {
      setError(connectorCtx.error);
      setOpenErrorDialog(true);
    }
    return () => {};
  }, [connectorCtx.error]);

  return (
    <React.Fragment>
      {openNoticeSnackbar && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={openNoticeSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenNoticeSnackbar(false)}
          message={message}
        />
      )}
      {openNoticeErrorSnackbar && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          open={openNoticeErrorSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenNoticeErrorSnackbar(false)}
          message={noticeError?.message || noticeError?.toString()}
        />
      )}
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
