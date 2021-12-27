module.exports = function({
  chainId,
  timestamp = Math.floor(Date.now() / 1000),
  volumeValue,
  volume24hrBefore,
  volumeChange,
  volumeToday,
  tvlValue,
  tvl24hrBefore,
  tvlChange,
  fee24,
}) {
  if (!chainId) throw new Error("chainId can't be null or empty");

  return {
    // id,
    chainId,
    timestamp,
    volumeValue,
    volume24hrBefore,
    volumeChange,
    volumeToday,
    tvlValue,
    tvl24hrBefore,
    tvlChange,
    fee24,
  };
}