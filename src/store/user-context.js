import React from "react";

const UserContext = React.createContext({
  totalBalance: "0.0",
  totalReward: "",
  fiat: {
    symbol: "USD",
    exchangeRate: "1",
  },
  history: [],
  assets: [],
//   supportedPools: [],
  supportedCoins: [],
  supportedNetwork: [],
  updateFiat: (fiat) => {},
  updateHistory: (data) => {},
  updateAsset: (asset) => {},
});

export default UserContext;
