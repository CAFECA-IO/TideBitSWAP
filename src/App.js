import React, { useState, useEffect, Fragment } from "react";

import Landing from "./components/Landing/Landing";
import Home from "./components/Home/Home";

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
      {!isConnected && <Landing onConnect={connectHandler} />}
      {isConnected && <Home onDisconnect={disconnectHandler} />}
    </Fragment>
  );
}

export default App;
