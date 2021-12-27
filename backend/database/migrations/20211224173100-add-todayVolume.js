exports.up = async (db, dataType) => {
  await db.addColumn('overviewHistory', 'todayVolume', dataType.text);
  await db.addColumn('pool_detail_history', 'todayVolume', dataType.text);
  await db.addColumn('token_detail_history', 'todayVolume', dataType.text);
}
