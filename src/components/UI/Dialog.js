import React from "react";
import ReactDOM from "react-dom";
import Backdrop from "./Backdrop";

import Card from "./Card";
import classes from "./Dialog.module.css";

const DialogOverlay = (props) => {
  return (
    <Card
      className={
        props.expand ? classes.modal + " " + classes.expand : classes.modal
      }
    >
      <header className={classes.header}>
        <div className={classes.title}>{props.title}</div>
        <div className={classes.cancel} onClick={props.onCancel}>
          &#10005;
        </div>
      </header>
      <div className={classes.content}>{props.children}</div>
    </Card>
  );
};

const Dialog = (props) => {
  return (
    <React.Fragment>
      <Backdrop onCancel={props.onCancel} />,
      {ReactDOM.createPortal(
        <DialogOverlay
          title={props.title}
          onCancel={props.onCancel}
          expand={props.expand}
        >
          {props.children}
        </DialogOverlay>,
        document.getElementById("overlay-root")
      )}
    </React.Fragment>
  );
};

export default Dialog;
