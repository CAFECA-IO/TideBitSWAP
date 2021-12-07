import React, { useState, useCallback, useEffect, useMemo } from "react";
import Trader from "../modal/Trader";
import TraderContext from "./trader-context";

const TraderProvider = (props) => {
  const trader = useMemo(
    () => new Trader(props.network, props.communicator),
    [props.communicator, props.network]
  );
  const [fiats, setFiats] = useState([]);
  const [fiat, setFiat] = useState({
    dollarSign: "$",
    symbol: "USD",
  });

  const [isLoading, setIsLoading] = useState(false);

  const updateFiat = useCallback(() => {}, []);
  const getFiat = useCallback(() => {}, []);
  const getPrice = useCallback(
    (amount, priceToETH) => trader.getPrice(amount, priceToETH),
    [trader]
  );

  useEffect(() => {
    console.log(`useEffect trader`, trader);
    trader.start();

    return () => {};
  }, [trader]);

  return (
    <TraderContext.Provider
      value={{
        isLoading,
        fiat,
        fiats,
        updateFiat,
        getFiat,
        getPrice,
      }}
    >
      {props.children}
    </TraderContext.Provider>
  );
};

export default TraderProvider;
