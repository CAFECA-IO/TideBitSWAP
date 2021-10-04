import React from "react";

import classes from "./List.module.css";

const List = (props) => {
  return (
    <React.Fragment>
      <div className={classes.title}>{props.title}</div>
      <div className={classes.list}>{props.children}</div>
    </React.Fragment>
  );
};

export default List;
