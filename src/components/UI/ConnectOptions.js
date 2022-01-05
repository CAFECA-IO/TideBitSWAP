import React, { useState, useContext } from "react";
import classes from "./ConnectOptions.module.css";
import ConnectorContext from "../../store/connector-context";
import Card from "./Card";
import Dialog from "./Dialog";
import Button from "./Button";
import ErrorDialog from "./ErrorDialog";
import { Config } from "../../constant/config";
import LoadingDialog from "./LoadingDialog";

export const ConnectOptions = (props) => {
  return (
    <React.Fragment>
      {props.connectOptions.map((option) => {
        return (
          <div
            className={classes["icon-button"]}
            key={option.name}
            onClick={() => {
              props.onClick(option.name);
            }}
          >
            <Card className={classes["icon-button__icon"]}>
              <img src={option.src} alt={option.name} />
            </Card>
            <p className={classes["icon-button__name"]}>{option.name}</p>
          </div>
        );
      })}
    </React.Fragment>
  );
};

const ConnectButton = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [openLoadingDialog, setOpenLoadingDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [error, setError] = useState(null);

  const connectHandler = async (appName) => {
    setOpenDialog(false);
    setOpenLoadingDialog(true);
    try {
      await connectorCtx.onConnect(appName);
    } catch (error) {
      console.log(`ConnectOptions error`, error);
      setError(error);
      setOpenErrorDialog(true);
    }
    setOpenLoadingDialog(false);
  };
  return (
    <React.Fragment>
      {openLoadingDialog && <LoadingDialog />}
      {openErrorDialog && (
        <ErrorDialog
          message={error.message}
          // message={`Current network is not supported, please switch your network to ${
          //   Config[Config.status] === "stagging" ? "Ropsten" : "Ethereum"
          // }`}
          onConfirm={() => setOpenErrorDialog(false)}
        />
      )}
      {openDialog && (
        <Dialog title="Connect Wallet" onCancel={() => setOpenDialog(false)}>
          <ConnectOptions
            onClick={connectHandler}
            connectOptions={connectorCtx.connectOptions}
          />
        </Dialog>
      )}
      <Button
        className={`${props.className ? props.className : ""}`}
        onClick={() => setOpenDialog(true)}
      >
        Connect
      </Button>
    </React.Fragment>
  );
};

export default ConnectButton;
