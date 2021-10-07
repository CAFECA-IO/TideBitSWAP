import React from "react";
import ReactDOM from "react-dom";

import Card from "./Card";
import classes from "./Dialog.module.css";

const Backdrop = (props) => {
  return <div className={classes.backdrop} onClick={props.onCancel} />;
};

const DialogOverlay = (props) => {
  console.log(props);
  return (
    <Card
      className={
        props.expand ? classes.modal + " " + classes.expand : classes.modal
      }
    >
      <header className={classes.header}>
        <div className={classes.title}>{props.title}</div>
        <button className={classes.cancel} onClick={props.onCancel}>
          +
        </button>
      </header>
      <div className={classes.content}>{props.children}</div>
    </Card>
  );
};

const Dialog = (props) => {
  return (
    <React.Fragment>
      {ReactDOM.createPortal(
        <Backdrop onCancel={props.onCancel} />,
        document.getElementById("backdrop-root")
      )}
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
