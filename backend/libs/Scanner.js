const ecrequest = require('ecrequest');
const path = require('path');

const Bot = require(path.resolve(__dirname, 'Bot.js'));
const Utils = require(path.resolve(__dirname, 'Utils.js'));

// scan pairs
// scan event
// read pair data

class Scanner extends Bot {

  start() {
    console.log('GO! Scanner GO!')
  }
}

module.exports = Scanner;