import React, { useReducer } from "react";
import {
  assetData,
  dummyCoins,
  dummyNetworks,
  dummyPools,
  historyData,
} from "../constant/dummy-data";
import UserContext from "./user-context";

const userReducer = (prevState, action) => {
  switch (action.type) {
    default:
  }
};
const UserProvider = (props) => {
  const [userState, dispatchUser] = useReducer(userReducer, {
    totalBalance: "0.0",
    totalReward: "0.0",
    fiat: {
      dollarSign: "$",
      symbol: "USD",
      exchangeRate: "1",
    },
    // supportedPools: dummyPools,
    supportedCoins: dummyCoins,
    supportedNetworks: dummyNetworks,
    history: historyData,
    assets: assetData,
    updateFiat: (fiat) => {
      dispatchUser({
        type: "UPDATE_FIAT",
        value: {
          fiat,
        },
      });
    },
    updateHistory: (data) => {
      dispatchUser({
        type: "UPDATE_HISTORY_DATA",
        value: {
          historyData: data,
        },
      });
    },
    updateAsset: (asset) => {
      dispatchUser({
        type: "UPDATE_ASSET",
        value: {
          asset,
        },
      });
    },
  });
  return (
    <UserContext.Provider value={userState}>
      {props.children}
    </UserContext.Provider>
  );
};

export default UserProvider;
