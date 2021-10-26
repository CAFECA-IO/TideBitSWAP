import React from "react";

const ConnectorContext = React.createContext({
  chainId: null,
  connectOptions: [],
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
  getPoolList: async () => {},
  addToken: async (contract) => {},
});

export default ConnectorContext;
