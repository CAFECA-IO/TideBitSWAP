const BlockTimestampDao = require('./BlockTimestampDao');
const PoolDao = require('./PoolDao');
const PoolPriceDao = require('./PoolPriceDao');
const TokenDao = require('./TokenDao');
const TokenPriceDao = require('./TokenPriceDao');
const TransactionHistoryDao = require('./TransactionHistoryDao');
const CryptoRateToUsdDao = require('./CryptoRateToUsdDao');
const OverviewHistoryDao = require('./OverviewHistoryDao');
const PoolDetailHistoryDao = require('./PoolDetailHistoryDao');
const TokenDetailHistoryDao = require('./TokenDetailHistoryDao');
const MigrationsDao = require('./MigrationsDao');

module.exports = {
  BlockTimestampDao, PoolDao, PoolPriceDao,
  TokenDao, TokenPriceDao, TransactionHistoryDao,
  CryptoRateToUsdDao, OverviewHistoryDao, PoolDetailHistoryDao,
  TokenDetailHistoryDao, MigrationsDao,
}