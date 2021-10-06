import React, { useState } from "react";
import Button from "../../components/UI/Button";
import Header from "../../components/UI/Header";
import CreatePool from "../../components/CreatePool/CreatePool";
import classes from "./Earn.module.css";
import Dialog from "../../components/UI/Dialog";
import PoolSearchPannel from "../../components/PoolSearchPannel/PoolSearchPannel";
import { dummyPools } from "../../constant/dummy-data";
import AddLiquidity from "../../components/AddLiquidity/AddLiquidity";

const Earn = (props) => {
  const [dialogOpened, setDialogOpened] = useState(false);
  const [dialogContent, setDialogContent] = useState();
  const [selectedPool, setSelectedPool] = useState();

  const closeDialog = () => {
    setDialogOpened(false);
  };
  const openDialog = (content) => {
    switch (content) {
      case "create":
        setDialogOpened(true);
        setDialogContent(<CreatePool />);
        break;
      case "add":
        setDialogOpened(true);
        setDialogContent(<AddLiquidity pair={selectedPool} />);
        break;
      default:
        break;
    }
  };
  const selectedHandler = (option) => {
    console.log(Object.values(option));
    // setSelectedPool(option);
    // openDialog("add");
  };

  return (
    <React.Fragment>
      {dialogOpened && (
        <Dialog title="Create Pool" onCancel={closeDialog}>
          {dialogContent}
        </Dialog>
      )}
      <div className={classes.earn}>
        <Header
          title="Earn"
          leading="<"
          back="/home"
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
          selected={selectedPool}
          onSelect={selectedHandler}
          onCreate={() => openDialog("create")}
        />
      </div>
    </React.Fragment>
  );
};

export default Earn;
