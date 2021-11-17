import React, { useContext } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import NetworkDetail from "../../components/UI/NetworkDetail";
import UserContext from "../../store/user-context";
import classes from "./Assets.module.css";
import Histories from "./Histories";
import Invests from "./Invests";
import Tokens from "./Tokens";


const Assets = (props) => {
  const userCtx = useContext(UserContext);
  return (
    <div className={classes.assets}>
      <div className={classes.header}>My Assets</div>
      <div className={classes.container}>
        <div className={classes.main}>
          <Tokens
            tokens={userCtx.assets}
            isLoading={userCtx.isLoading}
          />
          <Invests
            invests={userCtx.invests}
            isLoading={userCtx.isLoading}
          />
        </div>
        <div className={classes.sub}>
          <div className={classes.details}>
            <AssetDetail />
            <NetworkDetail />
          </div>
          <Histories histories={userCtx.histories} />
        </div>
      </div>
    </div>
  );
};

export default Assets;
