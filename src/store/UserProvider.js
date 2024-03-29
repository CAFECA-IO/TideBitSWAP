import React, { useState, useEffect, useContext } from "react";
// import LoadingDialog from "../components/UI/LoadingDialog";
import SafeMath from "../Utils/safe-math";
// import { getPoolList } from "../Utils/utils";
import ConnectorContext from "./connector-context";
import UserContext from "./user-context";

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
  // const [supportedNetworks, setNetworks] = useState(dummyNetworks);
  // const [history, setHistories] = useState([]);
  const [assets, setAssets] = useState([]);

  const fiatHandler = (fiat)=>{
    setFiat(fiat);
  }

  useEffect(() => {
    setIsLoading(true);
    if (connectorCtx.connectedAccount && connectorCtx.factoryContract) {
      connectorCtx
        .getPoolList(
          connectorCtx.connectedAccount,
          connectorCtx.factoryContract
        )
        .then((data) => {
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
            unLockedAmount = SafeMath.plus(
              asset.composition[0],
              unLockedAmount
            );
            assetAllocationData.push({
              name: asset.name,
              value: +asset.balanceOf,
            });
          });
          assetDistributionData = [
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
        });
    }
    return () => {};
  }, [
    connectorCtx,
    connectorCtx.connectedAccount,
    connectorCtx.factoryContract,
  ]);

  return (
    <UserContext.Provider
      value={{
        isLoading,
        totalBalance,
        reward,
        data,
        fiat,
        supportedPools,
        supportedCoins,
        // supportedNetworks,
        // history,
        assets,
        updateFiat: fiatHandler,
      }}
    >
      {/* {isLoading && <LoadingDialog />} */}
      {props.children}
    </UserContext.Provider>
  );
};

export default UserProvider;
