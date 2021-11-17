import React, { useState, useContext } from "react";
import InputAmount from "../../components/UI/InputAmount";
import Summary from "../../components/UI/Summary";
import UserContext from "../../store/user-context";
import classes from "./RemovePannel.module.css";
import { PairTile } from "./Pairs";
import Dialog from "../../components/UI/Dialog";
import FilterList from "../../components/UI/FilterList";
import { formateDecimal } from "../../Utils/utils";
import SafeMath from "../../Utils/safe-math";
import Button from "../../components/UI/Button";

const getDetails = (pool, amount, fiat) => [
  {
    title: "Price",
    value: `1 ${pool?.token0?.symbol} ≈ -- ${fiat.symbol}`,
    explain:
      "Estimated price of the swap, not the final price that the swap is executed.",
  },
  {
    title: "Take Amount",
    value: amount,
    explain:
      "The estimated percentage that the ultimate executed price of the swap deviates from current price due to trading amount.",
  },
  {
    title: "Take Price",
    value: "--",
    explain: "Trade transaction fee collected by liquidity providers.",
  },
];

const RemovePannel = (props) => {
  const userCtx = useContext(UserContext);
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
                fiat: userCtx.fiat,
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
            <div className={classes.button} onClick={() => setOpenDialog(true)}>
              Search
            </div>
          </div>
          <div className={classes.content}>
            <div className={classes.main}>
              <InputAmount
                max={props.selectedPool?.balanceOf || "0"}
                symbol=""
                onChange={props.changeAmountHandler}
                value={props.shareAmount}
              />
            </div>
            <div className={classes.sub}>
              <div className={classes.detail}>
                <div className={classes.data}>
                  <div className={classes.title}>My Share</div>
                  <div className={classes.amount}>{`${
                    props.selectedPool?.share
                      ? formateDecimal(
                          SafeMath.mult(props.selectedPool.share, 100),
                          4
                        )
                      : "0"
                  } %`}</div>
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
          <Summary
            details={getDetails(
              props.selectedPool,
              props.shareAmount,
              userCtx.fiat
            )}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default RemovePannel;
