const Utils = require('../libs/Utils');
const Model = require('./model.js');

class ModelFactory {
  static create({ struct }) {
    return Promise.resolve(new Model());
  }
  static find({ struct, condition }) {
    return Promise.resolve(new Model());
  }
  static save({ model }) {
    return Promise.resolve(true);
  }
}

module.exports = ModelFactory;