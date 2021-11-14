import React, { useContext } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
// import CandleStickChart from "../../components/CandleStickChart/CandleStickChart";
import NetworkDetail from "../../components/UI/NetworkDetail";
import UserContext from "../../store/user-context";
import Pairs from "./Pairs";
import classes from "./Swap.module.css";
import SwapPannel from "./SwapPannel";

const Swap = (props) => {
  const userCtx = useContext(UserContext);
  return (
    <div className={classes.swap}>
      <div className={classes.header}>Swap</div>
      <div className={classes.container}>
        <div className={classes.main}>
          {/* <CandleStickChart/> */}
          <SwapPannel />
        </div>
        <div className={classes.sub}>
          <div className={classes.details}>
            <AssetDetail />
            <NetworkDetail  />
          </div>
          <Pairs pools={userCtx.supportedPools} />
          {/* <Pairs pools={dummyPools} /> */}
        </div>
      </div>
    </div>
  );
};

export default Swap;
