import React, { useState } from "react";

import classes from "./TabView.module.css";

const TabView = (props) => {
  const [activeTab, setActiveTab] = useState(0);
  const [tabContent, seTabContent] = useState(props.children[0]);

  const clickHandler = (index) => {
    seTabContent(props.children[index]);
    setActiveTab(index);
  };

  return (
    <div className={classes["tab-view"]}>
      <div className={classes.tabs}>
        {props.tabs.map((tab, index) => (
          <div
            key={tab}
            className={
              classes.tab + (index === activeTab ? " " + classes.active : "")
            }
            onClick={() => clickHandler(index)}
          >
            {tab}
          </div>
        ))}
      </div>
      {tabContent}
      {/* <div className={classes["tab-content"]}>{tabContent}</div> */}
    </div>
  );
};

export default TabView;
