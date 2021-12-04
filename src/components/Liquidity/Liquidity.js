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
} from "../../Utils/utils";
import { liquidityType } from "../../constant/constant";
import SafeMath from "../../Utils/safe-math";
import ConnectorContext from "../../store/connector-context";

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
          details: parseData(null, selectedType).details,
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
        selectedCoin.balanceOf
      );
      isCoinValid = +selectedCoinAmount === 0 ? null : +selectedCoinAmount > 0;
      if (isCoinValid) {
        // HTTPREQUEST: get pairCoinAmount
        pairCoin = prevState.coinOptions
          .filter((coin) => coin.symbol !== selectedCoin.symbol)
          .map((coin) => {
            // let amount = 0.1;
            let amount = SafeMath.gt(selectedCoin.balanceOfPool, "0")
              ? SafeMath.mult(
                  SafeMath.div(coin.balanceOfPool, selectedCoin.balanceOfPool),
                  selectedCoinAmount
                )
              : SafeMath.mult(
                  SafeMath.div(coin.balanceOf, selectedCoin.balanceOf),
                  selectedCoinAmount
                );
            isCoinValid = !(+amount > +coin.balanceOf);
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
          const balanceOfPool = coin.pools.find(
            (pool) => pool.poolContract === prevState.selectedPool.poolContract
          ).poolBalanceOfToken;
          let amount = SafeMath.mult(
            SafeMath.mult(
              SafeMath.div(
                shareAmount,
                (selectedPool || prevState.selectedPool).totalSupply
              ),
              balanceOfPool
            ),
            0.9
          );
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
    const parsedData = parseData(selectedPool, selectedType);
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
    coinOptions = coinOptions.map((coin) => {
      let amount = SafeMath.mult(
        SafeMath.div(
          shareAmount,
          (selectedPool || prevState.selectedPool).totalSupply
        ),
        coin.balanceOfPool
      );
      return {
        ...coin,
        amount,
      };
    });
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
  const connectorCtx = useContext(ConnectorContext);
  const parsedData = parseData(props.selectedPool, props.selectedType);
  const [displayApproveSelectedCoin, setDisplayApproveSelectedCoin] =
    useState(false);
  const [displayApprovePairedCoin, setDisplayApprovePairedCoin] =
    useState(false);
  const [displayApprovePoolContract, setDisplayApprovePoolContract] =
    useState(false);
  const [selectedCoinIsApprove, setSelectedCoinIsApprove] = useState(false);
  const [pairedCoinIsApprove, setPairedCoinIsApprove] = useState(false);
  const [poolContractIsApprove, setPoolContractIsApprove] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [poolState, dispatchPool] = useReducer(poolReducer, {
    supportedCoins: connectorCtx.supportedTokens,
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
  useEffect(() => {
    if (
      poolState.selectedType === liquidityType.PROVIDE &&
      poolState.isCoinValid
    ) {
      setIsLoading(true);
      connectorCtx
        .isAllowanceEnough(
          poolState.selectedCoin.contract,
          poolState.selectedCoinAmount,
          poolState.selectedCoin.decimals
        )
        .then((selectedCoinAllowanceIsEnough) => {
          setDisplayApproveSelectedCoin(!selectedCoinAllowanceIsEnough);
          setSelectedCoinIsApprove(selectedCoinAllowanceIsEnough);
          setIsLoading(false);
        });
      setIsLoading(true);
      connectorCtx
        .isAllowanceEnough(
          poolState.pairCoin[0].contract,
          poolState.pairCoin[0].amount,
          poolState.pairCoin[0].decimals
        )
        .then((pairedCoinAllowanceIsEnough) => {
          setDisplayApprovePairedCoin(!pairedCoinAllowanceIsEnough);
          setPairedCoinIsApprove(pairedCoinAllowanceIsEnough);
          setIsLoading(false);
        });
    } else if (
      poolState.selectedType === liquidityType.TAKE &&
      poolState.isShareValid
    ) {
      setIsLoading(true);
      connectorCtx
        .isAllowanceEnough(
          poolState.selectedPool.poolContract,
          poolState.shareAmount,
          poolState.selectedPool.decimals
        )
        .then((isPoolPairEnough) => {
          setDisplayApprovePoolContract(!isPoolPairEnough);
          setPoolContractIsApprove(isPoolPairEnough);
          setIsLoading(false);
        });
    }
    return () => {
      console.log(`cleanup Liquidity`);
    };
  }, [
    connectorCtx,
    poolState.isCoinValid,
    poolState.isShareValid,
    poolState.pairCoin,
    poolState.selectedCoin.contract,
    poolState.selectedCoin.decimals,
    poolState.selectedCoinAmount,
    poolState.selectedPool.decimals,
    poolState.selectedPool.poolContract,
    poolState.selectedType,
    poolState.shareAmount,
  ]);

  const approveHandler = async (contract, callback) => {
    const coinApproved = await connectorCtx.approve(contract);
    callback(coinApproved);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    if (poolState.selectedType === liquidityType.PROVIDE) {
      if (selectedCoinIsApprove && pairedCoinIsApprove) {
        setSelectedCoinIsApprove(false);
        try {
          const provideLiquidityResut = await connectorCtx.provideLiquidity(
            poolState.selectedCoin,
            poolState.pairCoin[0],
            poolState.selectedCoinAmount,
            poolState.pairCoin[0].amount
          );
          console.log(`provideLiquidityResut`, provideLiquidityResut);
          props.onClose();
        } catch (error) {}
        setSelectedCoinIsApprove(true);
      }
    }
    if (poolState.selectedType === liquidityType.TAKE) {
      console.log(`poolState.selectedPool`, poolState.selectedPool);
      if (poolContractIsApprove) {
        setPoolContractIsApprove(false);
        try {
          const takeLiquidityResult = await connectorCtx.takeLiquidity(
            poolState.selectedPool,
            poolState.shareAmount,
            poolState.coinOptions[0].amount,
            poolState.coinOptions[1].amount
          );
          console.log(`takeLiquidityResult`, takeLiquidityResult);
          props.onClose();
        } catch (error) {}
        setPoolContractIsApprove(true);
      }
    }
  };

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
              radioOption={poolState.coinCombinations
                .slice(0, 1)
                .map((coins) =>
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
          {poolState.selectedType === liquidityType.PROVIDE && (
            <div className={classes["approve-button-container"]}>
              {displayApproveSelectedCoin && (
                <Button
                  type="button"
                  onClick={() =>
                    approveHandler(
                      poolState.selectedCoin.contract,
                      (result) => {
                        setSelectedCoinIsApprove(result);
                        setDisplayApproveSelectedCoin(!result);
                      }
                    )
                  }
                >
                  Approve {poolState.selectedCoin.symbol}
                </Button>
              )}
              {displayApprovePairedCoin && (
                <Button
                  type="button"
                  onClick={() =>
                    approveHandler(poolState.pairCoin[0].contract, (result) => {
                      setPairedCoinIsApprove(result);
                      setDisplayApprovePairedCoin(!result);
                    })
                  }
                >
                  Approve {poolState.pairCoin[0].symbol}
                </Button>
              )}
            </div>
          )}
          {poolState.selectedType === liquidityType.TAKE && (
            <div className={classes["approve-button-container"]}>
              {displayApprovePoolContract && (
                <Button
                  type="button"
                  onClick={() =>
                    approveHandler(
                      poolState.selectedPool.poolContract,
                      (result) => {
                        setPoolContractIsApprove(result);
                        setDisplayApprovePoolContract(!result);
                      }
                    )
                  }
                >
                  Approve {poolState.selectedPool.name}
                </Button>
              )}
            </div>
          )}
          <Button
            type="submit"
            disabled={
              poolState.selectedType === liquidityType.PROVIDE
                ? !selectedCoinIsApprove || !pairedCoinIsApprove
                : !poolContractIsApprove
            }
          >
            {isLoading
              ? "Loading..."
              : poolState.selectedType === liquidityType.PROVIDE
              ? "Provide"
              : "Take"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default Liquidity;
