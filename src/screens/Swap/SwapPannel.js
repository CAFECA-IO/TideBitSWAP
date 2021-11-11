import React, {
  useState,
  useReducer,
  useEffect,
  useContext,
  // useCallback,
} from "react";
import CoinInput from "../../components/CoinInput/CoinInput";
import Button from "../../components/UI/Button";
import Summary from "../../components/UI/Summary";
import classes from "./SwapPannel.module.css";
import { coinPairUpdateHandler } from "../../Utils/utils";
import UserContext from "../../store/user-context";
import ConnectorContext from "../../store/connector-context";
import { dummyDetails } from "../../constant/dummy-data";
import { useHistory } from "react-router";

const swapReducer = (prevState, action) => {
  let sellCoin,
    sellCoinAmount,
    sellCoinIsValid,
    buyCoin,
    buyCoinAmount,
    buyCoinIsValid,
    update;
  switch (action.type) {
    case "SELL_COIN_UPDATE":
      update = coinPairUpdateHandler(
        action.value.coin,
        prevState.buyCoin,
      );
      ({ active: sellCoin, passive: buyCoin } = update);
      sellCoinAmount = prevState.sellCoinAmount;
      buyCoinAmount = "";
      break;
    case "SELL_COIN_AMOUN_UPDATE":
      sellCoinAmount = action.value.amount;
      buyCoinAmount = prevState.buyCoinAmount;
      break;
    case "BUY_COIN_UPDATE":
      update = coinPairUpdateHandler(
        action.value.coin,
        prevState.sellCoin,
      );
      buyCoin = update.active;
      sellCoin = update.passive;
      sellCoinAmount = prevState.sellCoinAmount;
      buyCoinAmount = "";
      break;
    case "BUY_COIN_AMOUNT_UPDATE":
      console.log(`BUY_COIN_AMOUNT_UPDATE`, action.value.amount);
      buyCoinAmount = action.value.amount;
      sellCoinAmount = prevState.sellCoinAmount;
      break;
    default:
  }

  sellCoin = sellCoin || prevState.sellCoin;
  buyCoin = buyCoin || prevState.buyCoin;
  sellCoinIsValid =
    +sellCoinAmount === 0
      ? null
      : +sellCoinAmount > 0 && sellCoinAmount < sellCoin.balanceOf;
  buyCoinIsValid = +buyCoinAmount === 0 ? null : +buyCoinAmount > 0;

  return {
    sellCoin,
    sellCoinAmount,
    sellCoinIsValid,
    buyCoin,
    buyCoinAmount,
    buyCoinIsValid,
  };
};

const SwapPannel = (props) => {
  const userCtx = useContext(UserContext);
  const connectorCtx = useContext(ConnectorContext);
  const [pairExist, setPairExist] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isApprove, setIsApprove] = useState(false);
  const [displayApproveSellCoin, setDisplayApproveSellCoin] = useState(false);
  const history = useHistory();

  const [swapState, dispatchSwap] = useReducer(swapReducer, {
    sellCoin: null,
    sellCoinAmount: "",
    sellCoinIsValid: null,
    buyCoin: null,
    buyCoinAmount: "",
    buyCoinIsValid: null,
  });

  useEffect(() => {
    return () => {};
  }, []);

  useEffect(() => {
    if (swapState.sellCoin && swapState.buyCoin) {
      setIsLoading(true);
      connectorCtx
        .getSelectedPool(
          userCtx.supportedPools,
          swapState.sellCoin,
          swapState.buyCoin
        )
        .then((selectedPool) => {
          console.log(`selectedPool`, selectedPool);
          if (selectedPool) {
            setPairExist(true);
            history.push(`#/swap/${selectedPool.contract}`);
            if (swapState.sellCoinAmount)
              connectorCtx
                .getAmountsOut(
                  swapState.sellCoinAmount,
                  swapState.sellCoin,
                  swapState.buyCoin
                )
                .then((amountOut) => {
                  console.log(`amountOut`, amountOut);
                  dispatchSwap({
                    type: "BUY_COIN_AMOUNT_UPDATE",
                    value: {
                      amount: amountOut,
                    },
                  });
                  setIsLoading(false);
                });
            else setIsLoading(false);
          } else {
            setIsLoading(false);
            setPairExist(false);
          }
        });
    }
    return () => {
      console.log("CLEANUP selectedPool");
    };
  }, [
    swapState.sellCoin,
    swapState.buyCoin,
    userCtx.supportedPools,
    connectorCtx,
    swapState.sellCoinAmount,
    history,
  ]);

  useEffect(() => {
    if (pairExist) {
      if (swapState.sellCoinIsValid && swapState.buyCoinIsValid) {
        connectorCtx
          .isAllowanceEnough(
            swapState.sellCoin.contract,
            swapState.sellCoinAmount,
            swapState.sellCoin.decimals
          )
          .then((isSellCoinEnough) => {
            setDisplayApproveSellCoin(!isSellCoinEnough);
            setIsApprove(isSellCoinEnough);
          });
      }
    }

    return () => {
      console.log("CLEANUP");
    };
  }, [
    pairExist,
    swapState.sellCoinIsValid,
    swapState.buyCoinIsValid,
    swapState.sellCoin?.contract,
    swapState.sellCoin?.decimals,
    swapState.sellCoinAmount,
    connectorCtx,
  ]);

  const approveHandler = async () => {
    const sellCoinApprove = await connectorCtx.approve(
      swapState.sellCoin.contract
    );
    if (sellCoinApprove) {
      setIsApprove(true);
      setDisplayApproveSellCoin(false);
    }
  };
  const swapHandler = async (event) => {
    event.preventDefault();
    if (isApprove) {
      setIsApprove(false);
      try {
        const result = await connectorCtx.swap(
          swapState.sellCoinAmount,
          swapState.buyCoinAmount,
          swapState.sellCoin,
          swapState.buyCoin
        );
        console.log(`result`, result);
        props.onClose();
      } catch (error) {}
      setIsApprove(true);
    }
  };

  const sellAmountChangeHandler = async (amount) => {
    dispatchSwap({
      type: "SELL_COIN_AMOUN_UPDATE",
      value: {
        amount,
      },
    });
    if (pairExist) {
      setIsLoading(true);
      const amountOut =
        +amount > 0
          ? await connectorCtx.getAmountsOut(
              amount,
              swapState.sellCoin,
              swapState.buyCoin
            )
          : 0;
      console.log(`sellAmountChangeHandler amountOut`, amountOut);
      dispatchSwap({
        type: "BUY_COIN_AMOUNT_UPDATE",
        value: {
          amount: amountOut,
        },
      });
      setIsLoading(false);
    }
  };

  const buyAmountChangeHandler = async (amount) => {
    dispatchSwap({
      type: "BUY_COIN_AMOUNT_UPDATE",
      value: {
        amount,
      },
    });
    if (pairExist) {
      setIsLoading(true);
      const amountIn =
        +amount > 0
          ? await connectorCtx.getAmountsIn(
              amount,
              swapState.sellCoin,
              swapState.buyCoin
            )
          : 0;
      console.log(`buyAmountChangeHandler amountIn`, amountIn);
      dispatchSwap({
        type: "SELL_COIN_AMOUN_UPDATE",
        value: {
          amount: amountIn,
        },
      });
      setIsLoading(false);
    }
  };

  const sellCoinChangeHandler = (coin) => {
    dispatchSwap({
      type: "SELL_COIN_UPDATE",
      value: {
        coin,
      },
    });
  };

  const buyCoinChangeHandler = (coin) => {
    dispatchSwap({
      type: "BUY_COIN_UPDATE",
      value: {
        coin,
      },
    });
  };

  return (
    <form className={classes.swap} onSubmit={swapHandler}>
      <main className={classes.main}>
        <CoinInput
          label="Sell"
          value={swapState.sellCoinAmount}
          onChange={sellAmountChangeHandler}
          selected={swapState.sellCoin}
          onSelect={sellCoinChangeHandler}
          options={userCtx.assets}
        />
        <div className="icon">
          <div>&#x21c5;</div>
        </div>
        <CoinInput
          label="Buy"
          value={swapState.buyCoinAmount}
          onChange={buyAmountChangeHandler}
          selected={swapState.buyCoin}
          onSelect={buyCoinChangeHandler}
          options={userCtx.assets}
        />
        <div className="hint">
          The ultimate price and output is determined by the amount of tokens in
          the pool at the time of your swap.
        </div>
        <div className={classes.button}>
          <div className={classes["approve-button-container"]}>
            {displayApproveSellCoin && (
              <Button type="button" onClick={approveHandler}>
                Approve {swapState.sellCoin.symbol}
              </Button>
            )}
          </div>
          <Button type="submit" disabled={!isApprove}>
            {isLoading
              ? "Loading..."
              : pairExist === false
              ? "Insufficient liquidity for this trade."
              : pairExist === true
              ? swapState.sellCoinIsValid === false
                ? `Insufficient ${swapState.sellCoin.symbol} balance`
                : "Swap"
              : "Select a token"}
          </Button>
        </div>
      </main>
      <div className="sub">
        <Summary details={dummyDetails} />
      </div>
    </form>
  );
};

export default SwapPannel;
