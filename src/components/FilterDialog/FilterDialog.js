import React, { useState } from "react";
import CoinOption from "../CoinOption/CoinOption";
import CoinSearchPannel from "../CoinSearchPannel/CoinSearchPannel";
import Dialog from "../UI/Dialog";
import classes from "./CoinPopup.module.css";

const CoinPopup = (props) => {
  const [openDialog, setOpenDialog] = useState(!props.selectedCoin);
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
        <Dialog title="Select Coin" onCancel={cancelHandler}>
          <CoinSearchPannel
            onSelect={selectedHandler}
            options={props.options}
          />
        </Dialog>
      )}
      <div className={classes.deposit}>
        <div className={classes.option}>
          <div className={classes.title}>Coin</div>
          <div className={classes.button}>
            {props.selectedCoin && (
              <CoinOption
                name={props.selectedCoin.name}
                iconSrc={props.selectedCoin.iconSrc}
                symbol={props.selectedCoin.symbol}
                onSelect={clickHandler}
              />
            )}
            {!props.selectedCoin && (
              <div className={classes.placeholder} onClick={clickHandler}>
                Select Coin
              </div>
            )}
            <div className={classes.icon}>&#10095;</div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default CoinPopup;
