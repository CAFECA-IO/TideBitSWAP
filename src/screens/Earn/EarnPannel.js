import React, { useState, useContext } from "react";
import { useHistory } from "react-router";
import Button from "../../components/UI/Button";
import Dialog from "../../components/UI/Dialog";
import FilterList from "../../components/UI/FilterList";
import InputAmount from "../../components/UI/InputAmount";
import Summary from "../../components/UI/Summary";
import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
import SafeMath from "../../Utils/safe-math";
import { formateDecimal } from "../../Utils/utils";
import classes from "./EarnPannel.module.css";
import { PairTile } from "./Pairs";

export const getDetails = (pool, fiat) => [
  {
    title: "Price",
    value: `1 ${pool?.token0?.symbol || "--"} ≈ -- ${fiat?.symbol}`,
    explain:
      "Estimated price of the swap, not the final price that the swap is executed.",
  },
  {
    title: "Share of the pool",
    value: `${
      pool?.share ? formateDecimal(SafeMath.mult(pool?.share, 100), 4) : "0"
    } %`,
    explain:
      "The estimated percentage that the ultimate executed price of the swap deviates from current price due to trading amount.",
  },
  {
    title: "Total yield",
    value: "--",
    explain: "Trade transaction fee collected by liquidity providers.",
  },
];

const EarnPannel = (props) => {
  const userCtx = useContext(UserContext);
  const connectorCtx = useContext(ConnectorContext);
  const [openDialog, setOpenDialog] = useState(false);
  const history = useHistory();

  const selectHandler = (option) => {
    props.onSelect(option);
    if (!option.contract) {
      history.push({
        pathname: `/import-token/${option.token0.contract}`,
      });
    }
    setOpenDialog(false);
  };

  const importPool = async (contract) => {
    const index = props.pools.findIndex(
      (pool) =>
        pool.token0.contract === contract || pool.token1.contract === contract
    );
    let pool;

    if (index === -1) {
      const token = await connectorCtx.addToken(contract);
      console.log(token);
      pool = {
        token0: token,
      };
    } else {
      pool = props.options[index];
    }
    return pool;
  };

  return (
    <React.Fragment>
      {openDialog && (
        <Dialog title="Select Token" onCancel={() => setOpenDialog(false)}>
          <FilterList
            onSelect={selectHandler}
            data={props.pools}
            filterProperty="name"
            onImport={importPool}
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
                    src={props.selectedCoin?.iconSrc}
                    alt={props.selectedCoin?.symbol}
                  />
                </div>
                <div className={classes.name}>
                  {props.selectedCoin?.symbol}
                </div>
              </div>
            )}
            {!props.selectedPool && (
              <div className={classes.placeholder}>Select Coin</div>
            )}
            <div
              className={classes["button-icon"]}
              onClick={() => setOpenDialog(true)}
            >
              Search
            </div>
          </div>
          <div className={classes.content}>
            <div className={classes.main}>
              <InputAmount
                max={props.selectedCoin?.balanceOf || ""}
                symbol={props.selectedCoin?.symbol || "0"}
                onChange={props.changeAmountHandler}
                value={props.selectedCoinAmount}
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
              {props.displayApproveSelectedCoin && (
                <Button
                  type="button"
                  onClick={() =>
                    props.approveHandler(
                      props.selectedCoin?.contract,
                      (result) => {
                        props.setSelectedCoinIsApprove(result);
                        props.setDisplayApproveSelectedCoin(!result);
                      }
                    )
                  }
                >
                  Approve {props.selectedCoin?.symbol}
                </Button>
              )}
            </div>
            <Button type="submit" disabled={!props.selectedCoinIsApprove}>
              {props.isLoading ? "Loading..." : "Confirm"}
            </Button>
          </div>
        </main>
        <div className="sub">
          <Summary details={getDetails(props.selectedPool, userCtx.fiat)} />
        </div>
      </div>
    </React.Fragment>
  );
};

export default EarnPannel;
