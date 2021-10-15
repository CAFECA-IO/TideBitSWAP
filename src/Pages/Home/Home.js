import React, { useState, useEffect, useContext } from "react";

import classes from "./Home.module.css";
import Header from "../../components/Layout/Header";
import ConfidentialPannel from "./ConfidentialPannel";
import Navigator from "./Navigator";
import Dialog from "../../components/UI/Dialog";
import LoadingIcon from "../../components/UI/LoadingIcon";
import Swap from "../../components/Swap/Swap";
import {
  assetDistributionData,
  assetAllocationData,
  // historyData,
  // assetData,
} from "../../constant/dummy-data";
import { getPoolList, randomID } from "../../Utils/utils";
import UserContext from "../../store/user-context";
import DonutChart from "../../components/DonutChart/DonutChart";
import List from "../../components/UI/List";
import AssetTile from "./AssetTile";

const defaultUserState = {
  totalBalance: 0.0,
  reward: 0.0,
  data: [],
  assets: [],
};

const Home = () => {
  const userCtx = useContext(UserContext);
  const [openSwap, setOpenSwap] = useState(false);
  const [userDetail, setUserDetail] = useState(defaultUserState);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    // get user data
    const indentifier = setTimeout(() => {
      setUserDetail({
        totalBalance: userCtx.totalBalance,
        reward: userCtx.totalReward,
        data: [
          {
            title: "Porfolio",
            portionTitle: "Asset Allocation",
            portion: assetAllocationData,
          },
          {
            title: "Assets",
            portionTitle: "Asset Distribution",
            portion: assetDistributionData,
          },
        ],
        assets: userCtx.assets, //"Asset List"
      });
    }, 500);

    return () => clearTimeout(indentifier);
  }, []);

  return (
    <React.Fragment>
      {openSwap && (
        <Dialog title="Swap" onCancel={() => setOpenSwap(false)} expand={true}>
          <Swap />
        </Dialog>
      )}
      <div className={classes.home}>
        <Header title="Overview" />
        <div className={classes.overview}>
          <ConfidentialPannel
            title="Total Balance"
            data={`$ ${userDetail.totalBalance}`}
          />
          <ConfidentialPannel
            title="Total Rewards"
            data={`$ ${userDetail.reward}`}
          />
        </div>
        <Navigator openSwap={() => setOpenSwap(true)} />
        <div className={classes.bar}>
          {!!userDetail.data?.length &&
            userDetail.data.map((data, index) => (
              <div
                key={randomID(6)}
                className={`${classes.tab} ${
                  index === tabIndex ? classes.active : ""
                }`}
                onClick={() => setTabIndex(index)}
              >
                {data.title}
              </div>
            ))}
        </div>
        <div className={classes.detail}>
          <div className={classes.view}>
            {!!userDetail.data?.length ? (
              userDetail.data.map((data, index) => (
                <div
                  key={randomID(6)}
                  className={` ${index === tabIndex ? classes.active : ""}`}
                >
                  <DonutChart title={data.portionTitle} data={data.portion} />
                </div>
              ))
            ) : (
              <LoadingIcon />
            )}
          </div>
          {!!userDetail.assets?.length && (
            <List
              title="Asset List"
              className={classes.list}
              data={userDetail.assets}
            >
              {AssetTile}
            </List>
          )}
        </div>
        <button onClick={() => getPoolList(10, 10)}>test</button>
      </div>
    </React.Fragment>
  );
};

export default Home;
