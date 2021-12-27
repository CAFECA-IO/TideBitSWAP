exports.up = async (db, dataType) => {
  await db.renameColumn('overviewHistory', 'todayVolume', 'volumeToday');
  await db.renameColumn('pool_detail_history', 'todayVolume', 'volumeToday');
  await db.renameColumn('token_detail_history', 'todayVolume', 'volumeToday');
}
