import React from "react";

const TraderContext = React.createContext({
  isLoading: false,
  fiat: {
    dollarSign: "$",
    symbol: "USD",
  },
  fiats: [],
  updateFiat: (symbol) => {},
  getFiat: (symbol) => {},
  getPrice: (priceToETH) => {},
});

export default TraderContext;
