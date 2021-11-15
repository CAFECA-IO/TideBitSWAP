import React, { useContext } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import NetworkDetail from "../../components/UI/NetworkDetail";
import { transactionType } from "../../constant/constant";
import UserContext from "../../store/user-context";
import SafeMath from "../../Utils/safe-math";
import { randomID } from "../../Utils/utils";
import classes from "./Assets.module.css";
import Histories from "./Histories";
import Invests from "./Invests";
import Tokens from "./Tokens";

// const tokens = [
//   {
//     id: `${randomID(6)}`,
//     iconSrc: "https://www.tidebit.one/icons/eth.png",
//     symbol: "ETH",
//     price: "4534.73",
//     priceChange: "-0.71",
//     balance: "2.1",
//   },
// ];
// const invests = [
//   {
//     id: `${randomID(6)}`,
//     iconSrc: "https://www.tidebit.one/icons/usdt.png",
//     symbol: "USDT",
//     share: "2.1m",
//     tvl: "1.2b",
//     reward: "90k",
//     irr: "3",
//   },
// ];

const Assets = (props) => {
  const userCtx = useContext(UserContext);
  return (
    <div className={classes.assets}>
      <div className={classes.header}>My Assets</div>
      <div className={classes.container}>
        <div className={classes.main}>
          <Tokens tokens={userCtx.assets} />
          <Invests
            invests={userCtx.supportedPools.filter((pool) =>
              SafeMath.gt(pool.share, "0")
            )}
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
