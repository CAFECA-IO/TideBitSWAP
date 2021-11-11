import React, { useState, useContext } from "react";
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
  const [selectedPool, setSelectedPool] = useState(props.selectedPool);

  const selectHandler = (option) => {
    setSelectedPool(option);
    setOpenDialog(false);
  };
  const changeAmountHandler = () => {};
  return (
    <React.Fragment>
      { openDialog && (
        <Dialog title="Select Token" onCancel={() => setOpenDialog(false)}>
          <FilterList
            onSelect={selectHandler}
            data={props.pools}
            filterProperty="symbol"
          >
            {(data) => PairTile({ pool: data, fiat: userCtx.fiat })}
          </FilterList>
        </Dialog>
      )}
      <div className={classes.earn}>
        <main className={classes.main}>
          <div className={classes.header}>
            {selectedPool && (
              <div className={classes.group}>
                <div className={classes.icon}>
                  <img
                    src={selectedPool.token1.iconSrc}
                    alt={selectedPool.token1.symbol}
                  />
                </div>
                <div className={classes.name}>{selectedPool.token1.symbol}</div>
              </div>
            )}
            <div className={classes.button} onClick={() => setOpenDialog(true)}>
              Search
            </div>
          </div>
          <div className={classes.content}>
            <div className={classes.main}>
              <InputAmount
                max={selectedPool?.poolBalanceOfToken1 || ""}
                symbol={selectedPool?.token1.symbol || "0"}
                onChange={changeAmountHandler}
              />
            </div>
            <div className={classes.sub}>
              <div className={classes.detail}>
                <div className={classes.data}>
                  <div className={classes.title}>My Share</div>
                  <div className={classes.amount}>{`${
                    selectedPool?.share
                      ? formateDecimal(
                          SafeMath.mult(selectedPool.share, 100),
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
                  } ${selectedPool?.rewards || "0"}`}</div>
                </div>
              </div>
            </div>
          </div>
          <div className={classes.button}>Confirm</div>
        </main>
        <div className="sub">
          <Summary details={dummyDetails} />
        </div>
      </div>
    </React.Fragment>
  );
};

export default EarnPannel;
