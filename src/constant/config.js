const apiVersion = "/api/v1";
const apiURL = "";
const apiKey = "";
const apiSecret = "";

export const Config = {
  status: "stagging",
  routerContract: {
    "0x1": `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D`, // UniSwapRouter_v2
    "0x3": `0xDDBCB302A16f27D12Ef1cA491b4791a7b3d67c04`, // TideBitSwapRouter
    "0x38": `0x10ED43C718714eb63d5aA57B78B54704E256024E`, // PancakeRouter https://docs.pancakeswap.finance/code/smart-contracts/pancakeswap-exchange/router-v2
    "0x61": `0x214798a5ca2Fc1cD0d9E4020eCA384406AB67755`, // TideBitSwapRouter
  },
  stagging: {
    supportedChains: ["0x1", "0x3", "0x61", "0x38"],
    chainId: "0x38",
    isTestnet: true,
    apiURL,
    apiVersion,
    apiKey,
    apiSecret,
  },
  production: {
    supportedChains: ["0x1", "0x3"],
    chainId: "0x1",
    isTestnet: false,
    apiURL,
    apiVersion,
    apiKey,
    apiSecret,
  },
};
