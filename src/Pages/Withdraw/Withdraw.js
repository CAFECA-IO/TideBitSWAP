import React, { useState } from "react";

import classes from "./Withdraw.module.css";

import { dummyCoins, dummyNetworks } from "../../constant/dummy-data";
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

  const amountChangeHandler = (amount) => {
    setInputAmount(amount);
  };

  const addressChangeHandler = (amount) => {
    setInputAddress(amount);
    setError(false);
    setErrorText("");
  };

  const getNetworkOptions = (coin) => {
    return [
      ...dummyNetworks,
      {
        name: coin.name,
        symbol: coin.symbol,
        time: "3 mins",
        fee: {
          crypto: "0.000061",
          fiat: "32.1",
        },
      },
    ];
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
    <form className={classes.withdraw} onSubmit={submitHandler}>
      <Header title="Withdraw" onDisconnect={props.onDisconnect} />
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
      {!!selectedCoin && (
        <NetworkDialog
          options={networkOptions}
          selectedCoin={selectedCoin}
          selectedNetwork={selectedNetwork}
          onSelect={selectNetworkHandler}
        />
      )}
      <div className={classes.button}>
        <Button type="submit">Summbit</Button>
      </div>
    </form>
  );
};

export default Withdraw;
