import React, { useState, useEffect, useContext, useCallback } from "react";
import CoinInput from "../../components/CoinInput/CoinInput";
import Button from "../../components/UI/Button";
import Summary from "../../components/UI/Summary";
import classes from "./SwapPannel.module.css";
import { coinPairUpdateHandler, amountUpdateHandler } from "../../Utils/utils";
import ConnectorContext from "../../store/connector-context";
import { useHistory, useLocation } from "react-router";
import Chart from "react-apexcharts";
import {
  getDummyCandleStickData,
  randomCandleStickData,
} from "../../Utils/utils";
import SafeMath from "../../Utils/safe-math";

export const details = [
  {
    title: "Price",
    value: "--",
    explain:
      "Estimated price of the swap, not the final price that the swap is executed.",
  },
  {
    title: "Slip Price",
    value: "--",
    explain:
      "The estimated percentage that the ultimate executed price of the swap deviates from current price due to trading amount.",
  },
  {
    title: "Fee",
    value: "--",
    explain: "Trade transaction fee collected by liquidity providers.",
  },
  {
    title: "Minimun Amount",
    value: "--",
    // explain: "Trade transaction fee collected by liquidity providers.",
  },
];

const SwapPannel = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isApprove, setIsApprove] = useState(false);
  const [displayApproveSellCoin, setDisplayApproveSellCoin] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const [data, setData] = useState(getDummyCandleStickData());
  const [selectedPool, setSelectedPool] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [selectedCoinAmount, setSelectedCoinAmount] = useState("");
  const [pairedCoin, setPairedCoin] = useState(null);
  const [pairedCoinAmount, setPairedCoinAmount] = useState("");

  const changeAmountHandler = useCallback(
    async (value, type) => {
      console.log(value, type);
      let updateSelectedAmount, updatePairedAmount;
      setIsLoading(true);
      switch (type) {
        case "selected":
          updateSelectedAmount = selectedCoin
            ? amountUpdateHandler(value, selectedCoin.balanceOf)
            : value;

          if (selectedPool) {
            updatePairedAmount = await connectorCtx.getAmountsOut(
              updateSelectedAmount,
              [selectedCoin, pairedCoin]
            );
            console.log(`updatePairedAmount`, updatePairedAmount);
            setPairedCoinAmount(updatePairedAmount);
          }
          setSelectedCoinAmount(updateSelectedAmount);
          break;
        case "paired":
          updatePairedAmount = pairedCoin
            ? amountUpdateHandler(value, pairedCoin.balanceOf)
            : value;
          if (selectedPool) {
            updateSelectedAmount = await connectorCtx.getAmountsIn(
              updatePairedAmount,
              [selectedCoin, pairedCoin]
            );
            console.log(`updateSelectedAmount`, updateSelectedAmount);
            setSelectedCoinAmount(updateSelectedAmount);
          }
          setPairedCoinAmount(updatePairedAmount);
          break;
        default:
          break;
      }
      setIsLoading(false);
    },
    [connectorCtx, pairedCoin, selectedCoin, selectedPool]
  );

  const coinUpdateHandler = useCallback(
    async (token, type) => {
      let update, _active, _passive;
      switch (type) {
        case "selected":
          update = coinPairUpdateHandler(
            token,
            pairedCoin,
            connectorCtx.supportedTokens
          );
          ({ active: _active, passive: _passive } = update);
          setData(getDummyCandleStickData(randomCandleStickData()));
          break;
        case "paired":
          if (!selectedCoin) {
            _active = connectorCtx.supportedTokens.find((t) =>
              token.contract === connectorCtx.nativeCurrency.contract
                ? t.contract !== connectorCtx.nativeCurrency.contract
                : t.contract === connectorCtx.nativeCurrency.contract
            );
            _passive = token;
          } else {
            update = coinPairUpdateHandler(
              selectedCoin,
              token,
              connectorCtx.supportedTokens
            );
            ({ active: _active, passive: _passive } = update);
          }
          break;
        default:
          break;
      }
      setSelectedCoin(_active);
      setPairedCoin(_passive);
      history.push({
        pathname: `/swap/${_active.contract}/${
          _passive?.contract ? _passive.contract : ""
        }`,
      });
      if (_active && _passive) {
        const pool = await connectorCtx.getSelectedPool(
          connectorCtx.supportedPools,
          _active,
          _passive
        );
        setSelectedPool(pool);
        if (pool) {
          if (_active.contract !== pool.token0.contract) {
            setSelectedCoin(_passive);
            setPairedCoin(_active);
            history.push({
              pathname: `/swap/${_passive.contract}/${_active.contract}`,
            });
          }
          changeAmountHandler(selectedCoinAmount, "selected");
        }
        console.log(`pool`, pool);
      }
    },
    [
      changeAmountHandler,
      connectorCtx,
      history,
      pairedCoin,
      selectedCoin,
      selectedCoinAmount,
    ]
  );

  useEffect(() => {
    if (location.pathname.includes(selectedCoin?.contract)) return;
    const coin = connectorCtx.supportedTokens.find((asset) =>
      location.pathname.includes(asset.contract)
    );
    console.log(`SwapPannel`, coin);
    if (coin) coinUpdateHandler(coin, "selected");

    return () => {};
  }, [
    coinUpdateHandler,
    connectorCtx.supportedTokens,
    location.pathname,
    selectedCoin?.contract,
  ]);

  useEffect(() => {
    if (connectorCtx.isConnected && connectorCtx.connectedAccount)
      if (
        selectedCoin?.balanceOf &&
        SafeMath.gt(selectedCoinAmount, "0") &&
        SafeMath.gt(pairedCoinAmount, "0") &&
        SafeMath.gt(selectedCoin.balanceOf, selectedCoinAmount)
      ) {
        setIsLoading(true);
        connectorCtx
          .isAllowanceEnough(
            selectedCoin.contract,
            selectedCoinAmount,
            selectedCoin.decimals
          )
          .then((isSellCoinEnough) => {
            setDisplayApproveSellCoin(!isSellCoinEnough);
            setIsApprove(isSellCoinEnough);
            setIsLoading(false);
          });
      }
    // }

    return () => {
      console.log("CLEANUP");
    };
  }, [connectorCtx, selectedCoin, selectedCoinAmount, pairedCoinAmount]);

  const approveHandler = async () => {
    const sellCoinApprove = await connectorCtx.approve(selectedCoin.contract);
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
          selectedCoinAmount,
          pairedCoinAmount,
          [selectedCoin, pairedCoin]
        );
        console.log(`result`, result);
        history.push({ pathname: `/assets/` });
      } catch (error) {}
      setIsApprove(true);
    }
  };

  return (
    <React.Fragment>
      {selectedCoin?.contract && (
        <Chart
          options={data.options}
          series={data.series}
          type="candlestick"
          height={350}
        />
      )}
      <form className={classes.swap} onSubmit={swapHandler}>
        <main className={classes.main}>
          <CoinInput
            label="Sell"
            value={selectedCoinAmount}
            onChange={(data) => changeAmountHandler(data, "selected")}
            selected={selectedCoin}
            onSelect={(coin) => coinUpdateHandler(coin, "selected")}
            options={connectorCtx.supportedTokens}
          />
          <div className="icon">
            <div>&#x21c5;</div>
          </div>
          <CoinInput
            label="Buy"
            value={pairedCoinAmount}
            onChange={(data) => changeAmountHandler(data, "paired")}
            selected={pairedCoin}
            onSelect={(coin) => coinUpdateHandler(coin, "paired")}
            options={connectorCtx.supportedTokens}
          />
          <div className={classes.hint}>
            The ultimate price and output is determined by the amount of tokens
            in the pool at the time of your swap.
          </div>
          <div className={classes.button}>
            <div className={classes["approve-button-container"]}>
              {displayApproveSellCoin && (
                <Button type="button" onClick={approveHandler}>
                  Approve {selectedCoin.symbol}
                </Button>
              )}
            </div>
            <Button type="submit" disabled={!isApprove}>
              {
                isLoading
                  ? "Loading..."
                  : // : selectedPool === false
                    // ? "Insufficient liquidity for this trade."
                    // : selectedPool === true
                    // ? `Insufficient ${selectedCoin.symbol} balance`
                    "Swap"
                // : "Select a token"
              }
            </Button>
          </div>
        </main>
        <div className="sub">
          <Summary details={details} />
        </div>
      </form>
    </React.Fragment>
  );
};

export default SwapPannel;
