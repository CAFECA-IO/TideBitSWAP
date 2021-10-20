import React, { useState, useEffect, useReducer, useRef, useContext } from "react";

import classes from "./Withdraw.module.css";

import {
  dummyCoins,
  // dummyNetworks,
  // getNetworkOptions,
} from "../../constant/dummy-data";
import Header from "../../components/Layout/Header";
import CoinDialog from "../../components/CoinDialog/CoinDialog";
import InputAmount from "../../components/UI/InputAmount";
import InputText from "../../components/UI/InputText";
import Button from "../../components/UI/Button";
// import NetworkDialog from "../../components/NetworkDialog/NetworkDialog";
import LoadingDialog from "../../components/UI/LoadingDialog";
import UserContext from "../../store/user-context";

const validation = (address) => {
  const test = address.slice(0, 2) === "0x";
  return { isValid: test, message: test ? "" : "Address is invalid" };
};

const addressReducer = (prevState, action) => {
  let result;
  switch (action.type) {
    case "USER_INPUT":
      result = validation(action.value);
      return {
        value: action.value,
        isValid: result.isValid,
        message: result.message,
      };
    case "INPUT_BLUR":
      result = validation(prevState.value);
      return {
        value: prevState.value,
        isValid: result.isValid,
        message: result.message,
      };
    case "COIN_UPDATE":
      return {
        value: "",
        isValid: null,
        message: "",
      };

    default:
      return {
        value: "",
        isValid: false,
        message: "Address is invalid",
      };
  }
};

const Withdraw = (props) => {
  const userCtx = useContext(UserContext)
  const [coinOptions, setCoinOptions] = useState();
  // const [networkOptions, setNetworkOptions] = useState(dummyNetworks);
  const [selectedCoin, setSelectedCoin] = useState();
  // const [selectedNetwork, setSelectedNetwork] = useState();
  const [inputAmount, setInputAmount] = useState("");
  const [formIsValid, setFormIsValid] = useState(false);
  const coinDialogRef = useRef();

  const [addressState, dispatchAddress] = useReducer(addressReducer, {
    value: "",
    isValid: null,
    message: "",
  });

  const selectCoinHandler = (coin) => {
    setSelectedCoin(coin);
    setInputAmount((prev) => (prev > coin?.balanceOf || 0 ? coin?.balanceOf || 0 : prev));
    dispatchAddress({ type: "COIN_UPDATE", value: "" });
    // setNetworkOptions(getNetworkOptions(coin));
  };
  const validateAddressHandler = (address) => {
    dispatchAddress({ type: "INPUT_BLUR", value: address });
  };

  const addressChangeHandler = (address) => {
    dispatchAddress({ type: "USER_INPUT", value: address });
  };

  useEffect(() => {
    // get coinOptions
    const identifier = setTimeout(() => {
      setCoinOptions(userCtx.supportedCoins);
      coinDialogRef.current.openDialog();
    }, 500);
    return () => {
      clearTimeout(identifier);
    };
  }, []);

  useEffect(() => {
    const identifier = setTimeout(() => {
      console.log("Checking form validity!");
      setFormIsValid(
        !!selectedCoin && addressState.isValid && +inputAmount > 0
      );
    }, 500);

    return () => {
      console.log("CLEANUP");
      clearTimeout(identifier);
    };
  }, [selectedCoin, addressState.isValid, inputAmount]);

  const amountChangeHandler = (amount) => {
    setInputAmount(amount);
  };

  // const selectNetworkHandler = (network) => {
  // setSelectedNetwork(network);
  // };

  const submitHandler = (event) => {
    event.preventDefault();
  };

  return (
    <React.Fragment>
      {!coinOptions && <LoadingDialog />}
      <form className="withdraw" onSubmit={submitHandler}>
        <Header title="Withdraw" />
        {/* <div className={classes.content}> */}
        <div className="responsive">
          <main className="main">
            <CoinDialog
              ref={coinDialogRef}
              options={coinOptions}
              selectedCoin={selectedCoin}
              onSelect={selectCoinHandler}
            />
            <InputAmount
              label="Amount"
              max={selectedCoin?.balanceOf || 0}
              symbol={selectedCoin?.symbol || ""}
              value={inputAmount}
              onChange={amountChangeHandler}
            />
            <InputText
              label="Address"
              placeholder="0x"
              value={addressState.value}
              onChange={addressChangeHandler}
              onBlur={validateAddressHandler}
              isValid={addressState.isValid}
              message={addressState.message}
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
              <Button type="submit" disabled={!formIsValid} loading={false}>
                Summbit
              </Button>
            </div>
          </div>
        </div>
      </form>
    </React.Fragment>
  );
};

export default Withdraw;
