module.exports = function({
  chainId,
  contract,
  timestamp,
  tvl,
}) {
  if (!chainId) throw new Error("chainId can't be null or empty");
  if (!contract) throw new Error("pool address can't be null or empty");

  return {
    // id,
    chainId,
    contract,
    timestamp,
    tvl
  };
}