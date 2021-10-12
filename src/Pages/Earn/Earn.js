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
import { dummyPools } from "../../constant/dummy-data";
import LoadingDialog from "../../components/UI/LoadingDialog";
import LoadingIcon from "../../components/UI/LoadingIcon";

const Earn = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [poolOptions, setPoolOptions] = useState();
  const [dialogOpened, setDialogOpened] = useState(false);
  const [dialogContent, setDialogContent] = useState();
  // const userCtx = useContext(UserContext);

  // useEffect HTTP
  // fetch pools from backend
  useEffect(() => {
    const identifier = setTimeout(() => {
      setPoolOptions({
        provide: dummyPools,
        take: dummyPools.slice(1),
      });
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(identifier);
  }, []);

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
              providePools={poolOptions.provide}
              takePools={poolOptions.take}
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
      {isLoading && <LoadingDialog />}
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
        {isLoading ? (
          <React.Fragment></React.Fragment>
        ) : (
          <PoolSearchPannel
            options={dummyPools}
            onClick={(option) => openDialog("liquidity", option)}
            onCreate={() => openDialog("create")}
            filterProperty="name"
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default Earn;
