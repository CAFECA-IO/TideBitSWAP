import React from "react";
import ReactDOM from "react-dom";
import Backdrop from "./Backdrop";

import Card from "./Card";
import classes from "./ErrorDialog.module.css";
// import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Button from "./Button";

const ErrorDialog = (props) => {
  return (
    <React.Fragment>
      <Backdrop onCancel={props.onConfirm} />
      {ReactDOM.createPortal(
        <Card className={classes.modal}>
          <header className={classes.header}>
            {/* <div className={classes.title}>Error</div> */}
            <div className={classes.cancel} onClick={props.onConfirm}>
              &#10005;
            </div>
          </header>
          <div className={classes.content}>
            {/* <ErrorOutlineIcon  className={classes["error-icon"]}/> */}
            <div className={classes["error-icon"]}>!</div>
          </div>
          <div className={classes.message}>
            {/* Somthing went wrong */}
            {props.message || "Somthing went wrong"}
          </div>
          <Button onClick={props.onConfirm}>Dismiss</Button>
        </Card>,
        document.getElementById("overlay-root")
      )}
    </React.Fragment>
  );
};

export default ErrorDialog;
