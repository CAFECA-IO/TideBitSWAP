import React, { useState, useEffect } from "react";
import AppConnector from "../Utils/app-connector";

const ConnectorContext = React.createContext({
  connectedAccount: null,
  isConnected: false,
  onDisconnect: () => {
    console.log(`onDisconnect`);
  },
  onConnect: (connectedAccount) => {
    console.log(`onConnect`, connectedAccount);
  },
});

export const ConnectorContextProvider = (props) => {
  const appConnector = new AppConnector();
  const [isConnected, setIsConnected] = useState(appConnector.connectStatus);
  const [connectedAccount, setConnectedAccount] = useState(null);

  const connectHandler = async (appName) => {
    try {
      const result = await appConnector.connect(appName);
      setIsConnected(true);
      setConnectedAccount(result[0]);
    } catch (error) {
      console.log(`ConnectorContextProvider error`, error);
      throw error;
    }
  };

  const disconnectHandler = async () => {
    await appConnector.disconnect();
    setIsConnected(false);
  };

  useEffect(() => {
    console.log(`useEffect isConnected`, isConnected);
    console.log(
      `useEffect appConnector.connectStatus`,
      appConnector.connectStatus
    );
    if (appConnector.connectStatus) {
      setIsConnected(true);
      connectHandler(`MetaMask`);
    }
  }, [isConnected]);

  return (
    <ConnectorContext.Provider
      value={{
        isConnected,
        connectedAccount,
        onConnect: connectHandler,
        onDisconnect: disconnectHandler,
      }}
    >
      {props.children}
    </ConnectorContext.Provider>
  );
};

export default ConnectorContext;
