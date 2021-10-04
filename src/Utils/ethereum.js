import utils from './utils';
import rpc from "./rpc";
// ++ get from toml later

 const CROSS_CHAIN_CHANNEL = '0xc72c4102da25b3a84d8e892fcce7a74c2f3588f0';

const requestPermissions = async () => {
  const [error, permissions] = await utils.to(
    window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    })
  );
  if (error) {
    if (error.code === 4001) {
      // EIP-1193 userRejectedRequest error
      console.log("Permissions needed to continue.");
    } else {
      console.error(error);
    }
  } else {
    const accountsPermission = permissions.find(
      (permission) => permission.parentCapability === "eth_accounts"
    );
    if (accountsPermission) {
      console.log("eth_accounts permission successfully requested!");
    }
  }
};

const checkLoginStatus = () => {
  console.log(window.ethereum.isConnected());
  // if (typeof window.ethereum !== "undefined" && ethereum.isConnected()) {
  //   connect();
  // }
};

const sendTransaction = async (account, amount, asset) => {
  return await utils.to(
    window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: account,
          to: CROSS_CHAIN_CHANNEL,
          // gas: "0x76c0", // 30400
          gasPrice: await rpc.getGasPrice(asset), //"0x9184e72a000", // 10000000000000
          value: utils.bnToHex(utils.toWei(parseFloat(amount), "ether")), // 2441406250
          data: "0xd86b75c7", //"0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675",
          chainId: asset.chainId, // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
        },
      ],
    })
  );
};

const connect = async () => {
  if (typeof window.ethereum !== "undefined") {
    const [error, accounts] = await utils.to(
      // https://docs.metamask.io/guide/getting-started.html#basic-considerations
      window.ethereum.request({
        method: "eth_requestAccounts",
      })
    );
    if (error) {
      if (error.code === 4001) {
        // 4001
        // The request was rejected by the user
        // -32602
        // The parameters were invalid
        // -32603
        // Internal error
        console.log("Please connect to MetaMask.");
        //++ open extension
      } else {
        console.error(error);
      }
      return false;
    } else {
      const account = accounts[0];
      // We currently only ever provide a single account,
      // but the array gives us some room to grow.
      console.log(account);
      return account;
    }
  }
  console.log("MetaMask isn't installed!");
  return false;
};

const getChainId = async () => {
  const [error, result] = await utils.to(
    window.ethereum.request({ method: "eth_chainId" })
  );
  if (error) {
    // ++
    return false;
  } else {
    // Hex	Decimal	    Network
    // 0x1	  1	        Ethereum  Main Network (Mainnet)
    // 0x3	  3	        Ropsten Test Network
    // 0x4	  4	        Rinkeby Test Network
    // 0x5	  5	        Goerli Test Network
    // 0x2a	  42	      Kovan Test Network
    return result;
  }
};

module.exports.connect = connect;
module.exports.getChainId = getChainId;
module.exports.sendTransaction = sendTransaction;
