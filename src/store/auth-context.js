import React, { useState, useEffect } from "react";

const AuthContext = React.createContext({
  isConnected: false,
  onDisconnect: () => {
    console.log(`onDisconnect`)
  },
  onConnect: (connectedAccount) => {
    console.log(`onConnect`, connectedAccount)
  },
});

export const AuthContextProvider = (props) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const storedUserLoggedInInformation = localStorage.getItem("isConnected");

    if (storedUserLoggedInInformation === "1") {
      setIsConnected(true);
    }
  }, []);

  const connectHandler = (connectedAccount) => {
    // Now it's just a dummy/ demo
    console.log(`data: ${connectedAccount}`);
    localStorage.setItem("isConnected", "1");
    setIsConnected(true);
  };

  const disconnectHandler = () => {
    localStorage.removeItem("isConnected");
    setIsConnected(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isConnected: isConnected,
        onConnect: connectHandler,
        onDisconnect: disconnectHandler,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
