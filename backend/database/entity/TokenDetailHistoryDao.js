module.exports = function({
  chainId,
  contract,
  timestamp = Math.floor(Date.now() / 1000),
  priceValue,
  priceChange,
  priceToEthValue,
  priceToEthChange,
  volumeValue,
  volumeChange,
  swap7Day,
  fee24,
  tvlValue,
  tvlChange,
  volumeToday,
}) {
  if (!chainId) throw new Error("chainId can't be null or empty");
  if (!contract) throw new Error("token address can't be null or empty");

  return {
    // id,
    chainId,
    contract,
    timestamp,
    priceValue,
    priceChange,
    priceToEthValue,
    priceToEthChange,
    volumeValue,
    volumeChange,
    swap7Day,
    fee24,
    tvlValue,
    tvlChange,
    volumeToday,
  };
}