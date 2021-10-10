import React, { useState, useEffect } from "react";

import classes from "./Withdraw.module.css";

import {
  dummyCoins,
  dummyNetworks,
  getNetworkOptions,
} from "../../constant/dummy-data";
import Header from "../../components/UI/Header";
import CoinDialog from "../../components/CoinDialog/CoinDialog";
import InputAmount from "../../components/UI/InputAmount";
import InputText from "../../components/UI/InputText";
import Button from "../../components/UI/Button";
import NetworkDialog from "../../components/NetworkDialog/NetworkDialog";

const Withdraw = (props) => {
  const [coinOptions, setCoinOptions] = useState(dummyCoins);
  const [networkOptions, setNetworkOptions] = useState(dummyNetworks);
  const [selectedCoin, setSelectedCoin] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState();
  const [inputAmount, setInputAmount] = useState("");
  const [inputAddress, setInputAddress] = useState("");
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [formIsValid, setFormIsValid] = useState(false);

  useEffect(() => {
    const identifier = setTimeout(() => {
      console.log("Checking form validity!");
      setFormIsValid(
        !!selectedCoin && !error && !!inputAddress && +inputAmount > 0
      );
    }, 500);

    return () => {
      console.log("CLEANUP");
      clearTimeout(identifier);
    };
  }, [selectedCoin, error, inputAddress, inputAmount]);

  const amountChangeHandler = (amount) => {
    setInputAmount(amount);
  };

  const addressValidation = (address) => {
    const test = address.slice(0, 2) === "0x";
    return { result: test, hint: test ? "" : "Address is Invalid" };
  };

  const addressChangeHandler = (address) => {
    setInputAddress(address);
    const test = addressValidation(address);
    // setError(test.result);
    setError(!test.result);
    setErrorText(test.hint);
  };

  const selectCoinHandler = (coin) => {
    setSelectedCoin(coin);
    setNetworkOptions(getNetworkOptions(coin));
  };

  const selectNetworkHandler = (network) => {
    setSelectedNetwork(network);
  };

  const submitHandler = (event) => {
    event.preventDefault();
  };

  return (
    <form className="withdraw" onSubmit={submitHandler}>
      <Header title="Withdraw" onDisconnect={props.onDisconnect} />
      {/* <div className={classes.content}> */}
      <div className="responsive">
        <main className="main">
          <CoinDialog
            options={coinOptions}
            selectedCoin={selectedCoin}
            onSelect={selectCoinHandler}
          />
          <InputAmount
            label="Amount"
            max={selectedCoin?.max || 0}
            symbol={selectedCoin?.symbol || ""}
            value={inputAmount}
            onChange={amountChangeHandler}
          />
          <InputText
            label="Address"
            placeholder="0x"
            value={inputAddress}
            onChange={addressChangeHandler}
            error={error}
            errorText={errorText}
          />
        </main>
        <div className="sub">
          {/* {!!selectedCoin && (
        <NetworkDialog
          options={networkOptions}
          selectedCoin={selectedCoin}
          selectedNetwork={selectedNetwork}
          onSelect={selectNetworkHandler}
        />
      )} */}
          <div></div>
          <div className={classes.button}>
            <Button type="submit" disabled={!formIsValid}>
              Summbit
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Withdraw;
