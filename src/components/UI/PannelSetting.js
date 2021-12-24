import React, { useState } from "react";
import Backdrop from "./Backdrop";
import { IoSettingsOutline } from "react-icons/io5";

import classes from "./PannelSetting.module.css";

const PannelSetting = (props) => {
  const [displaySettings, setDisplaySettings] = useState(false);

  const slippageHandler = () => {
    setDisplaySettings(!displaySettings);
  };

  return (
    <div className={classes.settings} open={displaySettings}>
      {/* <div
  className={classes["settings-modal"]}
  onClick={slippageHandler}
></div> */}
      {displaySettings && (
        <Backdrop onCancel={slippageHandler} className="transparent" />
      )}
      <div className={classes["settings-icon"]} onClick={slippageHandler}>
        <IoSettingsOutline />
      </div>
      <div className={classes["settings-pannel"]}>
        <div className={classes["settings-header"]}>Transaction settings</div>
        <div className={classes["settings-option-box"]}>
          <div className={classes["settings-title"]}>Slippage tolerance ?</div>
          <div className={classes["settings-option"]}>
            <button
              className={classes["settings-button"]}
              onClick={props.slippageAutoHander}
            >
              Auto
            </button>

            <div className={classes["settings-input"]}>
              <input
                placeholder="0.10"
                type="number"
                value={props.slippage?.value}
                onInput={props.slippageChangeHander}
                readOnly={!!props.readOnly}
                step="any"
              />
              <div className={classes["input-hint"]}>&#37;</div>
            </div>
          </div>
          {props.slippage?.message && (
            <div className={classes.message}>
              <div>{props.slippage?.message}</div>
            </div>
          )}
        </div>
        <div className={classes["settings-option-box"]}>
          <div className={classes["settings-title"]}>
            Transaction deadline ?
          </div>
          <div className={classes["settings-option"]}>
            <div className={classes["settings-input"]}>
              <input
                placeholder="30"
                type="number"
                value={props.deadline}
                onInput={props.deadlineChangeHander}
                readOnly={!!props.readOnly}
                step="any"
              />
            </div>
            <div className={classes.text}>minutes</div>
          </div>
        </div>
        {/* <div className={classes["settings-option-box"]}>
    <div className={classes["settings-header"]}>
      Interface Settings
    </div>
    <div className={classes["settings-option"]}>
      <div className={classes["settings-title"]}>Expert Mode ?</div>
      <label className={classes.switch}>
        <input
          type="checkbox"
          onChange={props.expertModeChangeHandler}
          checked={props.openExpertMode}
        ></input>
        <span
          className={`${classes.slider} ${classes.round}`}
        ></span>
      </label>
    </div>
  </div> */}
      </div>
    </div>
  );
};

export default PannelSetting;
