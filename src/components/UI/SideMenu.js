import React, { useState } from "react";
import ReactDOM from "react-dom";

import classes from "./SideMenu.module.css";

const Backdrop = (props) => {
  return <div className={classes.backdrop} onClick={props.onClose} />;
};

const Content = (props) => {
  return (
    <div className={classes.menu}>
      <button onClick={props.onDisconnect}>Disconnect</button>
    </div>
  );
};

const SideMenu = (props) => {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const handleToggle = (_) => {
    setSideMenuOpen((prev) => !prev);
  };

  return (
    <React.Fragment>
      <button
        className={classes["icon"]}
        onClick={handleToggle}
        open={sideMenuOpen ? "open" : ""}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <React.Fragment>
        {sideMenuOpen &&
          ReactDOM.createPortal(
            <Backdrop onClose={handleToggle} />,
            document.getElementById("backdrop-root")
          )}
        {sideMenuOpen &&
          ReactDOM.createPortal(
            <Content
              onDisconnect={() => {
                props.onDisconnect();
                handleToggle();
              }}
            />,
            document.getElementById("overlay-root")
          )}
      </React.Fragment>
    </React.Fragment>
  );
};

export default SideMenu;
