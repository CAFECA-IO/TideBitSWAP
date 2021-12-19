import React, { useContext, useState, useEffect } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import Histories from "../../components/UI/Histories";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import SafeMath from "../../Utils/safe-math";
import classes from "./Assets.module.css";
import Invests from "./Invests";
import Tokens from "./Tokens";

const Assets = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [assets, setAssets] = useState([]);
  const [invests, setInvests] = useState([]);

  useEffect(() => {
    if (connectorCtx.isConnected && connectorCtx.supportedTokens.length > 0) {
      setAssets(
        connectorCtx.supportedTokens.filter((token) =>
          SafeMath.gt(token.balanceOf, 0)
        )
      );
    } else if (!connectorCtx.isConnected) {
      // console.log(
      //   `assets tokens`,
      //   connectorCtx.supportedTokens.filter((token) =>
      //     SafeMath.gt(token.balanceOf, 0)
      //   )
      // );
      setAssets([]);
    }
    return () => {};
  }, [connectorCtx.isConnected, connectorCtx.supportedTokens]);

  useEffect(() => {
    if (connectorCtx.isConnected && connectorCtx.supportedPools.length > 0) {
      setInvests(
        connectorCtx.supportedPools.filter((pool) => SafeMath.gt(pool.share, 0))
      );
    } else if (!connectorCtx.isConnected) {
      // console.log(
      //   `assets invest`,
      //   connectorCtx.supportedPools.filter((pool) =>
      //     SafeMath.gt(pool.balanceOf, 0)
      //   )
      // );
      setInvests([]);
    }
    return () => {};
  }, [connectorCtx.isConnected, connectorCtx.supportedPools]);

  return (
    <div className={classes.assets}>
      <div className={classes.header}>My Assets</div>
      <div className={classes.container}>
        <div className={classes.main}>
          <Tokens tokens={assets} isLoading={connectorCtx.isLoading} />
          <Invests invests={invests} isLoading={connectorCtx.isLoading} />
        </div>
        <div className={classes.sub}>
          <div className={classes.details}>
            <AssetDetail />
            <NetworkDetail />
          </div>
          <Histories
            histories={connectorCtx.isConnected ? connectorCtx.histories : []}
            isLoading={connectorCtx.isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Assets;
