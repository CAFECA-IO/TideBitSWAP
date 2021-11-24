import React, { useContext, useState, useEffect, useReducer } from "react";

import CoinInput from "../CoinInput/CoinInput";
import Button from "../UI/Button";
import classes from "./CreatePool.module.css";
// import RadioGroupButton from "./RadioGroupButton";

import { amountUpdateHandler, coinPairUpdateHandler } from "../../Utils/utils";
import UserContext from "../../store/user-context";
// import { buttonOptions } from "../../constant/constant";
import ConnectorContext from "../../store/connector-context";

const createReducer = (prevState, action) => {
  let mainCoin,
    mainCoinAmount,
    mainCoinIsValid,
    subCoin,
    subCoinAmount,
    subCoinIsValid,
    feeIndex,
    update;
  switch (action.type) {
    case "MAIN_COIN_UPDATE":
      update = coinPairUpdateHandler(
        action.value.coin,
        prevState.subCoin,
        prevState.coinOptions,
        prevState.mainCoinAmount
      );
      ({
        active: mainCoin,
        activeAmount: mainCoinAmount,
        passive: subCoin,
        passiveAmount: subCoinAmount,
      } = update);
      break;
    case "MAIN_COIN_AMOUN_UPDATE":
      mainCoinAmount = amountUpdateHandler(
        action.value.amount,
        prevState.mainCoin.balanceOf
      );
      subCoinAmount = prevState.subCoinAmount;
      break;
    case "SUB_COIN_UPDATE":
      update = coinPairUpdateHandler(
        action.value.coin,
        prevState.mainCoin,
        prevState.coinOptions,
        prevState.subCoinAmount
      );
      subCoin = update.active;
      subCoinAmount = update.activeAmount;
      mainCoin = update.passive;
      mainCoinAmount = update.passiveAmount;
      break;
    case "SUB_COIN_AMOUNT_UPDATE":
      subCoinAmount = amountUpdateHandler(
        action.value.amount,
        prevState.subCoin.balanceOf
      );
      mainCoinAmount = prevState.mainCoinAmount;
      break;
    case "SELECTED_FEE_UPDATE":
      feeIndex = action.value.feeIndex;
      return {
        ...prevState,
        feeIndex,
      };
    default:
  }

  mainCoin = mainCoin || prevState.mainCoin;
  subCoin = subCoin || prevState.subCoin;
  mainCoinIsValid = +mainCoinAmount === 0 ? null : +mainCoinAmount > 0;
  subCoinIsValid = +subCoinAmount === 0 ? null : +subCoinAmount > 0;

  return {
    coinOptions: prevState.coinOptions,
    mainCoin,
    mainCoinAmount,
    mainCoinIsValid,
    subCoin,
    subCoinAmount,
    subCoinIsValid,
    feeIndex: prevState.feeIndex,
  };
};

const CreatePool = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [displayApproveMainCoin, setDisplayApproveMainCoin] = useState(false);
  const [displayApproveSubCoin, setDisplayApproveSubCoin] = useState(false);
  const [mainCoinIsApprove, setMainCoinIsApprove] = useState(false);
  const [subCoinIsApprove, setSubCoinIsApprove] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [createState, dispatchCreate] = useReducer(createReducer, {
    coinOptions: connectorCtx.supportedTokens,
    mainCoin: null,
    mainCoinAmount: "",
    mainCoinIsValid: null,
    mainCoinAllowance: "",
    subCoin: null,
    subCoinAmount: "",
    subCoinIsValid: null,
    subCoinAllowance: "",
    feeIndex: 1,
  });

  useEffect(() => {
    console.log("Checking mainCoinAllowanceIsEnough!");
    if (createState.mainCoinIsValid) {
      setIsLoading(true);
      connectorCtx
        .isAllowanceEnough(
          createState.mainCoin.contract,
          createState.mainCoinAmount,
          createState.mainCoin.decimals
        )
        .then((mainCoinAllowanceIsEnough) => {
          setDisplayApproveMainCoin(!mainCoinAllowanceIsEnough);
          setMainCoinIsApprove(mainCoinAllowanceIsEnough);
          setIsLoading(false);
        });
    }

    return () => {
      console.log("CLEANUP");
    };
  }, [
    connectorCtx,
    createState.mainCoin,
    createState.mainCoinAmount,
    createState.mainCoinIsValid,
  ]);

  useEffect(() => {
    console.log("Checking subCoinAllowanceIsEnough!");
    if (createState.subCoinIsValid) {
      setIsLoading(true);
      connectorCtx
        .isAllowanceEnough(
          createState.subCoin.contract,
          createState.subCoinAmount,
          createState.subCoin.decimals
        )
        .then((subCoinAllowanceIsEnough) => {
          setDisplayApproveSubCoin(!subCoinAllowanceIsEnough);
          setSubCoinIsApprove(subCoinAllowanceIsEnough);
          setIsLoading(false);
        });
    }

    return () => {
      console.log("CLEANUP");
    };
  }, [
    connectorCtx,
    createState.subCoin,
    createState.subCoinAmount,
    createState.subCoinIsValid,
  ]);

  const createHandler = async (event) => {
    event.preventDefault();
    console.log(`createHandler`);
    if (mainCoinIsApprove && subCoinIsApprove) {
      setMainCoinIsApprove(false);
      let result;
      try {
        result = await connectorCtx.createPair(
          createState.mainCoin.contract,
          createState.subCoin.contract
        );
        console.log(`result`, result);
      } catch (error) {
        setMainCoinIsApprove(true);
      }
      if (result) {
        setMainCoinIsApprove(false);
        // setSubCoinIsApprove(false);
        try {
          const provideLiquidityResut = await connectorCtx.provideLiquidity(
            createState.mainCoin,
            createState.subCoin,
            createState.mainCoinAmount,
            createState.subCoinAmount
          );
          console.log(`provideLiquidityResut`, provideLiquidityResut);
          props.onClose();
        } catch (error) {}
        setMainCoinIsApprove(true);
        // setSubCoinIsApprove(true);
      }
    }
  };

  // const selectHandler = (feeIndex) => {
  //   dispatchCreate({
  //     type: "SELECTED_FEE_UPDATE",
  //     value: {
  //       feeIndex,
  //     },
  //   });
  // };

  const mainAmountChangeHandler = (amount) => {
    dispatchCreate({
      type: "MAIN_COIN_AMOUN_UPDATE",
      value: {
        amount,
        connectedAccount: connectorCtx.connectedAccount,
      },
    });
  };

  const subAmountChangeHandler = (amount) => {
    dispatchCreate({
      type: "SUB_COIN_AMOUNT_UPDATE",
      value: {
        amount,
        connectedAccount: connectorCtx.connectedAccount,
      },
    });
  };

  const mainCoinChangeHandler = (coin) => {
    dispatchCreate({
      type: "MAIN_COIN_UPDATE",
      value: {
        coin,
        connectedAccount: connectorCtx.connectedAccount,
      },
    });
  };

  const subCoinChangeHandler = (coin) => {
    dispatchCreate({
      type: "SUB_COIN_UPDATE",
      value: {
        coin,
        connectedAccount: connectorCtx.connectedAccount,
      },
    });
  };

  const approveHandler = async (coin, callback) => {
    const coinApproved = await connectorCtx.approve(coin.contract);
    callback(coinApproved);
  };

  return (
    <form className={`responsive create-pool`} onSubmit={createHandler}>
      <main className="main">
        <CoinInput
          label="Coin"
          value={createState.mainCoinAmount}
          onChange={mainAmountChangeHandler}
          selected={createState.mainCoin}
          onSelect={mainCoinChangeHandler}
          options={createState.coinOptions}
        />
        <div className="icon">
          <div>+</div>
        </div>
        <CoinInput
          label="Coin"
          value={createState.subCoinAmount}
          onChange={subAmountChangeHandler}
          selected={createState.subCoin}
          onSelect={subCoinChangeHandler}
          options={createState.coinOptions}
        />
      </main>
      <div className="sub">
        {/* <div className={classes.radio}>
          <div className={classes.title}>
            <div className={classes.text}> Slippage Tolerance</div>
            <span className={`tooltip ${classes.tooltip}`}>
              <div>?</div>
              <div className={`tooltiptext`}>
                Setting a high slippage tolerance can help transactions succeed,
                but you may not get such a good price. Use with caution.
              </div>
            </span>
          </div>
          <RadioGroupButton
            name="fee-option-of-create-pool"
            options={buttonOptions}
            selected={createState.feeIndex}
            onSelect={selectHandler}
          />
        </div> */}
        <div className={classes.button}>
          <div className={classes["approve-button-container"]}>
            {displayApproveMainCoin && (
              <Button
                type="button"
                onClick={() =>
                  approveHandler(createState.mainCoin, (result) => {
                    setMainCoinIsApprove(result);
                    setDisplayApproveMainCoin(!result);
                  })
                }
              >
                Approve {createState.mainCoin.symbol}
              </Button>
            )}
            {displayApproveSubCoin && (
              <Button
                type="button"
                onClick={() =>
                  approveHandler(createState.subCoin, (result) => {
                    setSubCoinIsApprove(result);
                    setDisplayApproveSubCoin(!result);
                  })
                }
              >
                Approve {createState.subCoin.symbol}
              </Button>
            )}
          </div>
          <Button
            type="submit"
            disabled={!mainCoinIsApprove || !subCoinIsApprove}
          >
            {isLoading ? "Loading..." : "Create"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CreatePool;
