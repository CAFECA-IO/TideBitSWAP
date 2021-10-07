import React, { useState } from "react";
import Button from "../../components/UI/Button";
import Header from "../../components/UI/Header";
import CreatePool from "../../components/CreatePool/CreatePool";
import classes from "./Earn.module.css";
import Dialog from "../../components/UI/Dialog";
import PoolSearchPannel from "../../components/PoolSearchPannel/PoolSearchPannel";
import { dummyCoins, dummyPools } from "../../constant/dummy-data";
import Liquidity from "../../components/Liquidity/Liquidity";

const getDetail = (option, type) => {
  switch (type) {
    case "Provide":
      return [
        {
          title: "Current pool size",
          value: option.composition,
        },
        {
          title: "Total yield",
          explain: "*Based on 24hr volume annualized.",
          value: option.yield,
        },
      ];
    case "Take":
      return [
        {
          title: "Amount",
          value: "--",
        },
        {
          title: "Price",
          explain:
            "This price is an approximate value, and the final price depends on the amount of tokens in the liquid pool when you remove liquidity.",
          value: "--",
        },
        {
          title: "Portion of the pool",
          explain: "Removed portion/​current total pool portion",
          value: "--",
        },
        {
          title: "Current pool size",
          value: option.composition,
        },
        {
          title: "Your Current Portion",
          value: "--",
        },
        {
          title: "Current portion composites",
          value: "--",
        },
      ];
    default:
      break;
  }
};

const parseData = (option, type) => {
  console.log(type);
  const coins = option.name
    .split("/")
    .map((symbol) => dummyCoins.find((coin) => coin.symbol === symbol));
  const combinations = [coins, [coins[0]], [coins[1]]];
  const details = getDetail(option, type);
  // get selected pool max shareAmount
  return {
    selected: option,
    coins: coins,
    combinations: combinations,
    radioOption: [
      coins[0].symbol + " + " + coins[1].symbol,
      coins[0].symbol,
      coins[1].symbol,
    ],
    details: details,
    maxShareAmount: '1000'
  };
};

const Earn = (props) => {
  const [dialogOpened, setDialogOpened] = useState(false);
  const [dialogContent, setDialogContent] = useState();
  const closeDialog = () => {
    setDialogOpened(false);
  };
  const openDialog = (content, data) => {
    switch (content) {
      case "create":
        setDialogContent(
          <Dialog title="Create Pool" onCancel={closeDialog} expand={true}>
            <CreatePool />
          </Dialog>
        );
        setDialogOpened(true);
        break;
      case "liquidity":
        setDialogContent(
          <Dialog title="Liquidity" onCancel={closeDialog} expand={true}>
            <Liquidity selected={data} parseData={parseData} />
          </Dialog>
        );
        setDialogOpened(true);
        break;
      default:
        break;
    }
  };
  const selectedHandler = (option, type) => {
    openDialog("liquidity", option);
  };

  return (
    <React.Fragment>
      {dialogOpened && dialogContent}
      <div className={classes.earn}>
        <Header
          title="Earn"
          onDisconnect={props.onDisconnect}
        />
        <div className={classes.header}>
          <div className={classes.title}>Liquidity</div>
          <div className={classes.button}>
            <Button type="button" onClick={() => openDialog("create")}>
              Create
            </Button>
          </div>
        </div>

        <PoolSearchPannel
          options={dummyPools}
          onSelect={selectedHandler}
          onCreate={() => openDialog("create")}
          isDetail={true}
          displayTitle={true}
        />
      </div>
    </React.Fragment>
  );
};

export default Earn;
