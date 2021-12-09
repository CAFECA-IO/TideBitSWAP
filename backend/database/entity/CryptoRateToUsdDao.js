module.exports = function({
  chainId,
  rate = '',
  timestamp = Math.floor(Date.now()/1000),
}) {
  if (!chainId) throw new Error("chainId can't be null or empty");

  return {
    chainId,
    rate,
    timestamp
  };
}