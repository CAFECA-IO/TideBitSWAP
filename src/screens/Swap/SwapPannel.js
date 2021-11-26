import React, {  useContext } from "react";
import CoinInput from "../../components/CoinInput/CoinInput";
import Button from "../../components/UI/Button";
import Summary from "../../components/UI/Summary";
import classes from "./SwapPannel.module.css";
import ConnectorContext from "../../store/connector-context";
import Chart from "react-apexcharts";
import SafeMath from "../../Utils/safe-math";
import { formateDecimal } from "../../Utils/utils";

const SwapPannel = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  console.log(`connectorCtx.supportedTokens`, connectorCtx.supportedTokens);
  
  return (
    <React.Fragment>
      {props?.selectedCoin?.contract && (
        <Chart
          options={props.data.options}
          series={props.data.series}
          type="candlestick"
          height={350}
        />
      )}
      <div className={classes.swap}>
        <main className={classes.main}>
          <CoinInput
            selected={props.selectedCoin}
            value={props.selectedCoinAmount}
            onSelect={(data) => props.coinUpdateHandler(data, "selected")}
            onChange={(data) => props.amountUpdateHandler(data, "selected")}
            options={connectorCtx.supportedTokens}
          />
          <div className="icon">
            <div>&#x21c5;</div>
          </div>
          <CoinInput
            selected={props.pairedCoin}
            value={props.pairedCoinAmount}
            onSelect={(data) => props.coinUpdateHandler(data, "paired")}
            onChange={(data) => props.amountUpdateHandler(data, "paired")}
            options={connectorCtx.supportedTokens}
          />
          {props.price && (
            <div className={classes.hint}>
              `1 ${props.selectedPool?.token0?.symbol || "--"} ≈ $
              {props.price ? formateDecimal(props.price, 4) : "--"} $
              {props.selectedPool?.token1?.symbol || "--"}`
            </div>
          )}
          <div className={classes.button}>
            <div className={classes["approve-button-container"]}>
              {props.displayApproveSelectedCoin && (
                <Button type="button" onClick={props.approveHandler}>
                  Approve {props.selectedCoin.symbol}
                </Button>
              )}
            </div>
            <Button
              type="submit"
              disabled={
                props.isLoading || !!!props.selectedPool || !props.isApprove
              }
            >
              {
                props.isLoading
                  ? "Loading..."
                  : !!!props.selectedPool && props.selectedCoin && props.pairedCoin
                  ? "Insufficient liquidity for this trade."
                  : SafeMath.gt(
                      props.selectedCoinAmount,
                      props.selectedCoin?.balanceOf || "0"
                    )
                  ? `Insufficient ${props.selectedCoin?.symbol} balance`
                  : "Swap"
                // : "Select a token"
              }
            </Button>
          </div>
        </main>
        <div className="sub">
          <Summary details={props.details} />
        </div>
      </div>
    </React.Fragment>
  );
};

export default SwapPannel;
