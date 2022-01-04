import React, { useState, useRef, useContext, useEffect } from "react";
import StakeOption from "../../components/StakeOption/StakeOption";
import Dialog from "../../components/UI/Dialog";
import DropDown from "../../components/UI/DropDown";
import ErrorDialog from "../../components/UI/ErrorDialog";
import LoadingIcon from "../../components/UI/LoadingIcon";
import NetworkDetail from "../../components/UI/NetworkDetail";
import SearchInput from "../../components/UI/SearchInput";
import { stakeSorting } from "../../constant/constant";
import ConnectorContext from "../../store/connector-context";
import TraderContext from "../../store/trader-context";
import SafeMath from "../../Utils/safe-math";
import { formateDecimal, randomID } from "../../Utils/utils";
import classes from "./Stakes.module.css";
import CalculateIcon from "@mui/icons-material/Calculate";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import Button from "../../components/UI/Button";

const OptionContainer = (props) => {
  return <div className={classes.option}>{props}</div>;
};

const Stakes = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const traderCtx = useContext(TraderContext);
  const inputRef = useRef();
  const [sortingCondition, setSortingCondition] = useState({
    key: Object.keys(stakeSorting)[0],
    value: Object.values(stakeSorting)[0],
  });
  const [entered, setEntered] = useState("");
  const [options, setOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [selectedStake, setSelectedStake] = useState(null);
  const [stakeAmount, setStakeAmount] = useState(null);
  const [stakeType, setStakeType] = useState(null);
  const [openROICaculator, setOpenROICaculator] = useState(false);
  const [openStakeDialog, setOpenStakeDialog] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [swap, setSwap] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [cStakeAmount, setCStakeAmount] = useState("0.0");
  const [cFiatAmount, setCFiatAmount] = useState("0");
  const [cRateAmount, setCRateAmount] = useState("0");
  const [balance, setBalance] = useState("0");
  const [enableCompounding, setEnableCompounding] = useState(true);
  const [stakeFor, setStakeFor] = useState("1D");
  const [compoundingEvery, setCompoundingEvery] = useState("1D");

  const [error, setError] = useState(null);

  const swapHandler = () => {
    setSwap((prev) => !prev);
  };

  const changeHandler = async (event) => {
    setEntered(event.target.value.replace(/[^0-9A-Za-z]/gi, ""));
    if (/^0x[a-fA-F0-9]{40}$/.test(event.target.value)) {
      const option = await connectorCtx.searchStake(event.target.value);
      console.log(`searchToken`, option);
      if (option) {
        setFilteredOptions([option]);
      }
    } else {
      const filteredOptions = connectorCtx.supportedStakes.filter(
        (option) =>
          !inputRef.current ||
          option["contract"]
            .replace("0x", "")
            .toLowerCase()
            .includes(inputRef.current.value.toLowerCase()) ||
          option?.stake?.symbol
            ?.toLowerCase()
            .includes(inputRef.current.value.toLowerCase()) ||
          option?.earn?.symbol
            ?.toLowerCase()
            .includes(inputRef.current.value.toLowerCase())
      );
      setFilteredOptions((prev) =>
        filteredOptions.map((updateOption) => {
          const option = prev.find((o) => o.id === updateOption.id);
          return { ...updateOption, checked: !!option?.checked };
        })
      );
    }
  };

  const sortingHandler = (option) => {
    setSortingCondition(option);
    switch (stakeSorting[option.key]) {
      case stakeSorting.HOT:
        return filteredOptions?.sort((a, b) => +b.totalStaked - +a.totalStaked);

      case stakeSorting.APR:
        return filteredOptions?.sort((a, b) => +b.APY - +a.APY);

      case stakeSorting.EARNED:
        return filteredOptions?.sort(
          (a, b) => +b.profit.inFiat - +a.profit.inFiat
        );

      case stakeSorting.TOTALSTAKED:
        return filteredOptions?.sort((a, b) => +b.totalStaked - +a.totalStaked);
      default:
        return filteredOptions;
    }
  };

  const cRateAmountChangeHandler = (event) => {
    setCRateAmount(event.target.value);
  };

  const cAmountChangeHandler = (swap, value) => {
    if (swap) {
      setCFiatAmount(value);
    } else {
      setCStakeAmount(value);
    }
  };

  const inputBalanceChangeHandler = (event) => {
    let value = SafeMath.gt(
      event.target.value,
      selectedStake?.staked?.inFiat || "0"
    )
      ? selectedStake?.staked?.inFiat || "0"
      : event.target.value;
    setCFiatAmount(value);
    setBalance(value);
  };

  const stakeAmountChangeHandler = (event) => {
    console.log(event.target.value);
    let value = SafeMath.gt(
      event.target.value,
      selectedStake?.staked?.inCrypto || "0"
    )
      ? selectedStake?.staked?.inCrypto || "0"
      : event.target.value;
    setStakeAmount(value);
  };

  const openStakeDialogHandler = (option, type) => {
    console.log(`option`, option);
    setSelectedStake(option);
    setStakeType(type);
    setOpenStakeDialog(true);
  };
  const openROICaculatorHandler = (option) => {
    console.log(`option`, option);
    setSelectedStake(option);
    setOpenROICaculator(true);
  };

  const clickHandler = (option, i) => {
    console.log(option);
    let updateOptions = [...filteredOptions];
    if (updateOptions[i].id !== option.id) {
      let index = updateOptions.findIndex((o) => o.id === option.id);
      updateOptions[index].checked = !updateOptions[index].checked;
    } else {
      updateOptions[i].checked = !updateOptions[i].checked;
    }
    setFilteredOptions(updateOptions);
  };

  useEffect(() => {
    const filteredOptions = connectorCtx.supportedStakes.filter(
      (option) =>
        !inputRef.current ||
        option["contract"]
          .replace("0x", "")
          .toLowerCase()
          .includes(inputRef.current.value.toLowerCase()) ||
        option?.stake?.symbol
          ?.toLowerCase()
          .includes(inputRef.current.value.toLowerCase()) ||
        option?.earn?.symbol
          ?.toLowerCase()
          .includes(inputRef.current.value.toLowerCase())
    );
    setFilteredOptions((prev) =>
      filteredOptions.map((updateOption) => {
        const option = prev.find((o) => o.id === updateOption.id);
        return { ...updateOption, checked: !!option?.checked };
      })
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
      {openStakeDialog && (
        <Dialog
          className={classes.dialog}
          title={`${
            stakeType === "stake"
              ? "Stake LP tokens"
              : stakeType === "unstake"
              ? "Unstake LP tokens"
              : "Error"
          }`}
          onCancel={() => setOpenStakeDialog(false)}
        >
          <div className={classes.container}>
            <div className={classes["input-controller"]}>
              <div className={`${classes.content} ${classes.row}`}>
                <div className={classes.title}>
                  {stakeType === "stake"
                    ? "Stake"
                    : stakeType === "unstake"
                    ? "Unstake"
                    : "Error"}
                </div>
                <div className={classes.balance}>{`Balance: ${
                  formateDecimal(selectedStake?.staked?.inCrypto, 18) || "--"
                }`}</div>
              </div>
              <div className={`${classes.content} ${classes.row}`}>
                <input
                  id={randomID(6)}
                  type="number"
                  value={stakeAmount}
                  onInput={stakeAmountChangeHandler}
                  placeholder="0.0"
                  step="any"
                />
                <div className={`${classes.hint} ${classes.row}`}>
                  {SafeMath.eq(
                    stakeAmount || "0",
                    selectedStake?.staked?.inCrypto || "0"
                  ) && <div className={classes.tag}>Max</div>}
                  <div>{`${selectedStake?.stake?.symbol}`}</div>
                </div>
              </div>
            </div>
            {stakeType === "stake" && (
              <div className={`${classes.content} ${classes.row}`}>
                <div>Annual ROI at current rates:</div>
                <div className={`${classes.hint} ${classes.row}`}>
                  <div>{`${traderCtx.fiat.dollarSign} 0.90`}</div>
                  <div
                    className={classes["tool-controller"]}
                    onClick={() => openROICaculatorHandler(selectedStake)}
                  >
                    <CalculateIcon fontSize="large" />
                  </div>
                </div>
              </div>
            )}
            <div className={`${classes.action}  ${classes.row}`}>
              <Button
                onClick={() => {
                  setOpenStakeDialog(false);
                }}
              >
                Cancel
              </Button>
              <Button>Confirm</Button>
            </div>
          </div>
        </Dialog>
      )}
      {openROICaculator && (
        <Dialog
          className={`${classes.dialog} ${classes.roi}`}
          title="ROI Calculator"
          onCancel={() => setOpenROICaculator(false)}
        >
          <div className={classes.container}>
            <div className={classes["header-container"]}>
              <div
                className={classes.header}
              >{`${selectedStake?.stake?.symbol} STAKED`}</div>
              <div className={classes["input-controller"]}>
                <div className={`${classes["input-container"]} ${classes.row}`}>
                  <div>
                    <div className={`${classes.content} ${classes.row}`}>
                      <input
                        id={randomID(6)}
                        type="number"
                        value={swap ? cFiatAmount : cStakeAmount}
                        onInput={(event) =>
                          cAmountChangeHandler(swap, event.target.value)
                        }
                        placeholder="0.0"
                        step="any"
                      />
                      <div className={`${classes.hint} ${classes.row}`}>
                        <div>{`${
                          swap
                            ? traderCtx.fiat.symbol
                            : selectedStake?.stake?.symbol
                        }`}</div>
                      </div>
                    </div>
                    <div className={`${classes.content} ${classes.row}`}>
                      <div className={classes.amount}>{`${formateDecimal(
                        !swap ? cFiatAmount : cStakeAmount,
                        18
                      )} ${
                        !swap
                          ? traderCtx.fiat.symbol
                          : selectedStake?.stake?.symbol
                      }`}</div>
                    </div>
                  </div>
                  <div className={classes.swap} onClick={swapHandler}>
                    <SwapVertIcon fontSize="large" />
                  </div>
                </div>
              </div>
              <div className={`${classes.tags} ${classes.row}`}>
                <div
                  className={classes.tag}
                  onClick={() => cAmountChangeHandler(true, "100")}
                >
                  $100
                </div>
                <div
                  className={classes.tag}
                  onClick={() => cAmountChangeHandler(true, "1000")}
                >
                  $1000
                </div>
                <div className={classes["input-tag"]}>
                  <input
                    id={randomID(6)}
                    type="number"
                    value={balance}
                    onInput={inputBalanceChangeHandler}
                    placeholder="My Balance"
                    step="any"
                    disabled={!SafeMath.gt(selectedStake.staked.inFiat, "0")}
                  />
                </div>
                <div className={`tooltip ${classes.tooltip}`}>?</div>
              </div>
            </div>
            <div className={classes.condition}>
              <div className={classes.header}>STAKED FOR</div>
              <div className={`${classes.tabs} ${classes.row}`}>
                <div
                  className={`${classes.tab} ${
                    stakeFor === "1D" ? classes.active : ""
                  }`}
                  onClick={() => setStakeFor("1D")}
                >
                  1D
                </div>
                <div
                  className={`${classes.tab} ${
                    stakeFor === "7D" ? classes.active : ""
                  }`}
                  onClick={() => setStakeFor("7D")}
                >
                  7D
                </div>
                <div
                  className={`${classes.tab} ${
                    stakeFor === "30D" ? classes.active : ""
                  }`}
                  onClick={() => setStakeFor("30D")}
                >
                  30D
                </div>
                <div
                  className={`${classes.tab} ${
                    stakeFor === "1Y" ? classes.active : ""
                  }`}
                  onClick={() => setStakeFor("1Y")}
                >
                  1Y
                </div>
                <div
                  className={`${classes.tab} ${
                    stakeFor === "5Y" ? classes.active : ""
                  }`}
                  onClick={() => setStakeFor("5Y")}
                >
                  5Y
                </div>
              </div>
            </div>
            <div className={classes.condition}>
              <div className={classes.header}>COMPOUNDING EVERY</div>
              <div className={`${classes.content} ${classes.row}`}>
                <label
                  className={classes.controller}
                  htmlFor="stakeOption-compunding"
                >
                  <input
                    type="checkbox"
                    name="shrink-pool-option"
                    id="stakeOption-compunding"
                    className={classes.checkbox}
                    checked={enableCompounding}
                    onClick={() => setEnableCompounding((prev) => !prev)}
                  />
                  <span class={classes.checkmark}></span>
                </label>
                <div
                  className={`${classes.tabs} ${classes.row} ${
                    enableCompounding ? "" : classes.disabled
                  }`}
                >
                  <div
                    className={`${classes.tab} ${
                      enableCompounding && compoundingEvery === "1D"
                        ? classes.active
                        : ""
                    }`}
                    onClick={() =>
                      enableCompounding ? setCompoundingEvery("1D") : null
                    }
                  >
                    1D
                  </div>
                  <div
                    className={`${classes.tab} ${
                      enableCompounding && compoundingEvery === "7D"
                        ? classes.active
                        : ""
                    }`}
                    onClick={() =>
                      enableCompounding ? setCompoundingEvery("7D") : null
                    }
                  >
                    7D
                  </div>
                  <div
                    className={`${classes.tab} ${
                      enableCompounding && compoundingEvery === "14D"
                        ? classes.active
                        : ""
                    }`}
                    onClick={() =>
                      enableCompounding ? setCompoundingEvery("14D") : null
                    }
                  >
                    14D
                  </div>
                  <div
                    className={`${classes.tab} ${
                      enableCompounding && compoundingEvery === "30D"
                        ? classes.active
                        : ""
                    }`}
                    onClick={() =>
                      enableCompounding ? setCompoundingEvery("30D") : null
                    }
                  >
                    30D
                  </div>
                </div>
              </div>
            </div>
            <div className={classes["icon-container"]}>
              {reverse ? (
                <ArrowUpwardIcon fontSize="large" />
              ) : (
                <ArrowDownwardIcon fontSize="large" />
              )}
            </div>
            <div className={classes["input-pannel"]}>
              <div className={classes.title}>ROI AT CURRENT RATES</div>
              <div
                className={`${classes.content} ${classes.row} ${classes["rate-container"]}`}
              >
                {reverse ? (
                  <div className={`${classes.input} ${classes.row}`}>
                    <div>$</div>
                    <input
                      id={randomID(6)}
                      type="number"
                      value={cRateAmount}
                      onInput={cRateAmountChangeHandler}
                      placeholder="0.0"
                      step="any"
                    />
                  </div>
                ) : (
                  <div className={classes.rate}>{`$${formateDecimal(
                    cRateAmount,
                    2
                  )}`}</div>
                )}
                <div
                  className={classes["reverse-controller"]}
                  onClick={() => setReverse((prev) => !prev)}
                >
                  {reverse ? (
                    <CheckIcon fontSize="large" />
                  ) : (
                    <EditIcon fontSize="large" />
                  )}
                </div>
              </div>
              <div>{`~ ${"0"} ${
                selectedStake?.stake?.symbol || "--"
              } (${formateDecimal("0", 2)}%)`}</div>
            </div>
          </div>
          <div
            className={`${classes["detail-container"]} ${
              !openDetail ? classes.open : ""
            }`}
          >
            <div
              className={`${classes["button-container"]} ${classes.row}`}
              onClick={() => setOpenDetail((prev) => !prev)}
            >
              <div className={classes.button}>
                {openDetail ? "Details" : "Hide"}
              </div>
              <div className={classes.icon}>&#10095;</div>
            </div>
            <div className={classes["detail-info"]}>
              <div className={`${classes.detail} ${classes.row}`}>
                <div className={classes.title}>APR</div>
                <div className={classes.value}></div>
              </div>
              <div className={`${classes.detail} ${classes.row}`}>
                <div className={classes.title}>APY (1x daily compound)</div>
                <div className={classes.value}></div>
              </div>
              <ul className={classes["explain-container"]}>
                <li className={classes.explain}>
                  Calculated based on current rates.
                </li>
                <li className={classes.explain}>
                  All figures are estimates provided for your convenience only,
                  and by no means represent guaranteed returns.
                </li>
              </ul>
              <a href={`#/swap/${selectedStake?.contract || ""}`}>{`GET ${
                selectedStake?.stake?.symbol || "--"
              }`}</a>
            </div>
          </div>
        </Dialog>
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
              inputRef={inputRef}
              value={entered}
              onChange={changeHandler}
              placeholder="Search"
            />
          </div>
        </div>
        <div className={classes.list}>
          {filteredOptions.map((option, i) => (
            <StakeOption
              data={option}
              openStakeDialogHandler={openStakeDialogHandler}
              openROICaculatorHandler={openROICaculatorHandler}
              key={randomID(6)}
              fiat={traderCtx.fiat}
              clickHandler={() => clickHandler(option, i)}
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
