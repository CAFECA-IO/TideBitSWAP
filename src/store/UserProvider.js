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
  const [pairIndex, setPairIndex] = useState(0);
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
  const [overview, setOverView] = useState([]);

  const updateFiat = useCallback((fiat) => {
    setFiat(fiat);
  }, []);

  const updateAssets = useCallback(()=>{},[])
  const updateHistories = useCallback(()=>{},[])
  const updateInvests = useCallback(()=>{},[])

  return (
    <UserContext.Provider
      value={{
        isLoading,
        totalBalance,
        reward,
        fiat,
        pairIndex,
        invests,
        assets,
        histories,
        overview,
        updateFiat,
        updateAssets,
        updateHistories,
        updateInvests
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

export default UserProvider;
