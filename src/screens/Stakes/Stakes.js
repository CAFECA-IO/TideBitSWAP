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
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Switch from "@mui/material/Switch";

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
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [staked, setStaked] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [selectedStake, setSelectedStake] = useState(null);
  const [stakeAmount, setStakeAmount] = useState(null);
  const [stakeType, setStakeType] = useState(null);
  const [openROICaculator, setOpenROICaculator] = useState(false);
  const [openStakeDialog, setOpenStakeDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openHarvestDialog, setOpenHarvestDialog] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [swap, setSwap] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [cStakeAmount, setCStakeAmount] = useState("0.0");
  const [cFiatAmount, setCFiatAmount] = useState("0");
  const [cRateAmount, setCRateAmount] = useState("0");
  const [enableCompounding, setEnableCompounding] = useState(true);
  const [stakeFor, setStakeFor] = useState("1D");
  const [compoundingEvery, setCompoundingEvery] = useState("1D");
  const [isLoading, setIsLoading] = useState(false);
  const [transaction, setTransaction] = useState(null);

  const [error, setError] = useState(null);

  const swapHandler = () => {
    setSwap((prev) => !prev);
  };

  const changeHandler = async (event) => {
    setEntered(event.target.value.replace(/[^0-9A-Za-z]/gi, ""));
    if (/^0x[a-fA-F0-9]{40}$/.test(event.target.value)) {
      const option = await connectorCtx.searchStake(event.target.value);
      console.log(`searchStake`, option);
      if (option) {
        setFilteredOptions([option]);
      }
    } else {
      const filteredOptions = connectorCtx.supportedStakes
        .filter(
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
        )
        .filter((option) => (isLive ? option.isLive : !option.isLive))
        .filter((option) =>
          staked ? SafeMath.gt(option.staked.inCrypto, "0") : option
        );
      setFilteredOptions((prev) =>
        filteredOptions.map((updateOption) => {
          const option = prev.find((o) => o.id === updateOption.id);
          return { ...updateOption, checked: !!option?.checked };
        })
      );
    }
  };

  const handleStakedChange = () => {
    setStaked((prev) => !prev);
  };

  const sortingHandler = (option, filteredOptions) => {
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

  const stakeAmountChangeHandler = (event) => {
    console.log(event.target.value);
    let value = SafeMath.gt(
      event.target.value,
      selectedStake?.stake?.balanceOf || "0"
    )
      ? selectedStake?.stake?.balanceOf || "0"
      : event.target.value;
    setStakeAmount(value);
  };

  const openStakeDialogHandler = (option, type) => {
    console.log(`openStakeDialogHandler option`, option);
    console.log(`openStakeDialogHandler type`, type);
    setSelectedStake(option);
    setStakeType(type);
    setOpenStakeDialog(true);
  };

  const openHarvestDialogHandler = (option) => {
    setSelectedStake(option);
    setOpenHarvestDialog(true);
  };

  const openROICaculatorHandler = (option) => {
    console.log(`option`, option);
    setSelectedStake(option);
    setOpenROICaculator(true);
  };

  const approveStakeSpendToken = async (option) => {
    try {
      const result = await connectorCtx.approve(
        option.stake.contract,
        option.contract
      );
      console.log(`approveStakeSpendToken`, result);
    } catch (error) {
      setError(error);
      setOpenErrorDialog(true);
    }
  };

  const stakeHandler = async () => {
    let result;
    try {
      switch (stakeType) {
        case "stake":
          console.log(`depositToken selectedStake`, selectedStake, stakeAmount);
          result = await connectorCtx.deposit(
            selectedStake.contract,
            selectedStake.stake,
            stakeAmount
          );
          setTransaction({
            message: `Success deposit ${stakeAmount} ${selectedStake.stake.symbol} to ${selectedStake.contract}`,
            transactionHash: result,
          });
          break;
        case "unstake":
          console.log(
            `withdrawToken selectedStake`,
            selectedStake,
            stakeAmount
          );
          result = await connectorCtx.withdraw(
            selectedStake.contract,
            selectedStake.stake,
            stakeAmount
          );
          setTransaction({
            message: `Success withdraw ${stakeAmount} ${selectedStake.stake.symbol} from ${selectedStake.contract}`,
            transactionHash: result,
          });
          break;
        default:
          throw Error("wrong type");
      }
      setOpenSnackbar(true);
    } catch (error) {
      setError(error);
      setOpenErrorDialog(true);
    }
    setOpenStakeDialog(false);
    setStakeAmount("0");
  };

  const harvestToken = async (option) => {
    console.log(`harvestToken option`, option);
    try {
      const result = await connectorCtx.deposit(
        selectedStake.contract,
        selectedStake.earn,
        "0"
      );
      setTransaction({
        message: `Success harvest ${selectedStake.pendingReward.inCrypto} ${selectedStake.earn.symbol} from ${selectedStake.contract}`,
        transactionHash: result,
      });
      setOpenSnackbar(true);
      setOpenHarvestDialog(false);
    } catch (error) {
      setError(error);
      setOpenErrorDialog(true);
    }
  };

  const clickHandler = (option, i) => {
    console.log(option);
    let index,
      updateOptions = [...filteredOptions];
    if (updateOptions[i].id !== option.id) {
      index = updateOptions.findIndex((o) => o.id === option.id);
    } else {
      index = i;
    }
    updateOptions[index].checked = !updateOptions[index].checked;
    setFilteredOptions(updateOptions);
  };

  useEffect(() => {
    const filteredOptions = connectorCtx.supportedStakes
      .filter(
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
      )
      .filter((option) => (isLive ? option.isLive : !option.isLive))
      .filter((option) =>
        staked ? SafeMath.gt(option.staked.inCrypto, "0") : option
      );
    setFilteredOptions((prev) =>
      filteredOptions.map((updateOption) => {
        const option = prev.find((o) => o.id === updateOption.id);
        return { ...updateOption, checked: !!option?.checked };
      })
    );

    return () => {};
  }, [connectorCtx.supportedStakes, isLive, staked]);

  const action = (transactionHash) => (
    <React.Fragment>
      <Button
        color="secondary"
        size="small"
        onClick={() =>
          window.open(
            connectorCtx.currentNetwork.chainId === `0x3`
              ? `https://ropsten.etherscan.io/tx/${transactionHash}`
              : connectorCtx.currentNetwork.chainId === `0x1`
              ? `https://etherscan.io/tx/${transactionHash}`
              : connectorCtx.currentNetwork.chainId === `0x38`
              ? `https://bscscan.com/tx/${transactionHash}`
              : connectorCtx.currentNetwork.chainId === `0x61`
              ? `https://testnet.bscscan.com/tx/${transactionHash}`
              : "",
            "_blank"
          )
        }
      >
        View on Explorer
      </Button>

      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={() => openSnackbar(false)}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      {openSnackbar && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          message={transaction?.message}
          action={action(transaction?.transactionHash)}
        />
      )}
      {openErrorDialog && (
        <ErrorDialog
          message={error.message}
          onConfirm={() => setOpenErrorDialog(false)}
        />
      )}
      {openHarvestDialog && (
        <Dialog
          className={classes.dialog}
          title={`${selectedStake.earn.symbol} Harvest`}
          onCancel={() => (isLoading ? null : setOpenHarvestDialog(false))}
        >
          <div className={classes.container}>
            <div className={classes["input-controller"]}>
              <div className={`${classes.content} ${classes.row}`}>
                <div className={classes.title}>Harvesting:</div>
                <div className={classes.balance}>{`~${
                  formateDecimal(selectedStake?.pendingReward?.inFiat, 18) ||
                  "--"
                } ${traderCtx.fiat.symbol}`}</div>
              </div>
              <div className={`${classes.content} ${classes.row}`}>
                <input
                  id={randomID(6)}
                  type="number"
                  value={selectedStake?.pendingReward?.inCrypto}
                  placeholder="0.0"
                  step="any"
                  readOnly
                />
              </div>
            </div>
            <div className={`${classes.action}  ${classes.row}`}>
              <Button
                onClick={() => {
                  setOpenHarvestDialog(false);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setIsLoading(true);
                  await harvestToken(selectedStake);
                  setIsLoading(false);
                  setOpenHarvestDialog(false);
                }}
                disabled={isLoading}
              >
                {isLoading ? <LoadingIcon /> : "Confirm"}
              </Button>
            </div>
          </div>
        </Dialog>
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
          onCancel={() => {
            setOpenStakeDialog(false);
            setStakeAmount("0");
          }}
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
                  formateDecimal(selectedStake?.stake?.balanceOf, 18) || "--"
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
                    selectedStake?.stake?.balanceOf || "0"
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
                  setStakeAmount("0");
                }}
              >
                Cancel
              </Button>
              <Button onClick={stakeHandler}>Confirm</Button>
            </div>
          </div>
        </Dialog>
      )}
      {openROICaculator && (
        <Dialog
          className={`${classes.dialog} ${classes.roi}`}
          title="ROI Calculator"
          onCancel={() => {
            setOpenROICaculator(false);
            setOpenDetail(false);
            setCStakeAmount("0");
            setCFiatAmount("0");
            setCRateAmount("0");
            setEnableCompounding(false);
            setSwap(false);
            setReverse(false);
          }}
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
                <div
                  className={classes.tag}
                  onClick={() =>
                    cAmountChangeHandler(
                      false,
                      SafeMath.plus(
                        selectedStake?.stake?.balanceOf || "0",
                        selectedStake?.staked?.inCrypto || "0"
                      )
                    )
                  }
                >
                  My Balance
                </div>
                <div className={`${classes.tooltip}`}>
                  <div>?</div>
                  <div className={`${classes.tooltiptext}`}>
                    {`"My Balance" here includes both ${selectedStake?.stake?.symbol} in your wallet, and
                    ${selectedStake?.stake?.symbol} already staked in this pool.`}
                  </div>
                </div>
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
              openDetail ? classes.open : ""
            }`}
          >
            <div
              className={`${classes["button-container"]} ${classes.row}`}
              onClick={() => setOpenDetail((prev) => !prev)}
            >
              <div className={classes.button}>
                {openDetail ? "Hide" : "Details"}
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
        <div className={classes.expand}>
          <div className={classes["tool-bar"]}>
            <div className={classes.row}>
              <Switch
                inputProps={{ "aria-label": "controlled" }}
                checked={staked}
                onChange={handleStakedChange}
              />
              <div>Staked Only</div>
            </div>
            <div className={`${classes.tabs} ${classes.row}`}>
              <div
                className={`${classes.tab} ${isLive ? classes.active : ""}`}
                onClick={() => setIsLive(true)}
              >
                Live
              </div>
              <div
                className={`${classes.tab} ${!isLive ? classes.active : ""}`}
                onClick={() => setIsLive(false)}
              >
                Finished
              </div>
            </div>
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
              onSelect={(condition) =>
                sortingHandler(condition, filteredOptions)
              }
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
        </div>
        <div className={classes.list}>
          {filteredOptions.map((option, i) => (
            <StakeOption
              isConnected={
                connectorCtx.isConnected && connectorCtx.connectedAccount
              }
              data={option}
              openStakeDialogHandler={(type) =>
                openStakeDialogHandler(option, type)
              }
              openHarvestDialogHandler={() => openHarvestDialogHandler(option)}
              openROICaculatorHandler={() => openROICaculatorHandler(option)}
              approveStakeSpendToken={() => approveStakeSpendToken(option)}
              key={option.id}
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
