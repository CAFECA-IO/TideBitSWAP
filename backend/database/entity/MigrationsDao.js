module.exports = function({
  file_name,
  run_on = Date.now(),
}) {
  if (!file_name) throw new Error("file_name can't be null or empty");

  return {
    file_name,
    run_on,
  };
}