import React, { useContext } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
import SafeMath from "../../Utils/safe-math";
import { randomID } from "../../Utils/utils";
import classes from "./Assets.module.css";
import Histories from "./Histories";
import Invests from "./Invests";
import Tokens from "./Tokens";

const tokens = [
  {
    id: randomID(6),
    iconSrc: "https://www.tidebit.one/icons/eth.png",
    symbol: "ETH",
    price: "4534.73",
    priceChange: "-0.71",
    balance: "2.1",
  },
];
const invests = [
  {
    id: randomID(6),
    iconSrc: "https://www.tidebit.one/icons/usdt.png",
    symbol: "USDT",
    share: "2.1m",
    tvl: "1.2b",
    reward: "90k",
  },
];
const histories = [
  {
    id: randomID(6),
    type: "Swap",
    tokenA: {
      symbol: "ETH",
      amount: "1.63k",
    },
    tokenB: {
      symbol: "WBTC",
      amount: "0.4",
    },
    time: "3 hrs ago",
  },
];

const Assets = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const userCtx = useContext(UserContext);
  return (
    <div className={classes.assets}>
      <div className={classes.header}>My Assets</div>
      <div className={classes.container}>
        <div className={classes.main}>
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
          <Tokens tokens={tokens} />
          <Invests invests={invests} />
        </div>
        <div className={classes.sub}>
          <Histories histories={histories} />
        </div>
      </div>
    </div>
  );
};

export default Assets;
