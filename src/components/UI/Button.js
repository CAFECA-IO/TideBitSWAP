import React from "react";

import classes from "./Button.module.css";

const LoadingIcon = (_) => {
  return (
    <div className={classes["lds-spinner"]}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

const Button = (props) => {
  return (
    <button
      className={`${classes.button} ${props.loading ? classes.loading : ""}`}
      type={props.type || "button"}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.loading === true ? <LoadingIcon /> : props.children}
    </button>
  );
};

export default Button;
