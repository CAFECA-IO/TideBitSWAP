import React, { useState, useEffect, useCallback } from "react";
import { TideBitSwapRouter, uniswapRouter_v2 } from "../constant/constant";
import {
  eth_requestAccounts,
  wallet_switchEthereumChain,
} from "../Utils/ethereum";
import {
  getFactoryContract,
  isMetaMaskInstalled,
  metaMaskSetup,
  openInNewTab,
} from "../Utils/utils";
import ConnectorContext from "./connector-context";

export const ConnectorProvider = (props) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [factoryContract, setFactoryContract] = useState(null);
  const [routerContract, setRouterContract] = useState(null);
  const [chainId, setChainId] = useState("0x3");

  const connectHandler = useCallback(
    async (appName, connectInfo) => {
      switch (appName) {
        case "MetaMask":
          if (!isMetaMaskInstalled) {
            openInNewTab("https://metamask.io/download.html");
            break;
          } else {
            try {
              const connectedAccounts = await eth_requestAccounts();
              if (connectInfo !== chainId) {
                await wallet_switchEthereumChain(chainId);
              }
              setIsConnected(!!connectedAccounts);
              setConnectedAccount(
                connectedAccounts ? connectedAccounts[0] : null
              );
              setRouterContract(TideBitSwapRouter);
              const contract = await getFactoryContract(TideBitSwapRouter);
              setFactoryContract(contract);
              return connectedAccounts;
            } catch (error) {
              console.log(`connect error`, error);
              throw error;
            }
          }
        default:
      }
    },
    [chainId]
  );

  const switchChainHandler = async (chainId) => {
    await wallet_switchEthereumChain(chainId);
    setChainId(chainId);
  };

  const disconnectHandler = async () => {
    setIsConnected(false);
  };

  useEffect(() => {
    if (isMetaMaskInstalled) {
      window.ethereum.on("connect", (connectInfo) => {
        if (window.ethereum.isConnected() && window.ethereum.isMetaMask) {
          console.log(
            `window.ethereum.isConnected()`,
            window.ethereum.isConnected()
          );
          connectHandler("MetaMask", connectInfo);
        }
      });
      // TODO: BUG
      //   window.ethereum.on("disconnect", (disconnectInfo) => {
      //     setIsConnected(false);
      //     console.log(`disconnectInfo`, disconnectInfo);
      //   });
    }
    return () => {
      window.ethereum.removeListener("connect", (connectInfo) => {
        if (window.ethereum.isConnected() && window.ethereum.isMetaMask) {
          connectHandler("MetaMask", connectInfo);
        }
      });
      //   window.ethereum.removeListener("disconnect", (disconnectInfo) => {
      //     setIsConnected(false);
      //     console.log(`disconnectInfo`, disconnectInfo);
      //   });
    };
  }, [connectHandler]);

  return (
    <ConnectorContext.Provider
      value={{
        isConnected,
        connectedAccount,
        chainId,
        routerContract,
        factoryContract,
        onConnect: connectHandler,
        onDisconnect: disconnectHandler,
        onSwitch: switchChainHandler,
      }}
    >
      {props.children}
    </ConnectorContext.Provider>
  );
};
