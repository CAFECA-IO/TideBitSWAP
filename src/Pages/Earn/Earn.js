import React, { useState } from "react";
import Button from "../../components/UI/Button";
import Header from "../../components/Layout/Header";
import CreatePool from "../../components/CreatePool/CreatePool";
import classes from "./Earn.module.css";
import Dialog from "../../components/UI/Dialog";
import { dummyPools, liquidityType } from "../../constant/dummy-data";
import Liquidity from "../../components/Liquidity/Liquidity";
import PoolSearchPannel from "../../components/PoolSearchPannel/PoolSearchPannel";

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
            <Liquidity
              selectedType={liquidityType.PROVIDE}
              selectedPool={data}
              providePools={dummyPools}
              takePools={dummyPools.slice(1)}
            />
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
        <Header title="Earn"/>
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
          onClick={(option) => openDialog("liquidity", option)}
          onCreate={() => openDialog("create")}
          filterProperty="name"
        />
      </div>
    </React.Fragment>
  );
};

export default Earn;
