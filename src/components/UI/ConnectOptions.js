import React, { useContext } from "react";
import classes from "./ConnectOptions.module.css";
import ConnectorContext from "../../store/connector-context";
import Card from "./Card";

const ConnectOptions = (props) => {
  const connectorCtx = useContext(ConnectorContext);

  const connectHandler = (appName) => {
    props.onClick();
    try {
      connectorCtx.onConnect(appName);
    } catch (error) {
      console.log(`ConnectOptions error`, error);
    }
  };
  return (
    <React.Fragment>
      {connectorCtx.connectOptions.map((option) => {
        return (
          <div
            className={classes["icon-button"]}
            key={option.name}
            onClick={() => {
              connectHandler(option.name);
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

export default ConnectOptions;
