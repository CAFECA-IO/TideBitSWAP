import React, { useState, useEffect, Fragment } from "react";
import { Route } from "react-router-dom";

import Landing from "./Pages/Landing/Landing";
import Home from "./Pages/Home/Home";
import Earn from "./Pages/Earn/Earn";
import Deposite from "./Pages/Deposite/Deposite";
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
      <Route path="/home">
        {!isConnected && <Landing onConnect={connectHandler} />}
        {isConnected && <Home onDisconnect={disconnectHandler} />}
      </Route>
      <Route path="/deposite">
        {!isConnected && <Landing onConnect={connectHandler} />}
        {isConnected && <Deposite onDisconnect={disconnectHandler} />}
      </Route>
      <Route path="/earn">
        {!isConnected && <Landing onConnect={connectHandler} />}
        {isConnected && <Earn onDisconnect={disconnectHandler} />}
      </Route>
      <Route path="/withdraw">
        {!isConnected && <Landing onConnect={connectHandler} />}
        {isConnected && <Withdraw onDisconnect={disconnectHandler} />}
      </Route>
    </Fragment>
  );
}

export default App;
