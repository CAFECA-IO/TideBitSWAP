import ReactDOM from "react-dom";

import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App";
import { ConnectorContextProvider } from "./store/connector-context";

ReactDOM.render(
  <ConnectorContextProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ConnectorContextProvider>,
  document.getElementById("root")
);
