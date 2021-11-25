const path = require('path');
const dvalue = require('dvalue');
const smartContract = require('../libs/smartContract');
const Utils = require('../libs/Utils');

const Bot = require(path.resolve(__dirname, 'Bot.js'));
const eceth = require(path.resolve(__dirname, '../libs/eceth.js'));
const ResponseFormat = require(path.resolve(__dirname, '../libs/ResponseFormat'));

class Explorer extends Bot {
  _tidebitSwap = '0x3753A62D7654b072Aa379866391e4a10000Dcc53';  // TideBit Swap

  constructor() {
    super();
    this.name = 'Explorer';
  }

  async start() {
    return super.start()
      .then(() => this);
  }

  async getCandleStickData() {
    return new ResponseFormat({
      message: 'get CandleStickData',
      payload: this._getDummyCandleStickData(Utils.randomCandleStickData()),
    });
  }

  async getFixedDirectionData({ params = {} }) {
    const { startTime = new Date(2021, 9, 15), endTime = new Date() } = params;
    return new ResponseFormat({
      message: 'get FixedDirectionData',
      payload: Utils.randomFixedDirectionData(startTime, endTime),
    })
  }

  async getVolume24hr({ params = {} }) {
    const { startTime = new Date(2021, 9, 15), endTime = new Date() } = params;
    return new ResponseFormat({
      message: 'get Volume 24hr',
      payload: Utils.randomData(startTime, endTime),
    });
  }

  _getDummyCandleStickData(data) {
    return {
      series: [
        {
          data: data ? data : [],
        },
      ],
      options: {
        chart: {
          type: "candlestick",
          height: 350,
          toolbar: {
            show: false,
          },
        },
        xaxis: {
          type: "datetime",
        },
        yaxis: {
          tooltip: {
            enabled: true,
          },
        },
      },
    };
  }
}

module.exports = Explorer;