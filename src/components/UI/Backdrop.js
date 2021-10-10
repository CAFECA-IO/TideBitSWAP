import React from "react";
import ReactDOM from "react-dom";

import classes from "./Backdrop.module.css";

const Backdrop = (props) => {
  return (
    <React.Fragment>
      {ReactDOM.createPortal(
        <div className={classes.backdrop} onClick={props.onCancel} />,
        document.getElementById("backdrop-root")
      )}
    </React.Fragment>
  );
};

export default Backdrop;
