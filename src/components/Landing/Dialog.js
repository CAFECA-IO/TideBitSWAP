import React from "react";
import ReactDOM from "react-dom";

import Card from "../UI/Card";
import classes from "./Dialog.module.css";

const Backdrop = (props) => {
  return <div className={classes.backdrop} onClick={props.onCancel} />;
};

const DialogOverlay = (props) => {
  return (
    <Card className={classes.modal}>
      <header className={classes.header}>
        <h2>{props.title}</h2>
        <button className={classes.cancel} onClick={props.onCancel}>
          +
        </button>
      </header>
      <div className={classes.content}>
        {props.options.map((option) => {
          return (
            <div className={classes["icon-button"]}  key={option.name} onClick={
              ()=>{
                props.onConnect(option.name);
              }
            }>
              <Card className={classes["icon-button__icon"]}>
                <img src={option.src} alt={option.name} />
              </Card>
              <p className={classes["icon-button__name"]}>{option.name}</p>
            </div>
          );
        })}
      </div>
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
          options={props.options}
          onConnect={props.onConnect}
          onCancel={props.onCancel}
        />,
        document.getElementById("overlay-root")
      )}
    </React.Fragment>
  );
};

export default Dialog;
