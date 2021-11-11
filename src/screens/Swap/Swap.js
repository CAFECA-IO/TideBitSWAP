import React, { useContext } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import CandleStickChart from "../../components/CandleStickChart/CandleStickChart";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
import SafeMath from "../../Utils/safe-math";
import Pairs from "./Pairs";
import classes from "./Swap.module.css";
import SwapPannel from "./SwapPannel";

const Swap = (props) => {
  const connectorCtx = useContext(ConnectorContext);
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
            <AssetDetail
              account={connectorCtx.connectedAccount}
              balance={`${userCtx.totalBalance} ETH`}
              balanceInFiat={`${userCtx.fiat.dollarSign} ${SafeMath.mult(
                userCtx.totalBalance,
                userCtx.fiat.exchangeRate
              )}`}
            />
            <NetworkDetail chainName={connectorCtx.currentNetwork.chainName} />
          </div>
          <Pairs pools={userCtx.supportedPools}/>
          {/* <Pairs pools={dummyPools} /> */}
        </div>
      </div>
    </div>
  );
};

export default Swap;
