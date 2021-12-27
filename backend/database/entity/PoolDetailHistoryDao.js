module.exports = function({
  chainId,
  contract,
  timestamp = Math.floor(Date.now() / 1000),
  volumeValue,
  volume24hrBefore,
  volumeChange,
  volumeToday,
  tvlValue,
  tvl24hrBefore,
  tvlChange,
  irr,
  interest24,
  fee24,
}) {
  if (!chainId) throw new Error("chainId can't be null or empty");
  if (!contract) throw new Error("token address can't be null or empty");

  return {
    // id,
    chainId,
    contract,
    timestamp,
    volumeValue,
    volume24hrBefore,
    volumeChange,
    volumeToday,
    tvlValue,
    tvl24hrBefore,
    tvlChange,
    irr,
    interest24,
    fee24,
  };
}