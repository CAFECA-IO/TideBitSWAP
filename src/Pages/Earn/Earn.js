import React, { useContext, useEffect, useState } from "react";
import Button from "../../components/UI/Button";
import Header from "../../components/Layout/Header";
import CreatePool from "../../components/CreatePool/CreatePool";
import classes from "./Earn.module.css";
import Dialog from "../../components/UI/Dialog";
import Liquidity from "../../components/Liquidity/Liquidity";
import PoolSearchPannel from "../../components/PoolSearchPannel/PoolSearchPannel";
import { liquidityType } from "../../constant/constant";
import ConnectorContext from "../../store/connector-context";

const Earn = () => {
  const [dialogOpened, setDialogOpened] = useState(false);
  const [dialogContent, setDialogContent] = useState();
  const connectorCtx = useContext(ConnectorContext);
  const [providePoolOptions, setProvidePoolOptions] = useState(
    connectorCtx.supportedPools
  );
  const [takePoolOptions, setTakePoolOptions] = useState(
    connectorCtx.supportedPools.filter((pool) => +pool.share > 0)
  );

  useEffect(() => {
    setProvidePoolOptions(connectorCtx.supportedPools);
    setTakePoolOptions(
      connectorCtx.supportedPools.filter((pool) => +pool.share > 0)
    );
    return () => {};
  }, [connectorCtx.supportedPools]);

  const closeDialog = () => {
    setDialogOpened(false);
  };
  const openDialog = (content, data) => {
    switch (content) {
      case "create":
        setDialogContent(
          <Dialog title="Create Pool" onCancel={closeDialog} expand={true}>
            <CreatePool onClose={closeDialog} />
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
              providePools={providePoolOptions}
              takePools={takePoolOptions}
              onClose={closeDialog}
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
      {/* {isLoading && <LoadingDialog />} */}
      {dialogOpened && dialogContent}
      <div className={classes.earn}>
        <Header title="Earn" />
        <div className={classes.header}>
          <div className={classes.title}>Liquidity</div>
          <div className={classes.button}>
            <Button type="button" onClick={() => openDialog("create")}>
              Create
            </Button>
          </div>
        </div>
        <PoolSearchPannel
          // options={providePoolOptions}
          onClick={(option) => openDialog("liquidity", option)}
          onCreate={() => openDialog("create")}
          filterProperty="name"
          isLoading={connectorCtx.isLoading}
        />
      </div>
    </React.Fragment>
  );
};

export default Earn;
