import React, { useContext, useState } from "react";
import CoinInput from "../../components/CoinInput/CoinInput";
import Button from "../../components/UI/Button";
import Summary from "../../components/UI/Summary";
import classes from "./SwapPannel.module.css";
import ConnectorContext from "../../store/connector-context";
import SafeMath from "../../Utils/safe-math";
import Backdrop from "../../components/UI/Backdrop";

const SwapPannel = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [displaySettings, setDisplaySettings] = useState(false);

  const slippageHandler = () => {
    setDisplaySettings(!displaySettings);
  };
  return (
    <React.Fragment>
      <div className={classes.swap}>
        <main className={classes.main}>
          <div className={classes.settings} open={displaySettings}>
            {/* <div
              className={classes["settings-modal"]}
              onClick={slippageHandler}
            ></div> */}
            {displaySettings && (
              <Backdrop onCancel={slippageHandler} className="transparent" />
            )}
            <div className={classes["settings-icon"]} onClick={slippageHandler}>
              &#8857;
            </div>
            <div className={classes["settings-pannel"]}>
              <div className={classes["settings-header"]}>
                Transaction settings
              </div>
              <div className={classes["settings-option-box"]}>
                <div className={classes["settings-title"]}>
                  Slippage tolerance ?
                </div>
                <div className={classes["settings-option"]}>
                  <button
                    className={classes["settings-button"]}
                    onClick={props.slippageAutoHander}
                  >
                    Auto
                  </button>

                  <div className={classes["settings-input"]}>
                    <input
                      placeholder="0.10"
                      type="number"
                      value={props.slippage?.value}
                      onInput={props.slippageChangeHander}
                      readOnly={!!props.readOnly}
                    />
                    <div className={classes["input-hint"]}>&#37;</div>
                  </div>
                </div>
                {props.slippage?.message && (
                  <div className={classes.message}>
                    <div>{props.slippage?.message}</div>
                  </div>
                )}
              </div>
              <div className={classes["settings-option-box"]}>
                <div className={classes["settings-title"]}>
                  Transaction deadline ?
                </div>
                <div className={classes["settings-option"]}>
                  <div className={classes["settings-input"]}>
                    <input
                      placeholder="30"
                      type="number"
                      value={props.deadline}
                      onInput={props.deadlineChangeHander}
                      readOnly={!!props.readOnly}
                    />
                  </div>
                  <div className={classes.text}>minutes</div>
                </div>
              </div>
              {/* <div className={classes["settings-option-box"]}>
                <div className={classes["settings-header"]}>
                  Interface Settings
                </div>
                <div className={classes["settings-option"]}>
                  <div className={classes["settings-title"]}>Expert Mode ?</div>
                  <label className={classes.switch}>
                    <input
                      type="checkbox"
                      onChange={props.expertModeChangeHandler}
                      checked={props.openExpertMode}
                    ></input>
                    <span
                      className={`${classes.slider} ${classes.round}`}
                    ></span>
                  </label>
                </div>
              </div> */}
            </div>
          </div>
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
              {props.displayApproveSelectedCoin && (
                <Button type="button" onClick={props.approveHandler}>
                  Approve {props.selectedCoin?.symbol}
                </Button>
              )}
            </div>
            <Button
              type="submit"
              disabled={
                props.isLoading ||
                !!!props.selectedPool ||
                !props.isApprove ||
                SafeMath.gt(
                  props.selectedCoinAmount,
                  props.selectedCoin?.balanceOf || "0"
                )
              }
            >
              {
                props.isLoading
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
