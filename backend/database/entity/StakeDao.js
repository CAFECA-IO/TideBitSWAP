module.exports = function({
  chainId,
  contract,
  factoryContract = '',
  factoryIndex = 0,
  rewardToken = '',
  stakedToken = '',
  rewardPerBlock = '',
  totalStaked = '',
  hasUserLimit = false,
  poolLimitPerUser = '',
  APY = '',
  start = '',
  end = '',
  projectSite = '',
}) {
  if (!chainId) throw new Error("chainId can't be null or empty");
  if (!contract) throw new Error("token address can't be null or empty");

  return {
    id: `${chainId}-${contract}`,
    chainId,
    contract,
    factoryContract,
    factoryIndex,
    rewardToken,
    stakedToken,
    rewardPerBlock,
    totalStaked,
    hasUserLimit,
    poolLimitPerUser,
    APY,
    start,
    end,
    projectSite,
  };
}