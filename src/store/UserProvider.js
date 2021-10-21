import React, { useReducer, useState, useEffect, useContext } from "react";
import LoadingDialog from "../components/UI/LoadingDialog";
import {
  assetAllocationData,
  assetData,
  assetDistributionData,
  dummyNetworks,
} from "../constant/dummy-data";
import SafeMath from "../Utils/safe-math";
import {
  getPoolList,
  getTokenBalanceOfContract,
  getTokenDetail,
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
  const [totalBalance, setTotalBalance] = useState("-.-");
  const [reward, setReward] = useState("-.-");
  const [data, setData] = useState([
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

    if (connectorCtx.connectedAccount) {
      // 36519 CTA/CTB
      // 36548 tkb/CTB
      // 36616 tt1/tt0
      // 36629 tt3/tt2
      getPoolList(36627, 3, connectorCtx.connectedAccount).then((data) => {
        setPools(data.poolList);
        setAssets(data.assetList);
        setCoins(data.assetList);
        setIsLoading(false);
        let lockedAmount = "0",
          unLockedAmount = "0",
          assetAllocationData = [],
          assetDistributionData = [];
        data.assetList.forEach((asset) => {
          lockedAmount = SafeMath.plus(asset.composition[1], lockedAmount);
          unLockedAmount = SafeMath.plus(asset.composition[0], unLockedAmount);
          assetAllocationData.push({
            name: asset.name,
            value: +asset.balanceOf,
          });
        });
        assetDistributionData = [
          { name: "unLocked", value: +unLockedAmount },
          { name: "Locked", value: +lockedAmount },
        ];
        console.log(assetAllocationData);
        setTotalBalance("0.0");
        setReward("0.0");
        setData([
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
      });
    }
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
      {/* {isLoading && <LoadingDialog />} */}
      {props.children}
    </UserContext.Provider>
  );
};

export default UserProvider;
