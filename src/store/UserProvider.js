import { dispatch } from "d3-dispatch";
import React, { useReducer } from "react";
import {
  assetAllocationData,
  assetData,
  assetDistributionData,
  dummyNetworks,
} from "../constant/dummy-data";
import { getUniSwapPoolPair } from "../Utils/utils";
import UserContext from "./user-context";

const defaultUserState = {
  totalBalance: "0.0",
  reward: "0.0",
  data: [
    {
      title: "Porfolio",
      portionTitle: "Asset Allocation",
      portion: assetAllocationData,
    },
    {
      title: "Assets",
      portionTitle: "Asset Distribution",
      portion: assetDistributionData,
    },
  ],
  fiat: {
    dollarSign: "$",
    symbol: "USD",
    exchangeRate: "1",
  },
  supportedPools: [],
  supportedCoins: [],
  supportedNetworks: dummyNetworks,
  history: [],
  assets: assetData,
};

const userReducer = async (prevState, action) => {
  switch (action.type) {
    case "GET_POOL_LIST":
      const tokenList = [];
      for (
        let i = action.value.startIndex;
        i < action.value.startIndex + action.value.length;
        i++
      ) {
        const poolPair = await getUniSwapPoolPair(i);
        const _tokens = [poolPair.token0, poolPair.token1];
        _tokens.forEach((token) => {
          const index = tokenList.findIndex(
            (_token) => token.contract === _token.contract
          );
          if (index !== -1) return;
          tokenList.push(token);
        });
        action.value.callback(i,action.value.length);
        return {
          ...prevState,
          supportedPools: prevState.supportedPools.concat(poolPair),
          supportedCoins: tokenList,
        };
      }
      break;
    default:
  }
};

const UserProvider = (props) => {
  const [userState, dispatchUser] = useReducer(userReducer, {
    ...defaultUserState,
    getPoolList: (startIndex, length) => {
      dispatchUser({
        type: "GET_POOL_LIST",
        value: {
          startIndex,
          length,
          callback: (startIndex, length) => {
            userState.getPoolList(startIndex, length);
          },
        },
      });
    },
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
