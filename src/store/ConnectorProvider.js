import React, { useState, useEffect, useCallback, useMemo } from "react";
import { TideBitSwapRouter, uniswapRouter_v2 } from "../constant/constant";
import { wallet_switchEthereumChain } from "../Utils/ethereum";
import { openInNewTab } from "../Utils/utils";
import ConnectorContext from "./connector-context";
import TideTimeSwapContract from "../modal/TideTimeSwapContract";

export const ConnectorProvider = (props) => {
  const ttsc = useMemo(() => new TideTimeSwapContract(TideBitSwapRouter), []);
  const [connectOptions, setConnectOptions] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [factoryContract, setFactoryContract] = useState(null);
  const [routerContract, setRouterContract] = useState(null);
  const [chainId, setChainId] = useState("0x3");

  const connectHandler = useCallback(
    async (appName, connectInfo) => {
      try {
        const result = await ttsc.connect(appName);
        setIsConnected(true);
        setConnectedAccount(result.connectedAccount);
        setFactoryContract(result.factoryContract);
      } catch (error) {
        console.log(`connect error`, error);
        throw error;
      }
    },
    [ttsc]
  );

  const switchChainHandler = async (chainId) => {
    await wallet_switchEthereumChain(chainId);
    setChainId(chainId);
  };

  const disconnectHandler = async () => {
    setIsConnected(false);
  };

  const getPoolList = useCallback(async () => await ttsc.getPoolList(), []);
  const addToken = useCallback(
    async (contract) => await ttsc.addToken(contract),
    [ttsc]
  );

  useEffect(() => {
    setRouterContract(ttsc.routerContract);
    setConnectOptions(ttsc.walletList);
  }, [ttsc]);

  return (
    <ConnectorContext.Provider
      value={{
        isConnected,
        connectOptions,
        connectedAccount,
        chainId,
        routerContract,
        factoryContract,
        onConnect: connectHandler,
        onDisconnect: disconnectHandler,
        onSwitch: switchChainHandler,
        getPoolList,
        addToken,
      }}
    >
      {props.children}
    </ConnectorContext.Provider>
  );
};
