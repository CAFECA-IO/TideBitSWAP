import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { ConnectorProvider } from "./store/ConnectorProvider";


ReactDOM.render(
  <ConnectorProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ConnectorProvider>,
  document.getElementById("root")
);
