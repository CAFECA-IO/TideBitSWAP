import React, { useState } from "react";
import Card from "../../components/UI/Card";
import Dialog from "../../components/UI/Dialog";
import { connectOptions } from "../../constant/dummy-data";
import classes from "./Landing.module.css";

const ConnectOptions = (props) => {
  return (
    <React.Fragment>
      {props.options.map((option) => {
        return (
          <div
            className={classes["icon-button"]}
            key={option.name}
            onClick={() => {
              props.onClick(option.name);
            }}
          >
            <Card className={classes["icon-button__icon"]}>
              <img src={option.src} alt={option.name} />
            </Card>
            <p className={classes["icon-button__name"]}>{option.name}</p>
          </div>
        );
      })}
    </React.Fragment>
  );
};

const Landing = (props) => {
  const [openDialog, setOpenDialog] = useState(false);

  const cancelHandler = () => {
    setOpenDialog(false);
  };
  const clickHandler = (event) => {
    event.preventDefault();
    setOpenDialog(true);
  };
  return (
    <React.Fragment>
      {openDialog && (
        <Dialog
          title="Connect Wallet"
          onCancel={cancelHandler}
        >
          <ConnectOptions options={connectOptions} onClick={props.onConnect}/>
        </Dialog>
      )}
      <div className={classes.landing}>
        <div>
          <h1 className="heading-primary">TideBitSWAP</h1>
          <p className="subtitle">Simple and Secure. Make your money to work</p>
          <button onClick={clickHandler}>Connect</button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Landing;
