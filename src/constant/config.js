const apiVersion = "/api/v1";
const apiURL = "";
const apiKey = "";
const apiSecret = "";

export const Config = {
  status: "stagging",
  stagging: {
    supportedChains: ["0x1", "0x3"],
    chainId: "0x3",
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
