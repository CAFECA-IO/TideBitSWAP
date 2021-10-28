import React from "react";
import ReactDOM from "react-dom";
import Backdrop from "./Backdrop";

import Card from "./Card";
import classes from "./LoadingDialog.module.css";
import LoadingIcon from "./LoadingIcon";

const LoadingDialog = (props) => {
  return (
    <React.Fragment>
      <Backdrop onCancel={() => {}} />
      {ReactDOM.createPortal(
        <Card className={classes.modal}>
          <div className={classes.content}><LoadingIcon/></div>
          <div className={classes.message}>Loading...</div>
        </Card>,
        document.getElementById("overlay-root")
      )}
    </React.Fragment>
  );
};

export default LoadingDialog;
