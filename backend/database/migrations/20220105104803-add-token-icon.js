exports.up = async (db, dataType) => {
  await db.addColumn('token', 'icon', dataType.text);
}

exports.down = async (db, dataType) => {
}
