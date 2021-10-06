import React, { useState, useEffect, Fragment } from "react";
import { Route } from "react-router-dom";

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
console.log(isConnected);
  return (
    <Fragment>
      <Route path="/">
        {isConnected ?
          <Home onDisconnect={disconnectHandler} /> :
          <Landing onConnect={connectHandler} />
        }
      </Route>
      <Route path="/#/deposit">
        {isConnected ?
          <Deposit onDisconnect={disconnectHandler} /> :
          <Landing onConnect={connectHandler} />
        }
      </Route>
      <Route path="/#/earn">
        {isConnected ?
          <Earn onDisconnect={disconnectHandler} /> :
          <Landing onConnect={connectHandler} />
        }
      </Route>
      <Route path="/#/withdraw">
        {isConnected ?
          <Withdraw onDisconnect={disconnectHandler} /> :
          <Landing onConnect={connectHandler} />
        }
      </Route>
    </Fragment>
  );
}

export default App;
