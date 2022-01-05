exports.up = async (db, dataType) => {
  await db.createTable('stake', {
    id: {
      type: dataType.text,
      primaryKey: true,
    },
    chainId: dataType.text,
    contract: dataType.text,
    factoryContract: dataType.text,
    factoryIndex: dataType.integer,
    rewardToken: dataType.text,
    stakedToken: dataType.text,
    rewardPerBlock: dataType.text,
    totalStaked: dataType.text,
    hasUserLimit: dataType.text,
    poolLimitPerUser: dataType.text,
    APY: dataType.text,
    start: dataType.text,
    end: dataType.text,
    projectSite: dataType.text,
  });
}

exports.down = async (db, dataType) => {
  await db.dropTable('stake');
}
