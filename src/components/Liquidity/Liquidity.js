import React, { useReducer, useEffect, useState, useContext } from "react";
import classes from "./Liquidity.module.css";
import PoolOption from "../PoolOption/PoolOption";
import Button from "../UI/Button";
import FilterDropDown from "../UI/FilterDropDown";
import EmptyPool from "./EmptyPool";
import TypeTabBar from "./TypeTabBar";
import Summary from "../UI/Summary";
import ProvideAmount from "./ProvideAmount";
import TakeAmount from "./TakeAmount";
import RadioOption from "./RadioOption";
import {
  amountUpdateHandler,
  coinUpdateHandler,
  parseData,
} from "../../utils/utils";
import { liquidityType } from "../../constant/constant";
import UserContext from "../../store/user-context";

const poolReducer = (prevState, action) => {
  let selectedType,
    pools,
    selectedPool,
    selectedCoinCombination,
    selectedCoin,
    selectedCoinAmount,
    pairCoin,
    coinOptions,
    shareAmount,
    coinCombinations,
    details,
    maxShareAmount,
    isCoinValid,
    isShareValid;
  switch (action.type) {
    case "UPDATE_TYPE":
      // get pools
      selectedType = action.value.selectedType;
      pools =
        selectedType === liquidityType.PROVIDE
          ? prevState.providePools
          : prevState.takePools;
      if (!pools?.length) {
        return {
          supportedCoins: prevState.supportedCoins,
          selectedType,
          pools,
          providePools: prevState.providePools,
          takePools: prevState.takePools,
          selectedPool: prevState.providePools,
          selectedCoinCombination: 0,
          selectedCoin: null,
          selectedCoinAmount: "",
          pairCoin: null,
          coinOptions: [],
          shareAmount: "",
          coinCombinations: [],
          details: parseData(null, selectedType, prevState.supportedCoins)
            .details,
          maxShareAmount: "",
          isCoinValid: null,
          isShareValid: null,
        };
      }

      selectedPool = pools?.find(
        (pool) => pool.name === prevState.selectedPool.name
      );

      if (!!selectedPool) {
        return {
          ...prevState,
          selectedType,
          pools,
        };
      }
      selectedPool = pools[0];
      break;
    case "UPDATE_POOL":
      selectedPool = action.value.selectedPool;
      if (selectedPool === prevState.selectedPool) {
        return prevState;
      }
      break;
    case "UPDATE_SELECTED_COMBINATION":
      selectedCoinCombination = action.value.selectedCoinCombination;
      break;
    case "COIN_UPDATE":
      selectedCoin = action.value.coin;
      const data = coinUpdateHandler(
        selectedCoin,
        prevState.coinOptions,
        prevState.selectedCoinAmount
      );
      selectedCoinAmount = data.selectedCoinAmount;
      isCoinValid = data.isCoinValid;
      pairCoin = data.pairCoin;
      break;
    case "COIN_AMOUNT_UPDATE":
      selectedCoin = prevState.selectedCoin;
      selectedCoinAmount = amountUpdateHandler(
        action.value.amount,
        selectedCoin.max
      );
      isCoinValid = +selectedCoinAmount === 0 ? null : +selectedCoinAmount > 0;
      if (isCoinValid) {
        // HTTPREQUEST: get pairCoinAmount
        pairCoin = prevState.coinOptions
          .filter((coin) => coin.symbol !== selectedCoin.symbol)
          .map((coin) => {
            let amount = 0.1;
            isCoinValid = !amount > coin.max;
            return { ...coin, amount: amount };
          });
      }
      break;
    case "SHARE_AMOUNT_UPDATE":
      shareAmount = amountUpdateHandler(
        action.value.amount,
        prevState.maxShareAmount
      );
      isShareValid = +shareAmount === 0 ? null : +shareAmount > 0;
      if (isShareValid) {
        // HTTPREQUEST: get coins' amount
        coinOptions = prevState.coinOptions.map((coin) => {
          let amount = 0.012;
          return {
            ...coin,
            amount: amount,
          };
        });
      } else {
        coinOptions = prevState.coinOptions;
      }
      break;
    default:
  }
  selectedType = selectedType || prevState.selectedType;

  if (action.type === "COIN_UPDATE" || action.type === "COIN_AMOUNT_UPDATE") {
    return {
      ...prevState,
      selectedCoin: selectedCoin,
      selectedCoinAmount: selectedCoinAmount,
      pairCoin: pairCoin,
      isCoinValid: isCoinValid,
    };
  }
  if (action.type === "SHARE_AMOUNT_UPDATE") {
    return {
      ...prevState,
      coinOptions,
      shareAmount,
      isShareValid,
    };
  }

  if (
    action.type === "UPDATE_SELECTED_COMBINATION" ||
    selectedPool === prevState.selectedPool
  ) {
    selectedPool = prevState.selectedPool;
    coinCombinations = prevState.coinCombinations;
    details = prevState.details;
    maxShareAmount = prevState.maxShareAmount;
  } else {
    const parsedData = parseData(
      selectedPool,
      selectedType,
      prevState.supportedCoins
    );
    coinCombinations = parsedData.combinations;
    details = parsedData.details;
    maxShareAmount = parsedData.maxShareAmount;
    selectedCoinCombination = prevState.selectedCoinCombination;
  }

  coinOptions = coinCombinations[selectedCoinCombination];
  selectedCoin = coinOptions[0];
  const data = coinUpdateHandler(
    selectedCoin,
    coinOptions,
    prevState.selectedCoinAmount
  );
  selectedCoinAmount = data.selectedCoinAmount;
  isCoinValid = data.isCoinValid;
  pairCoin = data.pairCoin;
  shareAmount =
    prevState.shareAmount > maxShareAmount
      ? maxShareAmount
      : prevState.shareAmount;
  isShareValid = +shareAmount === 0 ? null : +shareAmount > 0;
  if (isShareValid) {
    // HTTPREQUEST: get coins' amount
    coinOptions = coinOptions.map((coin) => ({
      ...coin,
      amount: 0.012,
    }));
  }
  return {
    supportedCoins: prevState.supportedCoins,
    selectedType: selectedType || prevState.selectedType,
    providePools: prevState.providePools,
    takePools: prevState.takePools,
    pools: pools || prevState.pools,
    selectedPool,
    selectedCoinCombination,
    coinCombinations,
    details,
    maxShareAmount,
    coinOptions,
    selectedCoin: selectedCoin || prevState.selectedCoin,
    selectedCoinAmount,
    pairCoin: pairCoin,
    shareAmount,
    isCoinValid,
    isShareValid,
  };
};

const Liquidity = (props) => {
  const userCtx = useContext(UserContext);
  const [formIsValid, setFormIsValid] = useState(null);
  const parsedData = parseData(
    props.selectedPool,
    props.selectedType,
    userCtx.supportedCoins
  );
  const [poolState, dispatchPool] = useReducer(poolReducer, {
    supportedCoins: userCtx.supportedCoins,
    selectedType: props.selectedType,
    providePools: props.providePools,
    takePools: props.takePools,
    pools:
      props.selectedType === liquidityType.PROVIDE
        ? props.providePools
        : props.takePools,
    selectedPool: props.selectedPool,
    selectedCoinCombination: 0,
    coinCombinations: parsedData?.combinations || [],
    details: parsedData?.details || [],
    maxShareAmount: parsedData?.maxShareAmount || "",
    selectedCoin: !parsedData?.combinations
      ? null
      : parsedData.combinations[0][0],
    selectedCoinAmount: "",
    coinOptions: !parsedData?.combinations ? [] : parsedData.combinations[0],
    pairCoin: null,
    shareAmount: "",
    isCoinValid: null,
    isShareValid: null,
  });

  const typeChangeHandler = (type) => {
    dispatchPool({
      type: "UPDATE_TYPE",
      value: {
        selectedType: type,
      },
    });
  };

  const poolChangeHandler = (pool) => {
    dispatchPool({
      type: "UPDATE_POOL",
      value: {
        selectedPool: pool,
      },
    });
  };

  const selectedCoinCombinationChangeHandler = (index) => {
    dispatchPool({
      type: "UPDATE_SELECTED_COMBINATION",
      value: {
        selectedCoinCombination: index,
      },
    });
  };

  const selectedCoinChangedHandler = (coin) => {
    dispatchPool({
      type: "COIN_UPDATE",
      value: {
        coin,
      },
    });
  };

  const selectedCoinAmountChangedHandler = (amount) => {
    dispatchPool({
      type: "COIN_AMOUNT_UPDATE",
      value: {
        amount,
      },
    });
  };

  const shareAmountChangedHandler = (amount) => {
    dispatchPool({
      type: "SHARE_AMOUNT_UPDATE",
      value: {
        amount,
      },
    });
  };

  const submitHandler = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    if (poolState.selectedType === liquidityType.PROVIDE)
      setFormIsValid(
        poolState.isCoinValid
        // &&   +poolState.pairCoin.amount <= +poolState.pairCoin.max
      );
    else setFormIsValid(poolState.isShareValid);
    return () => {
      // cleanup
    };
  }, [
    poolState.selectedType,
    poolState.isCoinValid,
    // poolState.pairCoin,
    poolState.isShareValid,
  ]);

  return (
    <form className={`responsive liquidity`} onSubmit={submitHandler}>
      <main className="main">
        <TypeTabBar
          types={Object.values(liquidityType)}
          selectedType={poolState.selectedType}
          onSelect={typeChangeHandler}
        />
        {poolState.pools.length === 0 && (
          <EmptyPool selectedType={poolState.selectedType} />
        )}
        {poolState.pools.length !== 0 && (
          <React.Fragment>
            <FilterDropDown
              label="Select pool"
              selected={poolState.selectedPool}
              data={poolState.pools}
              onSelect={poolChangeHandler}
              filterProperty="name"
              placeholder="Select pool"
              hint="No product found."
            >
              {PoolOption}
            </FilterDropDown>
            <RadioOption
              name={props.name}
              radioOption={poolState.coinCombinations.map((coins) =>
                coins
                  .slice(1)
                  .reduce(
                    (prev, curr) => prev + ` + ${curr.symbol}`,
                    coins[0].symbol
                  )
              )}
              radioIndex={poolState.selectedCoinCombination}
              onChange={selectedCoinCombinationChangeHandler}
            />
            {poolState.selectedType === liquidityType.PROVIDE && (
              <ProvideAmount
                coinOptions={
                  poolState.coinCombinations[poolState.selectedCoinCombination]
                }
                selectedCoin={poolState.selectedCoin}
                selectedCoinAmount={poolState.selectedCoinAmount}
                isValid={poolState.isCoinValid}
                pairCoin={poolState.pairCoin}
                onSelectedCoinChange={selectedCoinChangedHandler}
                onSelectedCoinAmountChange={selectedCoinAmountChangedHandler}
              />
            )}
            {poolState.selectedType === liquidityType.TAKE && (
              <TakeAmount
                coinOptions={poolState.coinOptions}
                shareAmount={poolState.shareAmount}
                maxShareAmount={poolState.maxShareAmount}
                onChange={shareAmountChangedHandler}
              />
            )}
          </React.Fragment>
        )}
      </main>
      <div className="sub">
        <Summary details={poolState.details} />
        <div className={classes.button}>
          <Button type="submit" disabled={!formIsValid}>
            Add
          </Button>
        </div>
      </div>
    </form>
  );
};

export default Liquidity;
