const WETH10 = artifacts.require("./WETH10"); 
const TideBitSwapFacotory = artifacts.require("./TideBitSwapFactory");
const TideBitSwapRouter = artifacts.require("./TideBitSwapRouter");

module.exports = async function(deployer) {
  await deployer.deploy(WETH10);
  await deployer.deploy(TideBitSwapFacotory);
  await deployer.deploy(TideBitSwapRouter, TideBitSwapFacotory.address, WETH10.address); 
};