import React, { useState, useImperativeHandle } from "react";
import CoinOption from "../CoinOption/CoinOption";
import Dialog from "../UI/Dialog";
import FilterList from "../UI/FilterList";
import classes from "./CoinDialog.module.css";

const CoinDialog = React.forwardRef((props, ref) => {
  const [openDialog, setOpenDialog] = useState(false);

  const selectHandler = (option) => {
    props.onSelect(option);
    setOpenDialog(false);
  };

  useImperativeHandle(ref, () => {
    return {
      openDialog: () => setOpenDialog(true),
      closeDialog: () => setOpenDialog(false),
    };
  });

  return (
    <React.Fragment>
      {openDialog && (
        <Dialog title="Select Coin" onCancel={() => setOpenDialog(false)}>
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
        <div className={classes.button} onClick={() => setOpenDialog(true)}>
          {props.selectedCoin && CoinOption(props.selectedCoin)}
          {!props.selectedCoin && (
            <div className={classes.placeholder}>Select Coin</div>
          )}
          <div className={classes.icon}>&#10095;</div>
        </div>
      </div>
    </React.Fragment>
  );
});

export default CoinDialog;
