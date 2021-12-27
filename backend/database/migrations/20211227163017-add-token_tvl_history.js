exports.up = async (db, dataType) => {
  await db.createTable('pool_tvl_history', {
    id: {
      type: dataType.integer,
      primaryKey: true,
      autoIncrement: true,
    },
    chainId: dataType.text,
    contract: dataType.text,
    timestamp: dataType.integer,
    tvl: dataType.text,
  });
}

exports.down = async (db, dataType) => {
  await db.dropTable('pool_tvl_history');
}
