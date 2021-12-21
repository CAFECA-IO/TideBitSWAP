import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { ConnectorProvider } from "./store/ConnectorProvider";
import TideTimeSwapCommunicator from "./modal/TideTimeSwapCommunicator";
import Lunar from "@cafeca/lunar";

import { Config } from "./constant/config";
import TraderProvider from "./store/TraderProvider";
import TideTimeSwapContract from "./modal/TideTimeSwapContract";

const api = {
  apiURL: "",
  apiKey: "",
  apiSecret: "",
};

const communicator = new TideTimeSwapCommunicator(api);
const lunar = new Lunar();
// get current network
const network =
  lunar?.blockchain ||
  (Config.isTestnet
    ? Lunar.Blockchains.EthereumTestnet
    : Lunar.Blockchains.Ethereum);
// const network = Lunar.Blockchains.EthereumTestnet;
// const supportedNetworks = Lunar.listBlockchain({ testnet: Config.isTestnet });
const supportedNetworks = Lunar.listBlockchain().filter(
  (network) => network.key === "EthereumTestnet" || network.key === "Ethereum"
);
const ttsc = new TideTimeSwapContract(network, communicator);

ReactDOM.render(
  <TraderProvider network={network} communicator={communicator}>
    <ConnectorProvider
      ttsc={ttsc}
      network={network}
      supportedNetworks={supportedNetworks}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConnectorProvider>
  </TraderProvider>,
  document.getElementById("root")
);
