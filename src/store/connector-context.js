import React, { useState, useEffect } from "react";
import AppConnector from "../Utils/app-connector";
import { wallet_switchEthereumChain } from "../Utils/ethereum";

const ConnectorContext = React.createContext({
  chainId: null,
  connectedAccount: null,
  isConnected: false,
  onDisconnect: () => {
    console.log(`onDisconnect`);
  },
  onConnect: (connectedAccount) => {
    console.log(`onConnect`, connectedAccount);
  },
});

export const ConnectorProvider = (props) => {
  const appConnector = new AppConnector();
  const [isConnected, setIsConnected] = useState(appConnector.connectStatus);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [chainId, setChainId] = useState("0x3");

  const connectHandler = async (appName) => {
    try {
      const result = await appConnector.connect(appName, chainId);
      console.log(`ConnectorProvider connectedAccount`, result);
      setIsConnected(!!result);
      setConnectedAccount(result ? result[0] : null);
      console.log(`ConnectorProvider connectedAccount`, result[0]);
    } catch (error) {
      console.log(`ConnectorProvider error`, error);
      throw error;
    }
  };

  const switchChainHandler = async (chainId) => {
    await wallet_switchEthereumChain(chainId);
    setChainId(chainId);
  };

  const disconnectHandler = async () => {
    await appConnector.disconnect();
    setIsConnected(false);
  };

  useEffect(() => {
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
        chainId,
        onConnect: connectHandler,
        onDisconnect: disconnectHandler,
        onSwitch: switchChainHandler,
      }}
    >
      {props.children}
    </ConnectorContext.Provider>
  );
};

export default ConnectorContext;
