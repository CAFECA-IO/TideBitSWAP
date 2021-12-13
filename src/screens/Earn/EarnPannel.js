import React, { useContext } from "react";
import CoinInput from "../../components/CoinInput/CoinInput";
import Button from "../../components/UI/Button";
import Summary from "../../components/UI/Summary";
import ConnectorContext from "../../store/connector-context";
import SafeMath from "../../Utils/safe-math";
import { randomID } from "../../Utils/utils";
import classes from "./EarnPannel.module.css";

const EarnPannel = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  return (
    <div className={classes.earn}>
      <main className={classes.main}>
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
        <div className="icon">
          <div>&#43;</div>
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
            {props.displayApproveSelectedCoin && (
              <Button
                type="button"
                onClick={() =>
                  props.approveHandler(props.selectedCoin?.contract, "selected")
                }
              >
                Approve {props.selectedCoin?.symbol}
              </Button>
            )}
            {props.displayApprovePairedCoin && (
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
              !props.selectedCoinIsApprove ||
              !props.pairedCoinIsApprove ||
              !props.selectedCoin?.balanceOf ||
              !props.pairedCoin?.balanceOf ||
              !props.selectedCoinAmount ||
              !props.pairedCoinAmount ||
              SafeMath.gt(
                props.selectedCoinAmount,
                props.selectedCoin?.balanceOf
              ) ||
              SafeMath.gt(props.pairedCoinAmount, props.pairedCoin?.balanceOf)
            }
          >
            {props.isLoading
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

export default EarnPannel;
