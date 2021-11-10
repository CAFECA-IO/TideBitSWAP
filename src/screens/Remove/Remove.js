import React, { useContext } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
import SafeMath from "../../Utils/safe-math";
import Pairs from "./Pairs";
import classes from "./Remove.module.css";
import RemovePannel from "./RemovePannel";

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
    yield: "71.8",
    volume: "18.9m",
    share: '8.32m',
    rewards: '4.31k'
  }
];
const Remove = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const userCtx = useContext(UserContext);
  return (
    <div className={classes.earn}>
      <div className={classes.header}>Remove</div>
      <div className={classes.container}>
        <div className={classes.main}>
          <RemovePannel pool={dummyPools[0]}/>
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

export default Remove;
