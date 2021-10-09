import React, { useState } from "react";
import CoinOption from "../CoinOption/CoinOption";
import Dialog from "../UI/Dialog";
import FilterList from "../UI/FilterList";
import classes from "./CoinDialog.module.css";

const CoinDialog = (props) => {
  const [openDialog, setOpenDialog] = useState(!props.selectedCoin);
  const cancelHandler = () => {
    setOpenDialog(false);
  };
  const clickHandler = () => {
    setOpenDialog(true);
  };
  const selectHandler = (option) => {
    props.onSelect(option);
    setOpenDialog(false);
  };

  return (
    <React.Fragment>
      {openDialog && (
        <Dialog title="Select Coin" onCancel={cancelHandler}>
          <FilterList
            onSelect={selectHandler}
            data={props.options}
            filterProperty="symbol"
          >
            {(data) => CoinOption(data)}
          </FilterList>
        </Dialog>
      )}
      <div className={classes.option}>
        <div className={classes.title}>Coin</div>
        <div className={classes.button} onClick={clickHandler}>
          {props.selectedCoin && CoinOption(props.selectedCoin)}
          {!props.selectedCoin && (
            <div className={classes.placeholder}>Select Coin</div>
          )}
          <div className={classes.icon}>&#10095;</div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default CoinDialog;
