import React, { useState, useContext } from "react";
import Button from "../../components/UI/Button";
import Dialog from "../../components/UI/Dialog";
import FilterList from "../../components/UI/FilterList";
import InputAmount from "../../components/UI/InputAmount";
import Summary from "../../components/UI/Summary";
import { dummyDetails } from "../../constant/dummy-data";
import UserContext from "../../store/user-context";
import SafeMath from "../../Utils/safe-math";
import { formateDecimal } from "../../Utils/utils";
import classes from "./EarnPannel.module.css";
import { PairTile } from "./Pairs";

const EarnPannel = (props) => {
  const userCtx = useContext(UserContext);
  const [openDialog, setOpenDialog] = useState(false);

  const selectHandler = (option) => {
    props.onSelect(option);
    setOpenDialog(false);
  };
console.log(props)
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
                fiat: userCtx.fiat,
                onSelect: () => props.onSelect(data),
              })
            }
          </FilterList>
        </Dialog>
      )}
      <div className={classes.earn}>
        <main className={classes.main}>
          <div className={classes.header}>
            {props.selectedPool && (
              <div className={classes.group}>
                <div className={classes.icon}>
                  <img
                    src={props.selectedPool.token0.iconSrc}
                    alt={props.selectedPool.token0.symbol}
                  />
                </div>
                <div className={classes.name}>
                  {props.selectedPool.token0.symbol}
                </div>
              </div>
            )}
            {!props.selectedPool && (
               <div className={classes.placeholder}>Select Coin</div>
            )}
            <div className={classes['button-icon']} onClick={() => setOpenDialog(true)}>
              Search
            </div>
          </div>
          <div className={classes.content}>
            <div className={classes.main}>
              <InputAmount
                max={props.selectedPool?.poolBalanceOfToken1 || ""}
                symbol={props.selectedPool?.token0.symbol || "0"}
                onChange={props.changeAmountHandler}
                value={props.selectedCoinAmount}
              />
            </div>
            <div className={classes.sub}>
              <div className={classes.detail}>
                <div className={classes.data}>
                  <div className={classes.title}>My Share</div>
                  <div className={classes.amount}>{`${userCtx.fiat.dollarSign} ${
                    props.selectedPool?.share
                      ? formateDecimal(
                        props.selectedPool.balanceOfToken0InPool,
                          4
                        )
                      : "0"
                  }`}</div>
                </div>
                <hr />
                <div className={classes.data}>
                  <div className={classes.title}>Total Reward</div>
                  <div className={classes.amount}>{`${
                    userCtx.fiat.dollarSign
                  } ${props.selectedPool?.rewards || "0"}`}</div>
                </div>
              </div>
            </div>
          </div>
          <div className={classes.button}>
            <div className={classes["approve-button-container"]}>
              {props.displayApproveSelectedCoin && (
                <Button
                  type="button"
                  onClick={() =>
                    props.approveHandler(
                      props.selectedPool.token0.contract,
                      (result) => {
                        props.setSelectedCoinIsApprove(result);
                        props.setDisplayApproveSelectedCoin(!result);
                      }
                    )
                  }
                >
                  Approve {props.selectedPool.token0.symbol}
                </Button>
              )}
              {props.displayApprovePairedCoin && (
                <Button
                  type="button"
                  onClick={() =>
                    props.approveHandler(
                      props.selectedPool.token1.contract,
                      (result) => {
                        props.setPairedCoinIsApprove(result);
                        props.setDisplayApprovePairedCoin(!result);
                      }
                    )
                  }
                >
                  Approve {props.selectedPool.token1.symbol}
                </Button>
              )}
              <Button
                type="submit"
                disabled={
                  !props.selectedCoinIsApprove || !props.pairedCoinIsApprove
                }
              >
                {props.isLoading ? "Loading..." : "Confirm"}
              </Button>
            </div>
          </div>
        </main>
        <div className="sub">
          <Summary details={dummyDetails} />
        </div>
      </div>
    </React.Fragment>
  );
};

export default EarnPannel;
