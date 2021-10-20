import React, { useState, useContext } from "react";

import classes from "./Home.module.css";
import Header from "../../components/Layout/Header";
import ConfidentialPannel from "./ConfidentialPannel";
import Navigator from "./Navigator";
import Dialog from "../../components/UI/Dialog";
import LoadingIcon from "../../components/UI/LoadingIcon";
import Swap from "../../components/Swap/Swap";
import UserContext from "../../store/user-context";
import DonutChart from "../../components/DonutChart/DonutChart";
import List from "../../components/UI/List";
import AssetTile from "./AssetTile";

const Home = () => {
  const userCtx = useContext(UserContext);
  const [openSwap, setOpenSwap] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
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
            data={`$ ${userCtx.totalBalance}`}
          />
          <ConfidentialPannel
            title="Total Rewards"
            data={`$ ${userCtx.reward}`}
          />
        </div>
        <Navigator openSwap={() => setOpenSwap(true)} />
        <div className={classes.bar}>
          {!!userCtx.data?.length &&
            userCtx.data.map((data, index) => (
              <div
                key={data.title + index}
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
            {!!userCtx.data?.length ? (
              userCtx.data.map((data, index) => (
                <DonutChart
                  key={data.portionTitle + index}
                  className={` ${index === tabIndex ? classes.active : ""}`}
                  title={data.portionTitle}
                  data={data.portion}
                />
              ))
            ) : (
              <LoadingIcon />
            )}
          </div>
          <List
            title="Asset List"
            className={classes.list}
            data={userCtx.assets}
          >
            {AssetTile}
          </List>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Home;
