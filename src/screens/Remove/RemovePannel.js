import React, { useState, useContext } from "react";
import InputAmount from "../../components/UI/InputAmount";
import Summary from "../../components/UI/Summary";
import classes from "./RemovePannel.module.css";
import { PairTile } from "./Pairs";
import Dialog from "../../components/UI/Dialog";
import FilterList from "../../components/UI/FilterList";
import Button from "../../components/UI/Button";
import PoolOption from "../../components/PoolOption/PoolOption";
import CoinInput from "../../components/CoinInput/CoinInput";
import TraderContext from "../../store/trader-context";

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
        <Dialog title="Select Token" onCancel={() => setOpenDialog(false)}>
          <FilterList
            onSelect={selectHandler}
            data={props.pools}
            filterProperty="symbol"
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
              />
            )}
          </div>
          <div className={classes.content}>
            <InputAmount
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
                />
              ))}
          </div>
          <div className={classes.button}>
            <div className={classes["approve-button-container"]}>
              {props.displayApprovePoolContract && (
                <Button
                  type="button"
                  onClick={() =>
                    props.approveHandler(
                      props.selectedPool?.contract,
                      (result) => {
                        props.setPoolContractIsApprove(result);
                        props.setDisplayApprovePoolContract(!result);
                      }
                    )
                  }
                >
                  Approve {props.selectedPool.name}
                </Button>
              )}
            </div>
            <Button type="submit" disabled={!props.poolContractIsApprove}>
              {props.isLoading ? "Loading..." : "Confirm"}
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
