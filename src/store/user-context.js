import React from "react";

const UserContext = React.createContext({
  isLoading: false,
  totalBalance: 0.0,
  reward: 0.0,

  fiat: {
    dollarSign: "$",
    symbol: "USD",
    exchangeRate: "1",
  },
  invests: [],
  assets: [],
  histories: [],
  updateFiat: (fiat) => {},
  updateAssets: (asset) => {},
  updateHistories: (history) => {},
  updateInvests: (invest) => {},
});

export default UserContext;
