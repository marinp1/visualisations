const xpath = require('xpath');
const xmldom = require('xmldom');
const moment = require('moment');

module.exports.parseWeatherObservations = function(data) {

  const select = xpath.useNamespaces({
    'wfs': 'http://www.opengis.net/wfs/2.0',
    'gml': 'http://www.opengis.net/gml/3.2',
    'BsWfs': 'http://xml.fmi.fi/schema/wfs/2.0'
  });

  const averages = [];
  const highs = [];
  const lows = [];

  let missingDataPoints = 0;

  const doc = new xmldom.DOMParser().parseFromString(data)
  const elems = select('//BsWfs:BsWfsElement', doc)

  for (const elem of elems) {
    const param_time = select('./BsWfs:Time/text()', elem)[0].nodeValue
    const monthName = moment.utc(param_time).format('MMMM')

    function addTopMap(arr, key, value) {
      if (value === 'NaN') {
        missingDataPoints += 1;
      }
      arr.push({month: key, val: Number(value)})
    }

    const param_name = select('./BsWfs:ParameterName/text()', elem)[0].nodeValue.replace(',','.')
    const param_value = select('./BsWfs:ParameterValue/text()', elem)[0].nodeValue.replace(',','.')

    // Only add observations at the start of the day (data for previous day)
    if (moment.utc(param_time).format('HH:mm:ss') === '00:00:00') {
      if (param_name == 'tday') {
        addTopMap(averages, monthName, param_value)
      } else if (param_name == 'tmax') {
        addTopMap(highs, monthName, param_value)
      } else if (param_name == 'tmin') {
        addTopMap(lows, monthName, param_value)
      }
    }
  }

  function mapToData(arr, name, color) {
    return {
      name,
      y: arr.map(_ => _.val),
      x: arr.map(_ => _.month),
      marker: {color},
      type: 'box',
    }
  }

  if (averages.length === 0) {
    throw new Error('No data found!');
  }

  const averageData = mapToData(averages, 'avg', '#2CDA9D');
  const highData = mapToData(highs, 'high', '#C1292E');
  const lowData = mapToData(lows, 'low', '#33658A');

  const graphData = [averageData, highData, lowData];

  return {
    graphData,
    missingDataPoints,
  };
}
