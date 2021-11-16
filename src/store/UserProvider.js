import React, { useState, useEffect, useContext, useCallback } from "react";
import SafeMath from "../Utils/safe-math";
import ConnectorContext from "./connector-context";
import UserContext from "./user-context";
import { transactionType } from "../constant/constant";
import { randomID } from "../Utils/utils";

const defaultData = [
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
];

const dummyHistories = [
  {
    id: randomID(6),
    type: transactionType.SWAPS,
    tokenA: {
      symbol: "ETH",
      amount: "1.63k",
    },
    tokenB: {
      symbol: "WBTC",
      amount: "0.4",
    },
    time: "3 hrs ago",
  },
  {
    id: randomID(6),
    type: transactionType.ADDS,
    tokenA: {
      symbol: "ETH",
      amount: "--",
    },
    tokenB: {
      symbol: "WBTC",
      amount: "0.4",
    },
    time: "3 hrs ago",
  },
];

const UserProvider = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [pairIndex, setPairIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [totalBalance, setTotalBalance] = useState("0.0");
  const [reward, setReward] = useState("-.-");
  const [data, setData] = useState(defaultData);
  const [fiat, setFiat] = useState({
    dollarSign: "$",
    symbol: "USD",
    exchangeRate: "1",
  });
  const [supportedPools, setPools] = useState([]);
  const [assets, setAssets] = useState([]);
  const [histories, setHistories] = useState([]);
  
  const fiatHandler = useCallback((fiat) => {
    setFiat(fiat);
  }, []);
  const getLists = useCallback(async () => {
    const allPairLength = await connectorCtx.getContractDataLength();
    for (let i = 19; i < allPairLength; i++) {
      const { poolList, assetList, pairIndex } =
        await connectorCtx.getContractData(i);
      setPools(poolList);
      setAssets(assetList);
      setPairIndex(pairIndex);
      if (!connectorCtx.isConnected) break;
    }
  }, [connectorCtx]);

  useEffect(() => {
    if (connectorCtx.initial) {
      setIsLoading(true);
      connectorCtx.isInit();
      setAssets([]);
      setPools([]);
      setPairIndex(0);
      setTotalBalance("-.-");
      setReward("-.-");
      setData(defaultData);
      getLists().then(() => {
        setIsLoading(false);
      });
    }
    if (connectorCtx.error?.hasError) setIsLoading(false);
    return () => {};
  }, [connectorCtx, connectorCtx.error, connectorCtx.initial, getLists]);

  useEffect(() => {
    if (!isLoading && assets.length > 0) {
      console.log(`lockedAmount`);
      let lockedAmount = "0",
        unLockedAmount = "0",
        assetAllocationData = [],
        assetDistributionData = [];

      assets.forEach((asset) => {
        lockedAmount = SafeMath.plus(asset.balanceInPools, lockedAmount);
        unLockedAmount = SafeMath.plus(asset.balanceOf, unLockedAmount);
        assetDistributionData.push({
          name: asset.name,
          value: +asset.balanceOf,
        });
      });
      assetAllocationData = [
        { name: "unLocked", value: +unLockedAmount },
        { name: "Locked", value: +lockedAmount },
      ];
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
    }
    return () => {};
  }, [assets, isLoading]);

  return (
    <UserContext.Provider
      value={{
        isLoading,
        totalBalance,
        reward,
        data,
        fiat,
        pairIndex,
        supportedPools,
        assets,
        histories,
        updateFiat: fiatHandler,
      }}
    >
      {/* {isLoading && <LoadingDialog />} */}
      {props.children}
    </UserContext.Provider>
  );
};

export default UserProvider;
