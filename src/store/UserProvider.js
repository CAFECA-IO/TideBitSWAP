import React, { useReducer, useState, useEffect, useContext } from "react";
import LoadingDialog from "../components/UI/LoadingDialog";
import {
  assetAllocationData,
  assetData,
  assetDistributionData,
  dummyNetworks,
} from "../constant/dummy-data";
import {
  getPoolList,
  getTokenBalanceOfContract,
  getUniSwapPoolPair,
} from "../Utils/utils";
import ConnectorContext from "./connector-context";
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
  assets: [],
};

const userReducer = async (prevState, action) => {
  switch (action.type) {
    default:
  }
};

const UserProvider = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [isLoading, setIsLoading] = useState(false);
  const [totalBalance, setTotalBalance] = useState("0.0");
  const [reward, setReward] = useState("0.0");
  const [data, setData] = useState([
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
  ]);
  const [fiat, setFiat] = useState({
    dollarSign: "$",
    symbol: "USD",
    exchangeRate: "1",
  });
  const [supportedPools, setPools] = useState([]);
  const [supportedCoins, setCoins] = useState([]);
  const [supportedNetworks, setNetworks] = useState(dummyNetworks);
  const [history, setHistories] = useState([]);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    if (connectorCtx.connectedAccount)
      getPoolList(10, 10, connectorCtx.connectedAccount).then((data) => {
        setPools(data.poolList);
        setAssets(data.assetList);
        setCoins(data.assetList);
        setIsLoading(false);
      });
    return () => {};
  }, [connectorCtx.connectedAccount]);

  return (
    <UserContext.Provider
      value={{
        totalBalance,
        reward,
        data,
        fiat,
        supportedPools,
        supportedCoins,
        supportedNetworks,
        history,
        assets,
      }}
    >
      {isLoading && <LoadingDialog />}
      {props.children}
    </UserContext.Provider>
  );
};

export default UserProvider;
