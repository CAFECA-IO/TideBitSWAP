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
        let staticAmount = "0",
          liquidityAmount = "0";
        data.assetList.forEach((asset) => {
          staticAmount = SafeMath.plus(asset.composition[1], staticAmount);
          liquidityAmount = SafeMath.plus(
            asset.composition[0],
            liquidityAmount
          );
        });
        let assetDistributionData = [
          { name: "Liquidity", value: +liquidityAmount },
          { name: "Static", value: +staticAmount },
        ];
        let assetAllocationData = data.assetList.map((asset) => ({
          name: asset.name,
          value: +asset.balanceOf,
        }));
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
