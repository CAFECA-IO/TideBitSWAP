import { connectedStatus, isMetaMaskInstalled, metaMaskSetup, openInNewTab } from "./utils";

const tidetime = {
  chainId: "0x1f51",
  chainName: "Tidetime",
  nativeCurrency: {
    name: "Tidetime Token",
    symbol: "TTT",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.tidebit.network"],
  iconUrls: ["https://iconape.com/wp-content/png_logo_vector/tidebit.png"],
};

class AppConnector {
  constructor() {
    this.ethereum = window.ethereum;
    // this.chainId = "0x1";
    this.chainId = "0x3";
    this.connectStatus = connectedStatus();
  }
  disconnect = async () => {};


  connect = async (appName, chainId) => {
    console.log(`AppConnector appName: ${appName}`);
    console.log(`AppConnector chainId: ${chainId}`);
    switch (appName) {
      case "MetaMask":
        if (!isMetaMaskInstalled()) {
          openInNewTab("https://metamask.io/download.html");
          break;
        } else {
          try {
            const result = await metaMaskSetup(chainId);
            return result;
          } catch (error) {
            console.log(`connect error`, error);
            throw error;
          }
        }
      default:
    }
  };
}

export default AppConnector;
