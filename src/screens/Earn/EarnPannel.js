import React, { useState, useContext } from "react";
import { useHistory, useLocation } from "react-router";
import CoinInput from "../../components/CoinInput/CoinInput";
import Button from "../../components/UI/Button";
import Summary from "../../components/UI/Summary";
import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
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
          onChange={(data) => props.amountUpdateHandler(data, "selected")}
          options={connectorCtx.supportedTokens}
        />
        <div className="icon">
          <div>&#43;</div>
        </div>
        <CoinInput
          selected={props.pairedCoin}
          value={props.pairedCoinAmount}
          onSelect={(data) => props.coinUpdateHandler(data, "paired")}
          onChange={(data) => props.amountUpdateHandler(data, "paired")}
          options={connectorCtx.supportedTokens}
        />
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
          <Button type="submit" disabled={!props.selectedCoinIsApprove}>
            {props.isLoading ? "Loading..." : "Confirm"}
          </Button>
        </div>
      </main>
      <div className="sub">
        <Summary details={props.details} />
      </div>
    </div>
  );
};

export default EarnPannel;
