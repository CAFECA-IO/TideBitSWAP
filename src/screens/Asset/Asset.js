import React, { useContext, useState, useEffect } from "react";
import NetworkDetail from "../../components/UI/NetworkDetail";
import UserContext from "../../store/user-context";
import Histories from "./Histories";

import classes from "./Asset.module.css";
import ConnectorContext from "../../store/connector-context";
import { useLocation } from "react-router";

const Asset = (props) => {
  const userCtx = useContext(UserContext);
  const connectorCtx = useContext(ConnectorContext);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    let token = connectorCtx.supportedTokens.find((asset) =>
      location.pathname.includes(asset.contract)
    );
    console.log(`token:`, token);
    if (!token) {
      setIsLoading(true);
      console.log(
        `location.pathname.replace("/import-token/", ""):`,
        location.pathname.replace("/import-token/", "")
      );
      connectorCtx
        .addToken(location.pathname.replace("/import-token/", ""))
        .then((token) => {
          setToken(token);
          console.log(`token:`, token);
          setIsLoading(false);
        });
    }
    setToken(token);
    return () => {};
  }, [connectorCtx, connectorCtx.supportedTokens, location.pathname]);
  return (
    <div className={classes.asset}>
      <div className={classes.header}>My Assets</div>
      <div className={classes.container}>
        <div className={classes.main}>
          <div className={classes.details}>
            <div className={classes.group}>
              <div className={classes.icon}>
                <img src={token.iconSrc} alt={`${token.symbol}`} />
              </div>
              <div className={classes.title}>{token.symbol}</div>
            </div>
          </div>
          <NetworkDetail />
        </div>
        <div className={classes.sub}>
          <Histories histories={userCtx.histories} />
        </div>
      </div>
    </div>
  );
};

export default Asset;
