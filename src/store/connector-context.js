import React from "react";

const ConnectorContext = React.createContext({
  chainId: null,
  connectedAccount: null,
  routerContract: null,
  factoryContract: null,
  isConnected: false,
  onDisconnect: () => {
    console.log(`onDisconnect`);
  },
  onConnect: (connectedAccount) => {
    console.log(`onConnect`, connectedAccount);
  },
});

export default ConnectorContext;
