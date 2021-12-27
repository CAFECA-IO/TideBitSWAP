import React, { useState, useContext } from "react";
import InputAmount from "../../components/UI/InputAmount";
import Summary from "../../components/UI/Summary";
import classes from "./RemovePannel.module.css";
import { PairTile } from "../../components/UI/Pairs";
import Dialog from "../../components/UI/Dialog";
import FilterList from "../../components/UI/FilterList";
import Button from "../../components/UI/Button";
import PoolOption from "../../components/PoolOption/PoolOption";
import CoinInput from "../../components/CoinInput/CoinInput";
import TraderContext from "../../store/trader-context";
import PannelSetting from "../../components/UI/PannelSetting";
import SafeMath from "../../Utils/safe-math";

const RemovePannel = (props) => {
  const traderCtx = useContext(TraderContext);
  const [openDialog, setOpenDialog] = useState(false);

  const selectHandler = (option) => {
    props.onSelect(option);
    setOpenDialog(false);
  };
  return (
    <React.Fragment>
      {openDialog && (
        <Dialog title="Select Pool" onCancel={() => setOpenDialog(false)}>
          <FilterList
            onSelect={selectHandler}
            data={props.pools}
            filterProperty="name"
          >
            {(data) =>
              PairTile({
                pool: data,
                fiat: traderCtx.fiat,
                onSelect: () => props.onSelect(data),
              })
            }
          </FilterList>
        </Dialog>
      )}
      <div className={classes.remove}>
        <main className={classes.main}>
          <div className={classes.header}>
            {props.selectedPool && (
              <PoolOption
                token0={props.selectedPool.token0}
                token1={props.selectedPool.token1}
                name={props.selectedPool.name}
                onSelect={() => setOpenDialog(true)}
              />
            )}
            <PannelSetting
              slippage={props.slippage}
              slippageAutoHander={props.slippageAutoHander}
              slippageChangeHander={props.slippageChangeHander}
              deadline={props.deadline}
              deadlineChangeHander={props.deadlineChangeHander}
            />
          </div>
          <div className={classes.content}>
            <InputAmount
              className="pannel"
              max={props.selectedPool?.balanceOf || "0"}
              symbol=""
              onChange={props.changeAmountHandler}
              value={props.shareAmount}
            />
            {+props.shareAmount > 0 &&
              props.coinOptions.map((coin) => (
                <CoinInput
                  key={coin.contract}
                  label="Coin"
                  selected={coin}
                  value={coin.amount}
                  readOnly={true}
                  removeDetail={true}
                  onSelect={() => {}}
                />
              ))}
          </div>
          <div className={classes.button}>
            <div className={classes["approve-button-container"]}>
              {props.displayApprovePoolContract &&
                !props.poolContractIsApprove && (
                  <Button type="button" onClick={props.approveHandler}>
                    Approve {props.selectedPool.name}
                  </Button>
                )}
            </div>
            <Button
              type="submit"
              disabled={
                props.isLoading ||
                !props.selectedPool?.balanceOf ||
                !props.shareAmount ||
                SafeMath.gt(
                  props.shareAmount,
                  props.selectedPool?.balanceOf || "0"
                ) ||
                SafeMath.gt(props.shareAmount, props.poolAllowance)
              }
            >
              {props.isLoading ||
              (props.poolContractIsApprove &&
                !SafeMath.gt(props.poolAllowance, "0"))
                ? "Loading..."
                : SafeMath.gt(
                    props.shareAmount,
                    props.selectedPool?.balanceOf || "0"
                  )
                ? "Insufficient share amount"
                : "Confirm"}
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

export default RemovePannel;
