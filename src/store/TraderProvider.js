import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useContext,
} from "react";
import Trader from "../modal/Trader";
import ConnectorContext from "./connector-context";
import TraderContext from "./trader-context";

const TraderProvider = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [network, setNetwork] = useState(ConnectorContext.currentNetwork);
  const trader = useMemo(
    () => new Trader(props.communicator),
    [props.communicator]
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
    if (
      (!network?.chainId && connectorCtx.currentNetwork?.chainId) ||
      connectorCtx.currentNetwork?.chainId !== network?.chainId
    ) {
      console.log(`useEffect start trader`, trader);
      trader.stop();
      trader.start(connectorCtx.currentNetwork?.chainId);
      setNetwork(connectorCtx.currentNetwork);
    }
    return () => {};
  }, [connectorCtx.currentNetwork, network, trader]);

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
