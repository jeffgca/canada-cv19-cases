const _ = require('lodash');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
var stringify = require('csv-stringify');

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
  //
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
  let dataRows = $(rows).slice(2, rows.length);
  let dataTableArr = [];

  dataRows.each((i, row) => {
    let _r = toArr($(row).children());

    let _cells = _r.map((cell) => {
      let _t = $(cell).text().trim();
      return _t || "n\\a";
    });
    dataTableArr[i] = _.zipObject(COLS, _.slice(_cells, 0, (_cells.length-1)));
  });
  // we chop 6 rows off the end of the array because there are footer rows on WP
  callback(null, _.slice(dataTableArr, 0, (dataTableArr.length - 6)));
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
