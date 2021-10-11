import React from "react";

import classes from "./Header.module.css";
import SideMenu from "./SideMenu";


const Header = (props) => {
  return (
    <div className={classes.header}>
      <div className={classes.leading}>
        {/* {props.leading !== undefined && props.leading ? (
          <div onClick={props.onClose}>{"<"}</div>
        ) : null} */}
        {props.leading && (
          <li>
            <a href={props.back || "/"}>{props.leading}</a>
          </li>
        )}
      </div>
      <div className={classes.title}>{props.title}</div>
      <div className={classes.action}>
        <SideMenu onDisconnect={props.onDisconnect} />
      </div>
    </div>
  );
};

export default Header;
