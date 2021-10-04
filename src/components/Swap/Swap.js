import React from "react";
import ReactDOM from "react-dom";
import Header from "../UI/Header";

import classes from "./Swap.module.css";

const SwapContent = (props) => {
  return (
    <div className={classes.swap} >
      <Header title="Swap" leading={true} onClose={props.onClose}/>
      <div>SWAP!</div>
    </div>
  );
};

const Swap = (props) => {
  return (
    <React.Fragment>
      {ReactDOM.createPortal(
        <SwapContent onClose={props.onClose} />,
        document.getElementById("overlay-root")
      )}
    </React.Fragment>
  );
};

export default Swap;
