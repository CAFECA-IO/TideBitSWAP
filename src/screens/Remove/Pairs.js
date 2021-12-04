import React, { useContext, useState } from "react";
import Dialog from "../../components/UI/Dialog";
import FilterList from "../../components/UI/FilterList";
import LoadingIcon from "../../components/UI/LoadingIcon";
import ConnectorContext from "../../store/connector-context";
import SafeMath from "../../Utils/safe-math";
import { formateDecimal } from "../../Utils/utils";
import classes from "./Pairs.module.css";

export const PairTile = (props) => {
  return (
    <div className={classes.tile} onClick={() => props.onSelect()}>
      <div className={classes.group}>
        <div className={classes.icons}>
          <div className={classes.icon}>
            <img
              src={props.pool.token0.iconSrc}
              alt={props.pool.token0.symbol}
            />
          </div>
          <div className={classes.icon}>
            <img
              src={props.pool.token1.iconSrc}
              alt={props.pool.token1.symbol}
            />
          </div>
        </div>
        <div
          className={classes.name}
        >{`${props.pool.token0.symbol}/${props.pool.token1.symbol}`}</div>
      </div>{" "}
      <div className={classes.data}>{`${
        props.pool?.share
          ? formateDecimal(SafeMath.mult(props.pool.share, 100), 4)
          : "0"
      } %`}</div>
     <div className={classes.data}>
        {formateDecimal(props.pool?.yield, 4) || "--"} %
      </div>
      <div className={classes.data}>{`${props.fiat.dollarSign} ${
        formateDecimal(props.pool?.volume?.value, 6) || "--"
      }`}</div>
    </div>
  );
};

const PairTitle = (props) => {
  return (
    <div className={classes["title-bar"]}>
      <div className={classes.title}>My Share</div>
      <div className={classes.title}>Yield</div>
      <div className={classes.title}>Volume</div>{" "}
    </div>
  );
};

const Pairs = (props) => {
  const connectorCtx = useContext(ConnectorContext);
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
                fiat: connectorCtx.fiat,
                onSelect: () => props.onSelect(data),
              })
            }
          </FilterList>
        </Dialog>
      )}
      <div className={classes.list}>
        <div className={classes.header}>
          <div>Invest</div>
          {/* <div
            className={classes["button-icon"]}
            onClick={() => setOpenDialog(true)}
          >
            Search
          </div> */}
        </div>
        <PairTitle />
        <div className={classes.content}>
          {!props.pools.length && !connectorCtx.isLoading && (
            <div className={classes.hint}>No Token found.</div>
          )}
          {!!props.pools.length &&
            props.pools.map((pool) => (
              <PairTile
                pool={pool}
                fiat={connectorCtx.fiat}
                key={pool.poolContract}
                onSelect={() => props.onSelect(pool)}
              />
            ))}
          {connectorCtx.isLoading && <LoadingIcon />}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Pairs;
