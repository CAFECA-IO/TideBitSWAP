import React, { useState, useContext } from "react";
import Button from "../../components/UI/Button";
import InputAmount from "../../components/UI/InputAmount";
import Summary from "../../components/UI/Summary";
import { dummyDetails } from "../../constant/dummy-data";
import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
import SafeMath from "../../Utils/safe-math";
import { formateDecimal } from "../../Utils/utils";
import classes from "./ImportTokenPannel.module.css";

const ImportTokenPannel = (props) => {
  const userCtx = useContext(UserContext);
  const connectorCtx = useContext(ConnectorContext);

  return (
    <div className={classes["import-token"]}>
      <main className={classes.main}>
        <div className={classes.header}>
          {props.token && (
            <div className={classes.group}>
              <div className={classes.icon}>
                <img src={props.token.iconSrc} alt={props.token.symbol} />
              </div>
              <div className={classes.name}>{props.token.symbol}</div>
            </div>
          )}
        </div>
        <div className={classes.content}>
          <div className={classes.main}>
            <InputAmount
              max={props?.token.balanceOf || ""}
              symbol={props?.token.symbol || ""}
              onChange={props.changeAmountHandler}
              value={props.amount}
            />
            <InputAmount
              max=""
              symbol={""}
              onChange={props.changePriceHandler}
              value={props.price}
            />
          </div>
          <div className={classes.sub}>
            <div className={classes.detail}>
              <div className={classes.data}>
                <div className={classes.title}>Shelf Fee</div>
                <div className={classes.amount}>1 ETH</div>
              </div>
            </div>
          </div>
        </div>
        <div className={classes.button}>
          <div className={classes["approve-button-container"]}>
            {props.displayApproveImportToken && (
              <Button
                type="button"
                onClick={() =>
                  props.approveHandler(props.token.contract, (result) => {
                    props.setImportTokenIsApprove(result);
                    props.setDisplayApproveImportToken(!result);
                  })
                }
              >
                Approve {props.token.symbol}
              </Button>
            )}
          </div>
          <Button type="submit" disabled={!props.importTokenIsApprove}>
            {props.isLoading ? "Loading..." : "Confirm"}
          </Button>
        </div>
      </main>
      <div className="sub">
        <Summary details={dummyDetails} />
      </div>
    </div>
  );
};

export default ImportTokenPannel;
