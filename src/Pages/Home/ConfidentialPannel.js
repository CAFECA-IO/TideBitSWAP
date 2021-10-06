import React, { useState } from "react";
import Card from "../../components/UI/Card";

import classes from "./ConfidentialPannel.module.css";

const ConfidentialPannel = (props) => {
  const [isDataVisible, setDataVisibility] = useState("true");
  const toggleHandler = () => {
    console.log(`isDataVisible: ${isDataVisible}`);
    setDataVisibility((prev) => !prev);
  };
  return (
    <div onClick={toggleHandler}>
      <Card className={classes.box}>
        <div className={classes.header}>
          <div className={classes.title}>{props.title}</div>
          <div className={classes.eye} open={isDataVisible ? "open" : ""}></div>
        </div>
        <div className={classes.data}>{isDataVisible ?props.data: "$*.*"}</div>
      </Card>
    </div>
  );
};

export default ConfidentialPannel;
