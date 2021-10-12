import React, { useState } from "react";
import ReactDOM from "react-dom";
import Backdrop from "../UI/Backdrop";
import SideMenu from "./SideMenu";
import classes from "./SideMenu.module.css";

const SideMenuButton = (props) => {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const handleToggle = (_) => {
    setSideMenuOpen((prev) => !prev);
  };

  return (
    <React.Fragment>
      {sideMenuOpen && <Backdrop onCancel={handleToggle} />}
      {/* {sideMenuOpen && */}
      {ReactDOM.createPortal(
        <SideMenu
          open={sideMenuOpen}
          onClose={()=>setSideMenuOpen(false)}
          onDisconnect={() => {
            props.onDisconnect();
            handleToggle();
          }}
        />,
        document.getElementById("side-menu")
      )}
      <button
        className={classes["icon"]}
        onClick={handleToggle}
        open={sideMenuOpen ? "open" : ""}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </React.Fragment>
  );
};

export default SideMenuButton;
