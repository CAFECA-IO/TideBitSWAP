import React from "react";

const UserContext = React.createContext({
  totalBalance: 0.0,
  reward: 0.0,
  data: [
    {
      title: "Porfolio",
      portionTitle: "Asset Allocation",
      portion: [],
    },
    {
      title: "Assets",
      portionTitle: "Asset Distribution",
      portion: [],
    },
  ],
  fiat: {
    dollarSign: "$",
    symbol: "USD",
    exchangeRate: "1",
  },
  // supportedPools: dummyPools,
  supportedCoins: [],
  supportedNetworks: [],
  history: [],
  assets: [],
  // initial: (startIndex, endIndex) => {},
  getPoolList: (startIndex, endIndex) => {},
  updateFiat: (fiat) => {},
  updateHistory: (data) => {},
  updateAsset: (asset) => {},
});

export default UserContext;
