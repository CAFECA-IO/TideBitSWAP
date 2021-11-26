module.exports = function({
  address,
  name = '',
  symbol = '',
  decimals = 0,
  totalSupply = '',
  priceToEth = '',
  inPoolAmount = '',
  timestamp = 0,
}) {
  if (!address) throw new Error("token address can't be null or empty");

  return {
    address,
    name,
    symbol,
    decimals,
    totalSupply,
    priceToEth,
    inPoolAmount,
    timestamp
  };
}