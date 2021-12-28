import React, { useContext } from "react";
import CoinInput from "../../components/CoinInput/CoinInput";
import Button from "../../components/UI/Button";
import PannelSetting from "../../components/UI/PannelSetting";
import Summary from "../../components/UI/Summary";
import ConnectorContext from "../../store/connector-context";
import SafeMath from "../../Utils/safe-math";
import { randomID } from "../../Utils/utils";
import classes from "./AddLiquidityPannel.module.css";

const AddLiquidityPannel = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  return (
    <div className={classes.earn}>
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
          onSelect={(active) =>
            props.coinUpdateHandler({ active, type: "selected" })
          }
          onChange={(data) =>
            props.changeAmountHandler({
              activeAmount: data,
              type: "selected",
              pool: props.selectedPool,
            })
          }
          options={connectorCtx.supportedTokens}
        />
        <div className="icon">
          <div>&#43;</div>
        </div>
        <CoinInput
          selected={props.pairedCoin}
          value={props.pairedCoinAmount}
          onSelect={(passive) =>
            props.coinUpdateHandler({ passive, type: "paired" })
          }
          onChange={(data) =>
            props.changeAmountHandler({
              passiveAmount: data,
              type: "paired",
              pool: props.selectedPool,
            })
          }
          options={connectorCtx.supportedTokens}
        />
        {props.selectedPool && (
          <div className={classes.details}>
            {props.details?.map((detail) => (
              <div className={classes.detail} key={randomID(6)}>
                <div className={classes.value}>{detail.value}</div>
                <div className={classes.label}>{detail.title}</div>
              </div>
            ))}
          </div>
        )}
        <div className={classes.button}>
          <div className={classes["approve-button-container"]}>
            {props.displayApproveSelectedCoin && !props.selectedCoinIsApprove && (
              <Button
                type="button"
                onClick={() =>
                  props.approveHandler(props.selectedCoin?.contract, "selected")
                }
              >
                Approve {props.selectedCoin?.symbol}
              </Button>
            )}
            {props.displayApprovePairedCoin && !props.pairedCoinIsApprove && (
              <Button
                type="button"
                onClick={() =>
                  props.approveHandler(props.pairedCoin?.contract, "paired")
                }
              >
                Approve {props.pairedCoin?.symbol}
              </Button>
            )}
          </div>
          <Button
            type="submit"
            disabled={
              props.isLoading ||
              !props.selectedCoin?.balanceOf ||
              !props.pairedCoin?.balanceOf ||
              !props.selectedCoinAmount ||
              !props.pairedCoinAmount ||
              SafeMath.gt(
                props.selectedCoinAmount,
                props.selectedCoin?.balanceOf
              ) ||
              SafeMath.gt(
                props.pairedCoinAmount,
                props.pairedCoin?.balanceOf
              ) ||
              SafeMath.gt(
                props.selectedCoinAmount,
                props.selectedCoinAllowance
              ) ||
              SafeMath.gt(props.pairedCoinAmount, props.pairedCoinAllowance)
            }
          >
            {props.isLoading ||
            (props.selectedCoinIsApprove &&
              !SafeMath.gt(props.selectedCoinAllowance, "0")) ||
            (props.pairedCoinIsApprove &&
              !SafeMath.gt(props.pairedCoinAllowance, "0"))
              ? "Loading..."
              : !props.selectedCoin || !props.pairedCoin
              ? "Select Token"
              : !props.selectedCoin?.balanceOf ||
                SafeMath.gt(
                  props.selectedCoinAmount,
                  props.selectedCoin?.balanceOf
                )
              ? `Insufficient ${props.selectedCoin?.symbol || ""} balance`
              : !props.pairedCoin?.balanceOf ||
                SafeMath.gt(props.pairedCoinAmount, props.pairedCoin?.balanceOf)
              ? `Insufficient ${props.pairedCoin?.symbol || ""} balance`
              : "Confirm"}
          </Button>
        </div>
      </main>
      <div className="sub">
        <Summary title="Summary" data={props.summary} />
      </div>
    </div>
  );
};

export default AddLiquidityPannel;