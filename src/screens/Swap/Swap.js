import React, { useContext } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
import SafeMath from "../../Utils/safe-math";
import Pairs from "./Pairs";
import classes from "./Swap.module.css";
import SwapPannel from "./SwapPannel";

const dummyPools = [
  {
    token0: {
      symbol: "ETH",
      iconSrc: "https://www.tidebit.one/icons/eth.png",
    },
    token1: {
      symbol: "USDT",
      iconSrc: "https://www.tidebit.one/icons/usdt.png",
    },
    poolBalanceOfToken0: "123.1",
    poolBalanceOfToken1: "98123.1",
  },
];
const Swap = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const userCtx = useContext(UserContext);
  return (
    <div className={classes.swap}>
      <div className={classes.header}>Swap</div>
      <div className={classes.container}>
        <div className={classes.main}>
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
          {/* <Pairs pools={userCtx.supportedPools}/> */}
          <Pairs pools={dummyPools} />
        </div>
      </div>
    </div>
  );
};

export default Swap;