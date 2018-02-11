const express = require('express');
const fetch = require('isomorphic-fetch');
const moment = require('moment');

require('dotenv').config();

const FMI_API_KEY = process.env.FMI_API_KEY;
if (!FMI_API_KEY) {
  throw new Error('FMI API KEY NOT SET!');
}

const app = express();
const port = process.env.PORT || 5000;

const parser = require("./parser.js");

async function getFMIObservations(startTime, endTime, location) {
  // Move api key to environment variable
  const SERVER_URL = `http://data.fmi.fi/fmi-apikey/${FMI_API_KEY}/wfs`;
  const STORED_QUERY_OBSERVATION = "fmi::observations::weather::daily::simple";
  const URL_PART_1 = `${SERVER_URL}?request=getFeature&storedquery_id=${STORED_QUERY_OBSERVATION}`;
  const URL_PART_2 = `&place=${location}&starttime=${startTime}&endtime=${endTime}`;
  const URL = `${URL_PART_1}${URL_PART_2}`;
  const response = await fetch(URL);
  if (response.status === 200) {
    const text = await response.text();
    return parser.parseWeatherObservations(text);
  }
  throw new Error(response.statusText)
}

// Check cache
app.get('/api/observations', (req, res) => {

  // Check input server side
  const rawStartDate = req.query.startDate;
  const rawEndDate = req.query.endDate;
  const rawPlace = req.query.place;

  const startTime = moment(rawStartDate).startOf('day').toISOString();
  const endTime = moment(rawEndDate).endOf('day').toISOString();

  getFMIObservations(startTime, endTime, rawPlace)
    .then(data => {
      res.status(200).send({ data })
    })
    .catch(e => {
      // Perhaps send some information with the error?
      res.sendStatus(404);
    })

});


app.listen(port, () => console.log(`Listening on port ${port}`));
