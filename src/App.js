import React, { useState, useEffect, Fragment } from "react";
import { HashRouter, Route, Switch } from "react-router-dom";

import Landing from "./Pages/Landing/Landing";
import Home from "./Pages/Home/Home";
import Earn from "./Pages/Earn/Earn";
import Deposit from "./Pages/Deposit/Deposit";
import Withdraw from "./Pages/Withdraw/Withdraw";

function App() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const storedUserConnectedInformation = localStorage.getItem("isConnected");

    if (storedUserConnectedInformation === "1") {
      setIsConnected(true);
    }
  }, []);

  const connectHandler = (data) => {
    // Now it's just a dummy/ demo
    console.log(`data: ${data}`);
    localStorage.setItem("isConnected", "1");
    setIsConnected(true);
  };

  const disconnectHandler = () => {
    localStorage.removeItem("isConnected");
    setIsConnected(false);
  };

  return (
    <Fragment>
      {isConnected ?
          <HashRouter>
            <Route exact path="/">
              <Home onDisconnect={disconnectHandler} />
            </Route>
            <Route path="/deposit">
              <Deposit onDisconnect={disconnectHandler} />
            </Route>
            <Route path="/earn">
              <Earn onDisconnect={disconnectHandler} />
            </Route>
            <Route path="/withdraw">
              <Withdraw onDisconnect={disconnectHandler} />
            </Route>
          </HashRouter>
          :
          <Landing onConnect={connectHandler} />
      }
    </Fragment>
  );
}

export default App;
