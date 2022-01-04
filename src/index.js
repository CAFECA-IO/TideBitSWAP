import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { ConnectorProvider } from "./store/ConnectorProvider";
import TideTimeSwapCommunicator from "./modal/TideTimeSwapCommunicator";
import TraderProvider from "./store/TraderProvider";

const communicator = new TideTimeSwapCommunicator();

ReactDOM.render(
  <ConnectorProvider communicator={communicator}>
    <TraderProvider communicator={communicator}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </TraderProvider>
  </ConnectorProvider>,
  document.getElementById("root")
);
