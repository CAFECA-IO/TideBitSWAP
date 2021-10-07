import React, { useState } from "react";
import Button from "../../components/UI/Button";
import Header from "../../components/UI/Header";
import classes from "./Deposit.module.css";
import Dialog from "../../components/UI/Dialog";
import CoinSearchPannel from "../../components/CoinSearchPannel/CoinSearchPannel";
import { dummyCoins } from "../../constant/dummy-data";
import CoinOption from "../../components/CoinOption/CoinOption";

const Deposit = (props) => {
  const [openDialog, setOpenDialog] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState();

  const cancelHandler = () => {
    setOpenDialog(false);
  };
  const clickHandler = () => {
    setOpenDialog(true);
  };
  
  const selectedHandler = (option) => {
    console.log(Object.values(option));
    setSelectedCoin(option);
    setOpenDialog(false);
  };
  return (
    <React.Fragment>
      {openDialog && (
        <Dialog
          title="Select Coin"
          onCancel={cancelHandler}
        >
          <CoinSearchPannel onSelect={selectedHandler} options={dummyCoins}/>
        </Dialog>
      )}
      <div className={classes.deposit}>
        <Header
          title="Deposit"
          onDisconnect={props.onDisconnect}
        />
        <Button type="button" onClick={clickHandler}>
        {selectedCoin && (
          <CoinOption
            isShrink={true}
            name={selectedCoin.name}
            iconSrc={selectedCoin.iconSrc}
            symbol={selectedCoin.symbol}
            onSelect={() => {}}
          />
        )}
        {!selectedCoin && (
          <div className={classes.placeholder}>Select Coin</div>
        )}
        </Button>
        
      </div>
    </React.Fragment>
  );
};

export default Deposit;
