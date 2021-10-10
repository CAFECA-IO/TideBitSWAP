import React, { useState } from "react";
import CoinOption from "../CoinOption/CoinOption";
import Dialog from "../UI/Dialog";
import FilterList from "../UI/FilterList";
import classes from "./CoinDialog.module.css";

const CoinDialog = (props) => {
  return (
    <React.Fragment>
      {props.open && (
        <Dialog title="Select Coin" onCancel={props.onClose}>
          <FilterList
            onSelect={props.onSelect}
            data={props.options}
            filterProperty="symbol"
          >
            {(data) => CoinOption(data)}
          </FilterList>
        </Dialog>
      )}
      <div className={classes.option}>
        <div className={classes.title}>Coin</div>
        <div className={classes.button} onClick={props.onOpen}>
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
