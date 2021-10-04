import React, { useState } from "react";

import Dialog from "./Dialog";
import classes from "./Landing.module.css";

const Landing = (props) => {
  const [openDialog, setOpenDialog] = useState(false);
  const options = [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/440px-MetaMask_Fox.svg.png",
      name: "Metamask",
    },
  ];
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
          options={options}
          onCancel={cancelHandler}
          onConnect={props.onConnect}
        />
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
