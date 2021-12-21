const {dataType} = require('db-migrate');

exports.up = async (db) => {
  try {
    await db.addColumn('overviewHistory', 'volumeToday', dataType.TEXT);
  } catch (error) {
    console.log(error);
  }
  try {
    await db.addColumn('token_detail_history', 'volumeToday', dataType.TEXT);
  } catch (error) {
    console.log(error);
  }
  try {
    await db.addColumn('pool_detail_history', 'volumeToday', dataType.TEXT);
  } catch (error) {
    console.log(error);
  }
};

exports.down = async (db) => {
  await db.removeColumn('overviewHistory', 'volumeToday');
  await db.removeColumn('token_detail_history', 'volumeToday');
  await db.removeColumn('pool_detail_history', 'volumeToday');
};
