import React, { useContext, useEffect, useState } from "react";
import Button from "../../components/UI/Button";
import Header from "../../components/Layout/Header";
import CreatePool from "../../components/CreatePool/CreatePool";
import classes from "./Earn.module.css";
import Dialog from "../../components/UI/Dialog";
import Liquidity from "../../components/Liquidity/Liquidity";
import PoolSearchPannel from "../../components/PoolSearchPannel/PoolSearchPannel";
import { liquidityType } from "../../constant/constant";
import UserContext from "../../store/user-context";

const Earn = () => {
  // const [isLoading, setIsLoading] = useState(true);
  const [dialogOpened, setDialogOpened] = useState(false);
  const [dialogContent, setDialogContent] = useState();
  const userCtx = useContext(UserContext);
  const [providePoolOptions, setProvidePoolOptions] = useState(
    userCtx.supportedPools.map((pool) => pool.poolData)
  );
  const [takePoolOptions, setTakePoolOptions] = useState(
    userCtx.supportedPools
      .filter((pool) => +pool.share > 0)
      .map((pool) => pool.poolData)
  );

  useEffect(() => {
    setProvidePoolOptions(userCtx.supportedPools.map((pool) => pool.poolData));
    setTakePoolOptions( userCtx.supportedPools
      .filter((pool) => +pool.share > 0)
      .map((pool) => pool.poolData))
    return () => {};
  }, [userCtx.supportedPools]);

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
              providePools={providePoolOptions}
              takePools={takePoolOptions}
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
          options={providePoolOptions}
          onClick={(option) => openDialog("liquidity", option)}
          onCreate={() => openDialog("create")}
          filterProperty="name"
        />
      </div>
    </React.Fragment>
  );
};

export default Earn;
