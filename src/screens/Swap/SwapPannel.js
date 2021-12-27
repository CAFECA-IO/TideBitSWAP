import React, { useContext, useState } from "react";
import CoinInput from "../../components/CoinInput/CoinInput";
import Button from "../../components/UI/Button";
import Summary from "../../components/UI/Summary";
import classes from "./SwapPannel.module.css";
import ConnectorContext from "../../store/connector-context";
import SafeMath from "../../Utils/safe-math";
import PannelSetting from "../../components/UI/PannelSetting";

const SwapPannel = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  // const [displaySettings, setDisplaySettings] = useState(false);

  // const slippageHandler = () => {
  //   setDisplaySettings(!displaySettings);
  // };
  return (
    <React.Fragment>
      <div className={classes.swap}>
        <main className={classes.main}>
          <PannelSetting
            slippage={props.slippage}
            slippageAutoHander={props.slippageAutoHander}
            slippageChangeHander={props.slippageChangeHander}
            deadline={props.deadline}
            deadlineChangeHander={props.deadlineChangeHander}
          />
          <CoinInput
            selected={props.selectedCoin}
            value={props.selectedCoinAmount}
            onSelect={(data) => props.coinUpdateHandler(data, "selected")}
            onChange={(data) =>
              props.changeAmountHandler({
                activeAmount: data,
                type: "selected",
              })
            }
            options={connectorCtx.supportedTokens}
          />
          <div className="icon" onClick={props.tokenExchangerHander}>
            <div>&#x21c5;</div>
          </div>
          <CoinInput
            selected={props.pairedCoin}
            value={props.pairedCoinAmount}
            onSelect={(data) => props.coinUpdateHandler(data, "paired")}
            onChange={(data) =>
              props.changeAmountHandler({ passiveAmount: data, type: "paired" })
            }
            options={connectorCtx.supportedTokens}
          />
          <div className={classes.button}>
            <div className={classes["approve-button-container"]}>
              {props.displayApproveSelectedCoin && !props.isApprove && (
                <Button type="button" onClick={props.approveHandler}>
                  Approve {props.selectedCoin?.symbol}
                </Button>
              )}
            </div>
            <Button
              type="submit"
              disabled={
                !props.selectedCoin ||
                !props.pairedCoin ||
                !props.selectedCoinAmount ||
                !props.pairedCoinAmount ||
                props.isLoading ||
                !props.isApprove ||
                !SafeMath.gt(props.allowanceAmount, "0") ||
                props.poolInsufficient ||
                SafeMath.gt(
                  props.selectedCoinAmount,
                  props.selectedCoin?.balanceOf || "0"
                )
              }
            >
              {
                props.isLoading ||
                (props.isApprove && !SafeMath.gt(props.allowanceAmount, "0"))
                  ? "Loading..."
                  : props.poolInsufficient ||
                    (!props.selectedPool &&
                      props.selectedCoin &&
                      props.pairedCoin)
                  ? "Insufficient liquidity for this trade."
                  : SafeMath.gt(
                      props.selectedCoinAmount,
                      props.selectedCoin?.balanceOf || "0"
                    )
                  ? `Insufficient ${props.selectedCoin?.symbol || ""} balance`
                  : "Swap"
                // : "Select a token"
              }
            </Button>
          </div>
        </main>
        <div className="sub">
          <Summary title="Summary" data={props.details} />
        </div>
      </div>
    </React.Fragment>
  );
};

export default SwapPannel;
