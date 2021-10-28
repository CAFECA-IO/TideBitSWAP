const utils = require("./utils");
const node = require("../constant/node");

const jsonRPC = (method, asset, account) => {
  console.log("method", method);
  console.log("asset", asset);
  console.log("account", account);

  const opts = {};
  opts.headers = { "content-type": "application/json" };
  opts.method = "POST";
  opts.url = node.getUrl(asset);
  switch (method) {
    case "eth_getTransactionCount":
      opts.payload = `{
        "jsonrpc":"2.0",
        "method":"eth_getTransactionCount",
        "params":["${account}","latest"],
        "id": "${utils.randomID()}"
      }`;
      break;
    case "eth_getBalance":
      opts.payload = `{
          "jsonrpc":"2.0",
          "method":"eth_getBalance",
          "params":["${account}","latest"],
          "id": "${utils.randomID()}"
        }`;
      break;
    case "eth_gasPrice":
      opts.payload = `{
          "jsonrpc":"2.0",
          "method":"eth_gasPrice", 
          "params":[],
          "id": "${utils.randomID()}"
        }`;
      break;
    case "eth_estimateGas":
      opts.payload = `{
          "jsonrpc":"2.0",
          "method":"eth_estimateGas",
          "params":[],
          "id": "${utils.randomID()}"
        }`;
      break;
  }
  return opts;
};

const estimateGas = async (txHex) => {
  const [error, resultObj] = await utils.to(
    utils.request(jsonRPC("eth_estimateGas", txHex))
  );
  if (error) {
    console.log(error);
  } else {
    console.log(resultObj); // --
    const estimateGas = resultObj.result;
    console.log(estimateGas); // "0x5208" // 21000
    return estimateGas;
  }
};
const getGasPrice = async (asset) => {
  const [error, resultObj] = await utils.to(
    utils.request(jsonRPC("eth_gasPrice", asset))
  );
  if (error) {
    console.log(error);
  } else {
    console.log(resultObj); // --
    const gasPrice = resultObj.result;
    console.log(gasPrice); // "0x1dfd14000" // 8049999872 Wei
    return gasPrice;
  }
};
const getBalance = async (asset, account) => {
  console.log("getBalance", account);
  const [error, resultObj] = await utils.to(
    utils.request(jsonRPC("eth_getBalance", asset, account))
  );
  if (error) {
    console.log(error);
  } else {
    console.log(resultObj); // --
    const balance = utils.toEther(parseInt(resultObj.result), "wei");
    console.log(balance); // --
    return balance;
  }
};

module.exports.getBalance = getBalance;
module.exports.getGasPrice = getGasPrice;
module.exports.estimateGas = estimateGas;

// module.exports = {
//     getBalance: getBalance,
// }
