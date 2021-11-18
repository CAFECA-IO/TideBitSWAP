import React, { useState, useEffect, useContext, useCallback } from "react";
import SafeMath from "../Utils/safe-math";
import ConnectorContext from "./connector-context";
import UserContext from "./user-context";
import { transactionType } from "../constant/constant";
import { randomID } from "../Utils/utils";

// const dummyTokens = [
//   {
//     id: `${randomID(6)}`,
//     iconSrc: "https://www.tidebit.one/icons/eth.png",
//     symbol: "ETH",
//     price: "4534.73",
//     priceChange: "-0.71",
//     balance: "2.1",
//   },
// ];
// const dummyInvests = [
//   {
//     id: `${randomID(6)}`,
//     iconSrc: "https://www.tidebit.one/icons/usdt.png",
//     symbol: "USDT",
//     share: "2.1m",
//     tvl: "1.2b",
//     reward: "90k",
//     irr: "3",
//   },
// ];

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
  const [isLoading, setIsLoading] = useState(false);
  const [totalBalance, setTotalBalance] = useState("0.0");
  const [reward, setReward] = useState("-.-");
  const [fiat, setFiat] = useState({
    dollarSign: "$",
    symbol: "USD",
    exchangeRate: "1",
  });
  const [invests, setInvests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [isAssetInit, setIsAssetInit] = useState(false);
  const [isInvesttInit, setIsInvesttInit] = useState(false);
  const [histories, setHistories] = useState([]);

  const updateFiat = useCallback((fiat) => {
    setFiat(fiat);
  }, []);

  const updateList = useCallback((prevList, data) => {
    const updateList = [...prevList];
    const index = updateList.findIndex(
      (_data) => _data.contract === data.contract
    );
    if (index === -1) updateList.push(data);
    else updateList[index] = data;
    return updateList;
  }, []);

  const updateAssets = useCallback(() => {
    setIsAssetInit(true);
    let totalBalance = "0",
      assets = [],
      tokens = [];
    connectorCtx.supportedTokens.forEach(async (asset, index) => {
      setIsLoading(true);
      const updateAsset = await connectorCtx.getAssetBalanceOf(asset, index);
      console.log(`updateAsset`, updateAsset);
      if (SafeMath.gt(updateAsset.balanceOf, "0")) {
        totalBalance = SafeMath.plus(totalBalance, updateAsset.balanceOf);
        setAssets((prevState) => updateList(prevState, updateAsset));
        setTotalBalance(totalBalance);
        assets.push(updateAsset);
      } else {
        tokens.push(tokens);
      }
      connectorCtx.setSupportedTokens(assets.concat(tokens));
      setIsLoading(false);
    });
  }, [connectorCtx, updateList]);

  const updateInvests = useCallback(() => {
    setIsInvesttInit(true);
    let invests = [],
      pools = [];
    connectorCtx.supportedPools.forEach(async (pool, index) => {
      setIsLoading(true);
      const updatePool = await connectorCtx.getPoolBalanceOf(pool, index);
      if (SafeMath.gt(updatePool.share, "0")) {
        setInvests((prevState) => updateList(prevState, updatePool));
        invests.push(updatePool);
      } else {
        pools.push(pool);
      }
      connectorCtx.setSupportedPools(invests.concat(pools));
      setIsLoading(false);
    });
  }, [connectorCtx, updateList]);

  const updateHistories = useCallback(() => {}, []);

  useEffect(() => {
    if (connectorCtx.isConnected && connectorCtx.connectedAccount) {
      if (connectorCtx.supportedTokens.length > 0 && !isAssetInit)
        updateAssets();
      if (connectorCtx.supportedPools.length > 0 && !isInvesttInit)
        updateInvests();
    }
    if (!connectorCtx.isConnected || !connectorCtx.connectedAccount) {
      setIsAssetInit(false);
      setIsInvesttInit(false)
      setAssets([]);
      setInvests([]);
    }
    return () => {};
  }, [
    connectorCtx.connectedAccount,
    connectorCtx.isConnected,
    connectorCtx.supportedPools.length,
    connectorCtx.supportedTokens.length,
    isAssetInit,
    isInvesttInit,
    updateAssets,
    updateInvests,
  ]);

  // useEffect(() => {
  //   if (connectorCtx.isConnected && connectorCtx.connectedAccount) {
  //     const invests = connectorCtx.supportedPools.filter((pool) => {
  //       console.log(pool);
  //       return SafeMath.gt(pool.share, "0");
  //     });
  //     setInvests(invests);
  //     console.log(invests);
  //   }
  //   return () => {};
  // }, [
  //   connectorCtx.connectedAccount,
  //   connectorCtx.isConnected,
  //   connectorCtx.supportedPools,
  // ]);

  return (
    <UserContext.Provider
      value={{
        isLoading,
        totalBalance,
        reward,
        fiat,
        invests,
        assets,
        histories,
        updateFiat,
        updateAssets,
        updateHistories,
        updateInvests,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

export default UserProvider;
