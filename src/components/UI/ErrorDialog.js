import React from "react";
import ReactDOM from "react-dom";
import Backdrop from "./Backdrop";

import Card from "./Card";
import classes from "./ErrorDialog.module.css";

const ErrorDialog = (props) => {
  return (
    <React.Fragment>
      <Backdrop onCancel={props.onConfirm} />
      {ReactDOM.createPortal(
        <Card className={classes.modal}>
          <div className={classes.content}>
            <div className={classes["error-icon"]}>!</div>
          </div>
          <div className={classes.message}>
            Somthing went wrong
            {/* {props.message || "Somthing went wrong"} */}
          </div>
        </Card>,
        document.getElementById("overlay-root")
      )}
    </React.Fragment>
  );
};

export default ErrorDialog;
