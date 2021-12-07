import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { ConnectorProvider } from "./store/ConnectorProvider";
import TideTimeSwapCommunicator from "./modal/TideTimeSwapCommunicator";
import Lunar from "@cafeca/lunar";

import { Config } from "./constant/config";
import TraderProvider from "./store/TraderProvider";

const api = {
  apiURL: "",
  apiKey: "",
  apiSecret: "",
};

const communicator = new TideTimeSwapCommunicator(api);
const network = Lunar.Blockchains.EthereumTestnet;
const supportedNetworks = Lunar.listBlockchain({ testnet: Config.isTestnet });

ReactDOM.render(
  <TraderProvider network={network} communicator={communicator}>
    <ConnectorProvider
      network={network}
      communicator={communicator}
      supportedNetworks={supportedNetworks}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConnectorProvider>
  </TraderProvider>,
  document.getElementById("root")
);
