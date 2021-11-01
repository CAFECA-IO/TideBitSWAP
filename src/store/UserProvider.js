import React, { useState, useEffect, useContext, useCallback } from "react";
// import LoadingDialog from "../components/UI/LoadingDialog";
import SafeMath from "../Utils/safe-math";
// import { getPoolList } from "../Utils/utils";
import ConnectorContext from "./connector-context";
import UserContext from "./user-context";

const UserProvider = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [pairIndex, setPairIndex] = useState(0);
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
  const [assets, setAssets] = useState([]);
  // const [supportedNetworks, setNetworks] = useState(dummyNetworks);
  // const [history, setHistories] = useState([]);
  const fiatHandler = useCallback((fiat) => {
    setFiat(fiat);
  }, []);
  const getLists = useCallback(async () => {
    const allPairLength = await connectorCtx.getContractDataLength();
    for (let i = 0; i < allPairLength; i++) {
      const { poolList, assetList, pairIndex } =
        await connectorCtx.getContractData(i);
      console.log(`getLists poolList`, poolList);
      setPools(poolList);
      setAssets(assetList);
      setPairIndex(pairIndex);
    }
  }, [connectorCtx]);
  useEffect(() => {
    setIsLoading(true);
    if (connectorCtx.connectedAccount && connectorCtx.factoryContract) {
      getLists().then(() => {
        setIsLoading(false);
      });
    }
    return () => {};
  }, [connectorCtx.connectedAccount, connectorCtx.factoryContract, getLists]);

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
        // supportedNetworks,
        // history,
        updateFiat: fiatHandler,
      }}
    >
      {/* {isLoading && <LoadingDialog />} */}
      {props.children}
    </UserContext.Provider>
  );
};

export default UserProvider;
