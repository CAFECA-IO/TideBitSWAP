import React, { useState, useEffect } from "react";

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
  historyData,
  assetData,
} from "../../constant/dummy-data";
import ChartDetail from "./ChartDetail";
import { randomID } from "../../Utils/utils";

const Home = (props) => {
  const [openSwap, setOpenSwap] = useState(false);
  const [userDetail, setUserDetail] = useState({
    totalBalance: 0.0,
    reward: 0.0,
  });
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    // get user data
    const indentifier = setTimeout(() => {
      setUserDetail({
        totalBalance: 0.0,
        reward: 0.0,
        data: [
          {
            title: "Porfolio",
            portionTitle: "Asset Allocation",
            portion: assetAllocationData,
            detailTitle: "History",
            detail: historyData,
          },
          {
            title: "Assets",
            portionTitle: "Asset Distribution",
            portion: assetDistributionData,
            detailTitle: "Asset List",
            detail: assetData,
          },
        ],
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
        <Header title="Overview"/>
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
        <div className={classes.view}>
          {!!userDetail.data?.length ? (
            userDetail.data.map((data, index) => (
              <ChartDetail
                key={randomID(6)}
                className={`${classes.detail}  ${
                  index === tabIndex ? classes.active : ""
                }`}
                title={data.title}
                portionTitle={data.portionTitle}
                portion={data.portion}
                detailTitle={data.detailTitle}
                detail={data.detail}
              />
            ))
          ) : (
            <LoadingIcon />
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Home;
