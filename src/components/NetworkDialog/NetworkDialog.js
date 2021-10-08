import React, { useState } from "react";
import Dialog from "../UI/Dialog";
import classes from "./NetworkDialog.module.css";

const NetworkOption = (props) => {
  return (
    <div
      value={props.symbol}
      className={classes.option}
      onClick={props.onClick}
    >
      <div className={classes.title}>
        <div className={classes.symbol}>{props.symbol}</div>
        <div className={classes.name}>{props.name}</div>
      </div>
      <div className={classes.content}>
        <div className={classes.detail}>
          <div className={classes.title}>Fee: </div>
          <div className={classes.fee}>
            <div className={classes.value}>
              {props.fee.crypto + " " + props.selectedCoin.symbol}
            </div>
            <div className={classes.value}>&#8776; ${props.fee.fiat}</div>
          </div>
        </div>
        <div className={classes.detail}>
          <div className={classes.title}>Arrival time: </div>
          <div className={classes.value}>&#8776;{props.time}</div>
        </div>
      </div>
    </div>
  );
};

const NetworkDialog = (props) => {
  const [openDialog, setOpenDialog] = useState(false);
  const cancelHandler = () => {
    setOpenDialog(false);
  };
  const clickHandler = () => {
    setOpenDialog(true);
  };
  const selectedHandler = (option) => {
    props.onSelect(option);
    setOpenDialog(false);
  };

  return (
    <React.Fragment>
      {openDialog && (
        <Dialog title="Select Network" onCancel={cancelHandler}>
          <div className={classes["options-container"]}>
            <div className={classes.hint}>
              Ensure the network matches the addresses network entered to avoid
              withdrawal losses.
            </div>
            {props.options.map((network) => (
              <NetworkOption
                key={network.name + network.symbol}
                selectedCoin={props.selectedCoin}
                symbol={network.symbol}
                name={network.name}
                fee={network.fee}
                time={network.time}
                onClick={() => selectedHandler(network)}
              />
            ))}
          </div>
        </Dialog>
      )}

      <div className={classes.container}>
        <div className={classes.title}>Network</div>
        <div className={classes.button}>
          {props.selectedNetwork && (
            <div className={classes.selected} onClick={clickHandler}>
              <div>{props.selectedNetwork.symbol}</div>
              <div>{props.selectedNetwork.name}</div>
            </div>
          )}
          {!props.selectedNetwork && (
            <div className={classes.placeholder} onClick={clickHandler}>
              Select Network
            </div>
          )}
          <div className={classes.icon}>&#10095;</div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default NetworkDialog;
