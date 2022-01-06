import React, { useState, useEffect } from "react";
import SafeMath from "../../Utils/safe-math";
import { formateDecimal, numberWithCommas, randomID } from "../../Utils/utils";
import classes from "./StakeOption.module.css";
import CalculateIcon from "@mui/icons-material/Calculate";
import ConnectButton from "../UI/ConnectOptions";
import { Config } from "../../constant/config";

const ExpandStakeOption = (props) => {
  return (
    <div
      key={props.data.id}
      value={props.data.name}
      className={classes.option + " " + classes.expand}
    >
      <div
        className={`${classes.main} ${
          !!props.data.checked ? classes.checked : ""
        }`}
        htmlFor={props.data.id}
        onClick={props.clickHandler}
      >
        <div className={classes.pair}>
          <div className={classes.icon}>
            <img
              src={props.data.stake.iconSrc}
              alt={`${props.data.stake.symbol}`}
            />
          </div>
          <div className={classes.icon}>
            <img
              src={props.data.earn.iconSrc}
              alt={`${props.data.earn.symbol}`}
            />
          </div>
          <div className={classes.data}>
            <div
              className={classes.name}
            >{`Earn ${props.data.earn.symbol}`}</div>
            <div
              className={classes.detail}
            >{`Stake ${props.data.stake.symbol}`}</div>
          </div>
        </div>
        <div className={`${classes.profit} ${classes.data}`}>
          <div
            className={classes.title}
          >{`${props.data.earn.symbol} Earned`}</div>
          <div className={classes.inCrypto}>
            {formateDecimal(props.data.pendingReward.inCrypto, 4)}
          </div>
          <div className={classes.inFiat}>
            {`${formateDecimal(props.data.pendingReward.inFiat, 4)} ${
              props.fiat?.symbol
            }`}
          </div>
        </div>
        <div className={`${classes.staked} ${classes.data}`}>
          <div className={classes.title}>Total staked</div>
          <div className={classes.value}>
            {`${formateDecimal(props.data.totalStaked, 4)} ${
              props.data.stake.symbol
            }`}
          </div>
        </div>
        <div className={`${classes.apy} ${classes.data}`}>
          <div className={classes.title}>APY</div>
          <div className={classes.row}>
            <div className={classes.value}>
              {formateDecimal(SafeMath.mult(props.data.APY, "100"), 4)} %
            </div>
            <div
              className={classes["tool-controller"]}
              onClick={props.openROICaculatorHandler}
            >
              <CalculateIcon fontSize="medium" />
            </div>
          </div>
        </div>
        <div className={`${classes.blocks} ${classes.data}`}>
          <div className={classes.title}>Ends in</div>
          <div className={classes.value}>{`${numberWithCommas(
            props.data.end
          )} blocks`}</div>
        </div>
        <div className={classes.toggle}>&#10095;</div>
      </div>
      <div className={classes.sub}>
        <div className={classes.links}>
          <div>{`Max. stake per user: ${props.data.stake.poolLimitPerUser} ${props.data.stake.symbol}`}</div>
          <a
            className={classes.link}
            href={`#/asset/${props.data.stake.contract}`}
          >
            See Token Info
          </a>
          <a
            className={classes.link}
            href={`${props.data.projectSite}`}
            target="_blank"
            rel="noreferrer"
          >
            View Project Site
          </a>
          <a
            className={classes.link}
            href={`${Config.explorer[props.currentNetwork.chainId]}/address/${
              props.data.contract
            }`}
            target="_blank"
            rel="noreferrer"
          >
            View Contract
          </a>
        </div>
        <div className={classes.container}>
          <div
            className={classes.title}
          >{`${props.data.earn.symbol} Earned`}</div>
          <div className={classes.row}>
            <div className={classes["input-controller"]}>
              <input
                id={randomID(6)}
                type="number"
                value={props.data.pendingReward.inCrypto}
                // onInput={props.changeHandler}
                readOnly={true}
                placeholder="0.0"
                step="any"
              />
              <div
                className={classes.balance}
              >{`${props.data.pendingReward.inFiat} ${props.fiat.symbol}`}</div>
            </div>
            <button
              className={classes.operation}
              type="button"
              onClick={props.openHarvestDialogHandler}
              disabled={
                !props.isConnected ||
                !SafeMath.gt(props.data.pendingReward.inCrypto, "0")
              }
            >
              Harvest
            </button>
          </div>
        </div>
        {!props.isConnected ? (
          <div className={classes.container}>
            <ConnectButton className={classes.connect} />
          </div>
        ) : !SafeMath.gt(props.data.staked.inCrypto, "0") ? (
          SafeMath.gt(props.data.stake.allowance, "0") ? (
            <div className={classes.container}>
              <div
                className={classes.title}
              >{`Stake ${props.data.stake.symbol}`}</div>

              <button
                className={classes.operation}
                type="button"
                onClick={() => props.openStakeDialogHandler("stake")}
              >
                Stake
              </button>
            </div>
          ) : (
            <div className={classes.container}>
              <div className={classes.title}>Enable Pool</div>
              <button
                className={classes.operation}
                type="button"
                onClick={props.approveStakeSpendToken}
                disabled={!props.data.isLive}
              >
                Enable
              </button>
            </div>
          )
        ) : (
          <div className={classes.container}>
            <div
              className={classes.title}
            >{`${props.data.stake.symbol} Staked`}</div>
            <div className={classes.row}>
              <div className={`${classes.staked} ${classes.data}`}>
                <div className={classes.inCrypto}>
                  {formateDecimal(props.data.staked.inCrypto, 4)}
                </div>
                <div className={classes.inFiat}>
                  {`${formateDecimal(props.data.staked.inFiat, 4)} ${
                    props.fiat?.symbol
                  }`}
                </div>
              </div>
              <div className={classes.row}>
                <button
                  className={classes.operation}
                  type="button"
                  onClick={() => props.openStakeDialogHandler("stake")}
                >
                  +
                </button>
                <button
                  className={classes.operation}
                  type="button"
                  onClick={() => props.openStakeDialogHandler("unstake")}
                >
                  -
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const shrinkPoolOptionDetail = (props) => {
  return (
    <div
      key={props.data.id}
      value={props.data.name}
      className={classes.option + " " + classes.shrink}
    >
      <div
        className={`${classes.main} ${
          !!props.data.checked ? classes.checked : ""
        }`}
        htmlFor={props.data.id}
        onClick={props.clickHandler}
      >
        <div className={classes.pair}>
          <div className={classes.icon}>
            <img
              src={props.data.stake.iconSrc}
              alt={`${props.data.stake.symbol}`}
            />
          </div>
          <div className={classes.icon}>
            <img
              src={props.data.earn.iconSrc}
              alt={`${props.data.earn.symbol}`}
            />
          </div>
          <div className={classes.data}>
            <div
              className={classes.name}
            >{`Earn ${props.data.earn.symbol}`}</div>
            <div
              className={classes.detail}
            >{`Stake ${props.data.stake.symbol}`}</div>
          </div>
        </div>
        <div className={`${classes.profit} ${classes.data}`}>
          <div
            className={classes.title}
          >{`${props.data.earn.symbol} Earned`}</div>
          <div className={classes.inCrypto}>
            {formateDecimal(props.data.pendingReward.inCrypto, 4)}
          </div>
          <div className={classes.inFiat}>
            {`${formateDecimal(props.data.pendingReward.inFiat, 4)} ${
              props.fiat?.symbol
            }`}
          </div>
        </div>
        <div className={`${classes.apy} ${classes.data}`}>
          <div className={classes.title}>APY</div>
          <div className={classes.data}>
            <div className={classes.value}>
              {`${formateDecimal(SafeMath.mult(props.data.APY, "100"), 4)} %`}
            </div>
          </div>
        </div>
        <div className={classes.toggle}>&#10095;</div>
      </div>
      <div className={classes.sub}>
        <div className={classes.container}>
          <div
            className={classes.title}
          >{`${props.data.earn.symbol} Earned`}</div>
          <div className={classes.row}>
            <div className={classes["input-controller"]}>
              <input
                id={randomID(6)}
                type="number"
                value={props.data.pendingReward.inCrypto}
                // onInput={props.changeHandler}
                readOnly={true}
                placeholder="0.0"
                step="any"
              />
              <div
                className={classes.balance}
              >{`${props.data.pendingReward.inFiat} ${props.fiat.symbol}`}</div>
            </div>
            <button
              className={classes.operation}
              type="button"
              onClick={props.openHarvestDialogHandler}
              disabled={
                !props.isConnected ||
                !SafeMath.gt(props.data.pendingReward.inCrypto, "0")
              }
            >
              Harvest
            </button>
          </div>
        </div>
        {!props.isConnected ? (
          <div className={classes.container}>
            <div className={classes.title}></div>
            <ConnectButton />
          </div>
        ) : !SafeMath.gt(props.data.staked.inCrypto || "0", "0") ? (
          SafeMath.gt(props.data.allowanceAmount, "0") ? (
            <div className={classes.container}>
              <div
                className={classes.title}
              >{`Stake ${props.data.stake.symbol}`}</div>

              <button
                className={classes.operation}
                type="button"
                onClick={props.onClick}
              >
                Stake
              </button>
            </div>
          ) : (
            <div className={classes.container}>
              <div className={classes.title}>Enable Pool</div>
              <button
                className={classes.operation}
                type="button"
                onClick={props.approveStakeSpendToken}
                disabled={!props.data.isLive}
              >
                Enable
              </button>
            </div>
          )
        ) : (
          <div className={classes.container}>
            <div
              className={classes.title}
            >{`${props.data.stake.symbol} Staked`}</div>
            <div className={classes.row}>
              <div className={`${classes.staked} ${classes.data}`}>
                <div className={classes.inCrypto}>
                  {formateDecimal(props.data.staked.inCrypto, 4)}
                </div>
                <div className={classes.inFiat}>
                  {`${formateDecimal(props.data.staked.inFiat, 4)} ${
                    props.fiat?.symbol
                  }`}
                </div>
              </div>
              <div className={classes.row}>
                <button
                  className={classes.operation}
                  type="button"
                  onClick={() => props.openStakeDialogHandler("stake")}
                >
                  +
                </button>
                <button
                  className={classes.operation}
                  type="button"
                  onClick={() => props.openStakeDialogHandler("unstake")}
                >
                  -
                </button>
              </div>
            </div>
          </div>
        )}
        <div className={`${classes.apy} ${classes.data}`}>
          <div className={classes.title}>APY</div>
          <div className={classes.row}>
            <div className={classes.value}>
              {`${formateDecimal(SafeMath.mult(props.data.APY, "100"), 4)} %`}
            </div>
            <div
              className={classes["tool-controller"]}
              onClick={props.openROICaculatorHandler}
            >
              <CalculateIcon fontSize="medium" />
            </div>
          </div>
        </div>
        <div className={`${classes.staked} ${classes.data}`}>
          <div className={classes.title}>Total staked</div>
          <div className={classes.value}>
            {`${formateDecimal(props.data.totalStaked, 4)} ${
              props.data.stake.symbol
            }`}
          </div>
        </div>
        <div className={`${classes.blocks} ${classes.data}`}>
          <div className={classes.title}>Ends in</div>
          <div className={classes.value}>{`${numberWithCommas(
            props.data.end
          )} blocks`}</div>
        </div>
        <div className={classes.links}>
          <div>{`Max. stake per user: ${props.data.stake.poolLimitPerUser} ${props.data.stake.symbol}`}</div>
          <a
            className={classes.link}
            href={`#/asset/${props.data.stake.contract}`}
          >
            See Token Info
          </a>
          <a
            className={classes.link}
            href={`${props.data.projectSite}`}
            target="_blank"
            rel="noreferrer"
          >
            View Project Site
          </a>
          <a
            className={classes.link}
            href={`${Config.explorer[props.currentNetwork.chainId]}/address/${
              props.data.contract
            }`}
            target="_blank"
            rel="noreferrer"
          >
            View Contract
          </a>
        </div>
      </div>
    </div>
  );
};

const StakeOption = (props) => {
  const [width, setWidth] = useState(window.innerWidth);
  const breakpoint = 648;

  const changeHandler = (event) => {
    console.log(event.target.value);
  };

  // TODO
  // onclick open detail get Allowance

  /*
  https://blog.logrocket.com/developing-responsive-layouts-with-react-hooks/
  */
  useEffect(() => {
    /* Inside of a "useEffect" hook add an event listener that updates
       the "width" state variable when the window size changes */
    const handleWindowResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleWindowResize);

    /* passing an empty array as the dependencies of the effect will cause this
       effect to only run when the component mounts, and not each time it updates.
       We only want the listener to be added once */

    // Return a function from the effect that removes the event listener
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  return width < breakpoint
    ? shrinkPoolOptionDetail({
        ...props,
        changeHandler,
      })
    : ExpandStakeOption({ ...props, changeHandler });
};

export default StakeOption;
