const _ = require('lodash');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const stringify = require('csv-stringify');
const parse = require('date-fns/parse');
const toDate = require('date-fns/toDate');
const format = require('date-fns/format');

function checkStatus(res) {
	if (res.ok) {
		return res;
	} else {
		throw MyCustomError(res.statusText);
	}
}

const WIKI_URL = 'https://en.m.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Canada';

const COLS = [
  "Date", // The date
  "BC", // British Columbia
  "AB", // Alberta
  "SK", // Sasketchewan
  "MB", // Manitoba
  "ON", // Ontario
  "QC", // Quebec
  "NB", // New Brunswick
  "PE", // Prince Edward Island
  "NS", // Nova Scotia
  "NL", // New Brunswick
  "YT", // Yukon Territory
  "NT", // Northwest Territories
  "NU", // Nunavut
  "RT", // returning travellers
  "confirmed_new", // new confirmed cases
  "confirmed_cml", // total confirmed cases
  "deaths_new", // new deaths reported
  "deaths_cml", // cumulative cases reported
  "recovered_new", // new cases confirmed recovered
  "recovered_cml" // cumulative recoverd cases
];

function getCaData(callback) {
  // TODO - cache results, check if the data is actually new somehow?
  fetch(WIKI_URL)
  	.then(res => res.text())
  	.then((body) => {
      callback(false, body);
    });
}

function toArr(list) {
  return [].slice.call(list);
}

function parseCaTable($, table, callback) {
  let rows = $(table).find('tr');
  let dataRows = $(rows).slice(2, (rows.length-6));
  let dataTableArr = [];

  dataRows.each((i, row) => {
    let _r = toArr($(row).children());
    let _cells = _r.map((cell, ii) => {
      let _t = $(cell).text().trim();
      if (ii === 0) {
        // the date column.
        let _parsed = parse(_t, 'MMM d', new Date(2020, 0, 1));
        let _d = toDate(_parsed);
        // 2019-12-31
        // console.log(_t, _d);
        _t = format(_d, 'Y-LL-dd');
      } else {
        // make sure it's an int instead oif like 409[n 3]
        _t = parseInt(_t) || 0;
      }
      return _t || 0;
    });
    dataTableArr[i] = _.zipObject(COLS, _.slice(_cells, 0, (_cells.length-1)));
  });
  // we chop 6 rows off the end of the array because there are footer rows on WP
  callback(null, _.slice(dataTableArr, 0, dataTableArr.length));
}

module.exports.fetchData = getCaData;

// if you just run the script, it spits the csv string out to STDOUT
if (require.main === module) {
  getCaData((err, bodyText) => {
    if (err) throw err;
    let $ = cheerio.load(bodyText);

    let table = $('table.wikitable')
      .filter((i, el) => {
        return !$(el).hasClass('sortable');
      }).get(0);

    parseCaTable($, table, (err, result) => {
      if (err) throw err;
      stringify(result, {
        header: true,
        columns: COLS
      },
      (err, result) => {
        if (err) throw err;
        console.log(result);
      });
    });

  });
}
