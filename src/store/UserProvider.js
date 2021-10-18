import React, { useReducer } from "react";
import {
  assetAllocationData,
  assetData,
  assetDistributionData,
  dummyNetworks,
} from "../constant/dummy-data";
import { getTokenBalanceOfContract, getUniSwapPoolPair } from "../Utils/utils";
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
      const state = await prevState;
      console.log("GET_POOL_LIST state", state);
      console.log("GET_POOL_LIST startIndex", action.value.startIndex);
      console.log(
        "GET_POOL_LIST connectedAccount",
        action.value.connectedAccount
      );
      const poolPair = await getUniSwapPoolPair(action.value.startIndex);
      const _tokens = [poolPair.token0, poolPair.token1];
      let updateSupportedCoins = state.supportedCoins;
      _tokens.forEach(async (token) => {
        const index = state.supportedCoins.findIndex(
          (coin) => token.contract === coin.contract
        );
        if (index === -1) {
          const balanceOf = await getTokenBalanceOfContract(
            token.contract,
            action.value.connectedAccount
          );
          updateSupportedCoins.push({ ...token, ...balanceOf });
        }
      });
      console.log(`prevState`, prevState);
      if (action.value.startIndex + 1 < action.value.endIndex) {
        action.value.callback(
          action.value.startIndex + 1,
          action.value.endIndex,
          action.value.connectedAccount
        );
      }

      return {
        ...state,
        supportedPools: state.supportedPools.concat(poolPair),
        supportedCoins: updateSupportedCoins,
      };
    default:
  }
};

const UserProvider = (props) => {
  const [userState, dispatchUser] = useReducer(userReducer, {
    ...defaultUserState,
    getPoolList: (startIndex, endIndex, connectedAccount) => {
      dispatchUser({
        type: "GET_POOL_LIST",
        value: {
          startIndex,
          endIndex,
          connectedAccount: connectedAccount,
          callback: userState.getPoolList,
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
