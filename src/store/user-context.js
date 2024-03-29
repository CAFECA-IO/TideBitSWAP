import React from "react";

const UserContext = React.createContext({
  isLoading:false,
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
  supportedPools: [],
  supportedCoins: [],
  supportedNetworks: [],
  history: [],
  assets: [],
  updateFiat: (fiat) => {},
  updateHistory: (data) => {},
  updateAsset: (asset) => {},
});

export default UserContext;
