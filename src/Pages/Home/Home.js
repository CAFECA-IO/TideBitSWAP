import React, { useState } from "react";

import Header from "../../components/UI/Header";

import Swap from "../../components/Swap/Swap";

import ConfidentialPannel from "./ConfidentialPannel";
import TabView from "./TabView";
import Porfolio from "./Porfolio";
import Assets from "./Assets";
import classes from "./Home.module.css";
import Dialog from "../../components/UI/Dialog";

const Home = (props) => {
  const tabs = ["Porfolio", "Assets"];
  const [openDialog, setOpenDialog] = useState(false);
  const cancelHandler = () => {
    setOpenDialog(false);
  };
  const clickHandler = (content) => {
    switch (content) {
      case "swap":
        setOpenDialog(true);
        break;
      default:
        break;
    }
  };

  return (
    <React.Fragment>
      {openDialog && (
        <Dialog
          title="Swap"
          onCancel={cancelHandler}
          expand={true}
        >
          <Swap />
        </Dialog>
      )}
      <div className={classes.home}>
        <Header title="Overview" onDisconnect={props.onDisconnect} />
        <div className={classes.overview}>
          <ConfidentialPannel title="Total Balance" data="$ 0.0" />
          <ConfidentialPannel title="Total Rewards" data="$ 0.0" />
        </div>
        <ul className={classes.navigators}>
          <li>
            <a href="#/deposit">Deposit</a>
          </li>
          <li>
            <a href="#/earn">Earn</a>
          </li>
          <li onClick={() => clickHandler("swap")}>Swap</li>
          <li>
            <a href="#/withdraw">Withdraw</a>
          </li>
        </ul>
        <TabView tabs={tabs}>
          <Porfolio />
          <Assets />
        </TabView>
      </div>
    </React.Fragment>
  );
};

export default Home;
