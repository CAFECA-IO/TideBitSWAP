import React, { useState, useContext } from "react";
import Card from "../../components/UI/Card";
import Dialog from "../../components/UI/Dialog";
import Button from "../../components/UI/Button";
import LoadingDialog from "../../components/UI/LoadingDialog";
// import { connectOptions } from "../../constant/constant";
import ConnectorContext from "../../store/connector-context";
import classes from "./Landing.module.css";

const ConnectOptions = (props) => {
  const connectorCtx = useContext(ConnectorContext);

  const connectHandler = (appName) => {
    props.onClick();
    try {
      connectorCtx.onConnect(appName);
    } catch (error) {
      console.log(`ConnectOptions error`, error);
    }
  };
  return (
    <React.Fragment>
      {connectorCtx.connectOptions.map((option) => {
        return (
          <div
            className={classes["icon-button"]}
            key={option.name}
            onClick={() => {
              connectHandler(option.name);
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

const Landing = () => {
  const connectorCtx = useContext(ConnectorContext);
  const [openDialog, setOpenDialog] = useState(false);

  const cancelHandler = () => {
    setOpenDialog(false);
  };
  const clickHandler = () => {
    setOpenDialog(true);
  };

  const connectHandler = () => {
    setOpenDialog(false);
  };
  return (
    <React.Fragment>
       {connectorCtx.isLoading && (
        <LoadingDialog/>
      )}
      {openDialog && (
        <Dialog title="Connect Wallet" onCancel={cancelHandler}>
          <ConnectOptions onClick={connectHandler} />
        </Dialog>
      )}
      <div className={classes.landing}>
        <div>
          <h1 className="heading-primary">TideBit SWAP</h1>
          <p className="subtitle">Simple and Secure. Make your money to work</p>
          <Button onClick={clickHandler}>Connect</Button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Landing;
