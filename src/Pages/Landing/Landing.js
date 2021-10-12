import React, { useState, useContext } from "react";
import Card from "../../components/UI/Card";
import Dialog from "../../components/UI/Dialog";
import { connectOptions } from "../../constant/dummy-data";
import AuthContext from "../../store/auth-context";
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

const Landing = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const authCtx = useContext(AuthContext);

  const cancelHandler = () => {
    setOpenDialog(false);
  };
  const clickHandler = (event) => {
    event.preventDefault();
    setOpenDialog(true);
  };

  const connectedHandler = (data) => {
    authCtx.onConnect(data);
    setOpenDialog(false);
  };
  return (
    <React.Fragment>
      {openDialog && (
        <Dialog title="Connect Wallet" onCancel={cancelHandler}>
          <ConnectOptions options={connectOptions} onClick={connectedHandler} />
        </Dialog>
      )}
      <div className={classes.landing}>
        <div>
          <h1 className="heading-primary">TideBit SWAP</h1>
          <p className="subtitle">Simple and Secure. Make your money to work</p>
          <button onClick={clickHandler}>Connect</button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Landing;
