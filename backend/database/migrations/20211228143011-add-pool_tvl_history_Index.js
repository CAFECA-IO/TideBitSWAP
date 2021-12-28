exports.up = async (db, dataType) => {
  await db.addIndex('pool_tvl_history', ['chainId', 'contract', 'timestamp'], {
    name: 'idx_pool_tvl_history_chainId_contract_timestamp',
  });
}

exports.down = async (db, dataType) => {
  await db.dropIndex('idx_pool_tvl_history_chainId_contract_timestamp');
}
