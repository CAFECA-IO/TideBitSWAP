import React, { useState, useRef, useContext, useEffect } from "react";
import StakeOption from "../../components/StakeOption/StakeOption";
import DropDown from "../../components/UI/DropDown";
import ErrorDialog from "../../components/UI/ErrorDialog";
import LoadingIcon from "../../components/UI/LoadingIcon";
import NetworkDetail from "../../components/UI/NetworkDetail";
import SearchInput from "../../components/UI/SearchInput";
import { stakeSorting } from "../../constant/constant";
import ConnectorContext from "../../store/connector-context";
import { randomID } from "../../Utils/utils";
import classes from "./Stakes.module.css";

const OptionContainer = (props) => {
  return <div className={classes.option}>{props}</div>;
};

const Stakes = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const inputRef = useRef();
  const [sortingCondition, setSortingCondition] = useState({
    key: Object.keys(stakeSorting)[0],
    value: Object.values(stakeSorting)[0],
  });
  const [entered, setEntered] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [error, setError] = useState(null);

  const changeHandler = async (event) => {
    setEntered(event.target.value.replace(/[^0-9A-Za-z]/gi, ""));
    if (/^0x[a-fA-F0-9]{40}$/.test(event.target.value)) {
      const option = await connectorCtx.searchStake(event.target.value);
      console.log(`searchToken`, option);
      if (option) {
        setFilteredOptions([option]);
      }
    } else {
      setFilteredOptions(
        connectorCtx.supportedStakes.filter(
          (option) =>
            !inputRef.current ||
            option["contract"]
              .toLowerCase()
              .includes(inputRef.current.value.toLowerCase()) ||
            option?.name?.title
              ?.toLowerCase()
              .includes(inputRef.current.value.toLowerCase())
        )
      );
    }
  };

  const sortingHandler = (option) => {
    setSortingCondition(option);
    switch (stakeSorting[option.key]) {
      case stakeSorting.HOT:
        return filteredOptions?.sort((a, b) => +b.hot - +a.hot);
      case stakeSorting.IRR:
        return filteredOptions?.sort((a, b) => +b.irr - +a.irr);
      case stakeSorting.APY:
        return filteredOptions?.sort((a, b) => +b.apy - +a.apy);
      case stakeSorting.POOLBALANCE:
        return filteredOptions?.sort((a, b) => +b.balanceOf.inFiat - +a.balanceOf.inFiat);
      case stakeSorting.PROFIT:
        return filteredOptions?.sort((a, b) => +b.profit.inFiat - +a.profit.inFiat);
      case stakeSorting.TOTALSTAKED:
        return filteredOptions?.sort((a, b) => +b.totalStaked - +a.totalStaked);
      default:
        return filteredOptions;
    }
  };

  useEffect(() => {
    console.log(connectorCtx.supportedStakes);
    setFilteredOptions(
      connectorCtx.supportedStakes.filter(
        (option) =>
          !inputRef.current ||
          option["contract"]
            .toLowerCase()
            .includes(inputRef.current.value.toLowerCase()) ||
          option?.name?.title
            ?.toLowerCase()
            .includes(inputRef.current.value.toLowerCase())
      )
    );
    return () => {};
  }, [connectorCtx.supportedStakes]);

  return (
    <React.Fragment>
      {openErrorDialog && (
        <ErrorDialog
          message={error.message}
          onConfirm={() => setOpenErrorDialog(false)}
        />
      )}
      <div className="page">
        <div className="header-bar">
          <div className="header">Stakes</div>
          <NetworkDetail shrink={true} />
        </div>
        <div className={classes["tool-bar"]}>
          <DropDown
            className={classes.dropdown}
            label="Sort by"
            options={Object.keys(stakeSorting).map((key) => ({
              key,
              value: stakeSorting[key],
            }))}
            selected={sortingCondition}
            onSelect={sortingHandler}
            placeholder="Select Sort"
          >
            {(option) => OptionContainer(option.value)}
          </DropDown>
          <div className={classes.search}>
            <div className={classes.label}>Search</div>
            <SearchInput
              value={entered}
              onChange={changeHandler}
              placeholder="Search"
            />
          </div>
        </div>
        <div className={classes.list}>
          {filteredOptions.map((option) => (
            <StakeOption
              data={option}
              onClick={() => props.onClick(option)}
              key={randomID(6)}
            />
          ))}
          {connectorCtx.isLoading && (
            <div className={classes.container}>
              <LoadingIcon />
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Stakes;
