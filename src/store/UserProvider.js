import React, { useState, useEffect, useContext, useCallback } from "react";
import SafeMath from "../Utils/safe-math";
import ConnectorContext from "./connector-context";
import UserContext from "./user-context";
import { transactionType } from "../constant/constant";
import { randomID } from "../Utils/utils";

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
  const [histories, setHistories] = useState([]);

  const updateFiat = useCallback((fiat) => {
    setFiat(fiat);
  }, []);

  const updateAssets = useCallback(() => {}, []);
  const updateHistories = useCallback(() => {}, []);
  const updateInvests = useCallback(() => {}, []);

  useEffect(() => {
    if (connectorCtx.isConnected && connectorCtx.connectedAccount) {
      let totalBalance = "0";
      const assets = connectorCtx.supportedTokens.filter((token) => {
        let hasBalance = SafeMath.gt(token.balanceOf, "0");
        if (hasBalance) {
          totalBalance = SafeMath.plus(totalBalance, token.balanceOf);
        }
        return SafeMath.gt(token.balanceOf, "0");
      });
      console.log(assets);
      setAssets(assets);
      setTotalBalance(totalBalance);
    }
    return () => {};
  }, [
    connectorCtx.connectedAccount,
    connectorCtx.isConnected,
    connectorCtx.supportedTokens,
  ]);

  useEffect(() => {
    if (connectorCtx.isConnected && connectorCtx.connectedAccount) {
      const invests = connectorCtx.supportedPools.filter((pool) => {
        console.log(pool);
        return SafeMath.gt(pool.share, "0");
      });
      setInvests(invests);
      console.log(invests);
    }
    return () => {};
  }, [
    connectorCtx.connectedAccount,
    connectorCtx.isConnected,
    connectorCtx.supportedPools,
  ]);

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
