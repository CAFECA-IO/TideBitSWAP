import React, { useContext } from "react";
import AuthContext from "../../store/auth-context";

import classes from "./Header.module.css";
import SideMenuButton from "./SideMenuButton";


const Header = (props) => {
  const authCtx = useContext(AuthContext)
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
        <SideMenuButton onDisconnect={authCtx.onDisconnect} />
      </div>
    </div>
  );
};

export default Header;
