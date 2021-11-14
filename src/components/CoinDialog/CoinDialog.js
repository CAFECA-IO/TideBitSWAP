import React, { useState, useImperativeHandle, useContext } from "react";
import { useHistory } from "react-router";
import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
import CoinOption from "../CoinOption/CoinOption";
import Dialog from "../UI/Dialog";
import FilterList from "../UI/FilterList";
import classes from "./CoinDialog.module.css";

const CoinDialog = React.forwardRef((props, ref) => {
  const userCtx = useContext(UserContext);
  const connectorCtx = useContext(ConnectorContext);
  const [openDialog, setOpenDialog] = useState(false);
  const history = useHistory();

  const importToken = async (contract) => {
    const index = props.options.findIndex((d) => d.contract === contract);
    let token;
    if (index === -1) {
      token = await connectorCtx.addToken(contract);
    } else {
      token = props.options[index];
    }
    return token;
  };

  const selectHandler = (option) => {
    props.onSelect(option);
    if (
      userCtx.supportedPools.findIndex(
        (pool) =>
          pool.token0.contract === option.contract ||
          pool.token1.contract === option.contract
      ) === -1
    ) {
      history.push({
        pathname: `/import-token/${option.contract}`,
      });
    }
    setOpenDialog(false);
  };

  useImperativeHandle(ref, () => {
    return {
      openDialog: () => setOpenDialog(true),
      closeDialog: () => setOpenDialog(false),
    };
  });

  return (
    <React.Fragment>
      {openDialog && (
        <Dialog title="Select Coin" onCancel={() => setOpenDialog(false)}>
          <FilterList
            onSelect={selectHandler}
            onImport={importToken}
            data={props.options}
            filterProperty="symbol"
          >
            {(data) => CoinOption(data)}
          </FilterList>
        </Dialog>
      )}
      <div className={classes.option}>
        <div className={classes.title}>Coin</div>
        <div className={classes.button} onClick={() => setOpenDialog(true)}>
          {props.selectedCoin && CoinOption(props.selectedCoin, props.isShrink)}
          {!props.selectedCoin && (
            <div className={classes.placeholder}>Select Coin</div>
          )}
          <div className={classes.icon}>&#10095;</div>
        </div>
      </div>
    </React.Fragment>
  );
});

export default CoinDialog;
