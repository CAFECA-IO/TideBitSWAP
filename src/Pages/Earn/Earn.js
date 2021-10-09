import React, { useState } from "react";
import Button from "../../components/UI/Button";
import Header from "../../components/UI/Header";
import CreatePool from "../../components/CreatePool/CreatePool";
import classes from "./Earn.module.css";
import Dialog from "../../components/UI/Dialog";
import {
  dummyCoins,
  dummyPools,
  getPoolDetail,
} from "../../constant/dummy-data";
import Liquidity from "../../components/Liquidity/Liquidity";
import PoolDetailOption from "../../components/PoolDetailOption/PoolDetailOption";
import PoolSortingPannel from "../../components/PoolSortingPannel/PoolSortingPannel";
import PoolSearchPannel from "../../components/PoolSearchPannel/PoolSearchPannel";

const parseData = (option, type) => {
  const coins = option.name
    .split("/")
    .map((symbol) => dummyCoins.find((coin) => coin.symbol === symbol));
  const combinations = [coins, [coins[0]], [coins[1]]];
  const details = getPoolDetail(option, type);
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
    maxShareAmount: "1000",
  };
};

const Earn = (props) => {
  const [dialogOpened, setDialogOpened] = useState(false);
  const [dialogContent, setDialogContent] = useState();
  const [matchMyAssets, setMatchMyAssets] = useState(false);
  const [pools, setPools] = useState(dummyPools);

  // get myAssets
  const matchMyAssetsHandler = (checked) => {
    setMatchMyAssets(checked);
    setPools(checked ? dummyPools.slice(1) : dummyPools);
  };
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

  return (
    <React.Fragment>
      {dialogOpened && dialogContent}
      <div className={classes.earn}>
        <Header title="Earn" onDisconnect={props.onDisconnect} />
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
          onSelect={(option) => openDialog("liquidity", option)}
          onCreate={() => openDialog("create")}
          isDetail={true}
          displayTitle={true}
          matchMyAssets={matchMyAssets}
          onMatch={matchMyAssetsHandler}
        />
        {/* <PoolSortingPannel
          data={pools}
          matchMyAssets={matchMyAssets}
          onMatch={matchMyAssetsHandler}
          filterProperty="name"
        >
          {(option) =>
            PoolDetailOption({
              ...option,
              onSelect: () => openDialog("liquidity", option),
            })
          }
        </PoolSortingPannel> */}
      </div>
    </React.Fragment>
  );
};

export default Earn;
