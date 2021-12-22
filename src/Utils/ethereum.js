import { randomID } from "./utils";
import keccak256 from "keccak256";
import SafeMath from "./safe-math";

export const wallet_requestPermissions = async () => {
  try {
    const result = window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });
    const accountsPermission = result.find(
      (permission) => permission.parentCapability === "eth_accounts"
    );
    if (accountsPermission) {
      console.log("eth_accounts permission successfully requested!");
    }
  } catch (error) {
    if (error.code === 4001) {
      // EIP-1193 userRejectedRequest error
      console.log("Permissions needed to continue.");
    } else {
      console.error(error);
    }
  }
};

export const eth_requestAccounts = async () => {
  try {
    //get connected account
    const result = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return result;
  } catch (error) {
    // 4001
    // The request was rejected by the user
    // -32602
    // The parameters were invalid
    // -32603
    // Internal error
    console.log(`eth_requestAccounts`, error);
    throw error;
  }
};

export const eth_chainId = async () => {
  try {
    const result = await window.ethereum.request({ method: "eth_chainId" });
    return result;
  } catch (error) {
    console.log(`eth_chainId`, error);
    throw error;
  }
};

export const wallet_switchEthereumChain = async (chainId) => {
  // switch chainId
  // Hex	Decimal	    Network
  // 0x1	  1	        Ethereum  Main Network (Mainnet)
  // 0x3	  3	        Ropsten Test Network
  // 0x4	  4	        Rinkeby Test Network
  // 0x5	  5	        Goerli Test Network
  // 0x2a	  42	      Kovan Test Network
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      // try {
      //   await window.ethereum.request({
      //     method: "wallet_addEthereumChain",
      //     params: [tidetime],
      //   });
      // } catch (addError) {
      //   // handle "add" error
      // }
    }
    console.log(`wallet_switchEthereumChain`, switchError);
    // handle
  }
};

export const eth_getStorageAt = async (contract, index) => {
  // token0: index=0x6
  // token1: index=0x7
  // contract=`0x${result.slice(26, 66)}`;
  try {
    const result = await window.ethereum.request({
      id: randomID(1),
      jsonrpc: "2.0",
      method: "eth_getStorageAt",
      params: [contract, `${index}`, "latest"],
    });
    return result;
  } catch (error) {
    console.log(`eth_getStorageAt error`, error);
    throw error;
  }
};

export const eth_call = async (funcName, data, to) => {
  if (!window.ethereum) throw Error("window.ethereum is undefine");
  const funcNameHex = SafeMath.isHex(funcName)
    ? funcName
    : `0x${keccak256(funcName).toString("hex").slice(0, 8)}`;
  try {
    const result = await window.ethereum.request({
      id: randomID(1),
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          from: "0x0000000000000000000000000000000000000000",
          data: !!data ? `${funcNameHex + data}` : `${funcNameHex}`,
          to,
        },
        "latest",
      ],
    });
    return result;
  } catch (error) {
    console.trace(`eth_call error`, error);
    throw error;
  }
};

/**
 *
 * @param {string} method eth_getBalance(address) || eth_estimateGas()|| eth_gasPrice()
 * @param {string | hex} address
 * @returns
 */
export const eth_get = async (method, address) => {
  try {
    const result = await window.ethereum.request({
      id: randomID(1),
      jsonrpc: "2.0",
      method: method,
      params: !address ? [] : [address.toString(), "latest"],
    });
    return result;
  } catch (error) {
    console.log(`${method}`, error);
    throw error;
  }
};

// yellow paper
export const eth_sendTransaction = async (
  functionName,
  from,
  to,
  data,
  value,
  chainId
) => {
  const funcNameHex = `0x${keccak256(functionName)
    .toString("hex")
    .slice(0, 8)}`;
  try {
    const result = await window.ethereum.request({
      id: randomID(1),
      jsonrpc: "2.0",
      method: "eth_sendTransaction",
      params: [
        {
          from,
          to,
          value, //SafeMath.toHex(SafeMath.toSmallestUnit(value, decimal)),
          data: !!data ? `${funcNameHex + data}` : `${funcNameHex}`,
          chainId,
        },
        "latest",
      ],
    });
    return result;
  } catch (error) {
    console.log(`${functionName} error`, error);
    throw error;
  }
};
