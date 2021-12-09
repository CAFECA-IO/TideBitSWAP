const WETH10 = artifacts.require("./WETH10"); 
const TideBitSwapFacotory = artifacts.require("./TideBitSwapFactory");
const TideBitSwapRouter = artifacts.require("./TideBitSwapRouter");

module.exports = async function(deployer) {
  // await deployer.deploy(WETH10);
  const WETH = '0x34Ae93b593Fb45D2046e82603283a047049e33B1'
  await deployer.deploy(TideBitSwapFacotory);
  await deployer.deploy(TideBitSwapRouter, TideBitSwapFacotory.address, WETH); 
};