import React, { useState } from "react";

import classes from "./Home.module.css";
import Header from "../UI/Header";
import Button from "../UI/Button";
import ConfidentialPannel from "./ConfidentialPannel";
import TabView from "./TabView";
import Porfolio from "./Porfolio";
import Assets from "./Assets";
import Swap from "../Swap/Swap";
import CreatePool from "../CreatePool/CreatePool";

const Home = (props) => {
  const tabs = ["Porfolio", "Assets"];
  const [open, setOpen] = useState(false);
  const [openPage, setOpenPage] = useState(null);
  const closeHandler = () => {
    setOpen(false);
  };
  const clickHandler = (pageName) => {
    console.log(pageName);
    setOpen(true);
    switch (pageName) {
      case "swap":
        setOpenPage(<Swap onClose={closeHandler} />);
        break;
      case "earn":
        setOpenPage(<CreatePool onClose={closeHandler} />);
        break;
      default:
        setOpen(false);
        break;
    }
  };

  return (
    <React.Fragment>
      {open && openPage}
      <div className={classes.home}>
        <Header title="Overview" onDisconnect={props.onDisconnect} />
        <div className={classes.overview}>
          <ConfidentialPannel title="Total Balance" data="$ 0.0" />
          <ConfidentialPannel title="Total Rewards" data="$ 0.0" />
        </div>
        <div className={classes.navigators}>
          <Button onClick={() => clickHandler("deposite")}>Deposite</Button>
          <Button onClick={() => clickHandler("earn")}>Earn</Button>
          <Button onClick={() => clickHandler("swap")}>Swap</Button>
          <Button onClick={() => clickHandler("withdraw")}>Withdraw</Button>
        </div>
        <TabView tabs={tabs}>
          <Porfolio />
          <Assets />
        </TabView>
      </div>
    </React.Fragment>
  );
};

export default Home;
