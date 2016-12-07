require("babel-core/register");
require("babel-polyfill");
import {csv, timeParse} from 'd3'
import crossfilter from 'crossfilter2'
const formatter = timeParse('%Y-%m-%d')
const altFormatter = timeParse('%Y%m%d')

let currentSeries = 1
let hasStarted = false
let lastDayInLatestDownloadSeries
const MAX_SERIES = 5
const LAST_DAY = formatter('1975-05-15')
//const LAST_DAY = formatter('1965-11-15')
const bombData = {}

console.time('Get file')

function download () {
  csv(`/thor/thor_series_${currentSeries++}.csv`, row => {
    return {
      date: row['MSNDATE'].indexOf('-') > -1 ? formatter(row['MSNDATE']) : altFormatter(row['MSNDATE']),
      lat: parseFloat(row['TGTLATDD_DDD_WGS84']),
      lng: parseFloat(row['TGTLONDDD_DDD_WGS84']),
      weapon: row['WEAPONTYPE'] || null,
      service: row['MILSERVICE'],
      mission: row['FUNC_DESC'] || null,
      craft: row['VALID_AIRCRAFT_ROOT']
    }
  }, (err, entries) => {
    console.timeEnd('Get file')
    console.log('Error', err)
    console.log('Entries', entries[0])
    console.log('Entries', entries[1])
    console.log('Entries', entries[entries.length - 5])
    const [firstEntry, lastEntry] = process(entries)
    lastDayInLatestDownloadSeries = lastEntry.date.toString().split(' 00:00:00')[0]
    if (!hasStarted) {
      start(firstEntry.date)
      hasStarted = true
    }
  })
}

download()

// function* bomb (entries) {
//   let index = 0;
//   while(index < entries.length) {
//     yield entries[index++]
//   }
// }
/*
FUNC_DESC
MILSERVICE
MSNDATE
TGTLATDD_DDD_WGS84
TGTLONDDD_DDD_WGS84
TGTTYPE
VALID_AIRCRAFT_ROOT
WEAPONTYPE
*/

function start (date) {
  const main = document.getElementById('main')

  const interval = setInterval(() => {
    const key = date.toString().split(' 00:00:00')[0]
    const bombs = bombData[key]
    if (bombs) {
      main.innerHTML = `
        <h2>${date}</h2>
        <ul>${bombs.slice(0,5).map(b => `<li>${b.craft} at ${b.lat},${b.lng}</li>`)}</ul>`
    } else {
      console.log('no bomb data', date)
    }
    const keysLeft = Object.keys(bombData).length
    if (date <= LAST_DAY) {
      const inAdvance = new Date(date)
      inAdvance.setDate(date.getDate() + 91)
      if (inAdvance.toDateString() == lastDayInLatestDownloadSeries && currentSeries <= MAX_SERIES) {
        console.log('Needs more data')
        download()
      }
      console.log('Upping the day', date)
      date = addDays(date)
    } else {
      clearInterval(interval)
      console.log('show is over')
    }
    delete bombData[key]
  }, 50)
}

function process (entries) {
  // console.time('Starting crossfilter')
  // const cf = crossfilter(entries)
  // console.timeEnd('Starting crossfilter')
  // console.time('Creating dimension')
  // const byDate = cf.dimension(b => b.date)
  // console.timeEnd('Creating dimension')
  // console.time('Grouping by date')
  // const groupByDate = byDate.group()
  // console.log('Groups', groupByDate.size())
  // console.timeEnd('Grouping by date')
  // console.log('On this day', date)
  // console.log(byDate.filter(date))

  console.time('Transpose bombs')
  entries.reduce((acc, bomb) => {
    const key = bomb.date.toString().split(' 00:00:00')[0]
    acc[key] = acc[key] || [];
    acc[key].push(bomb);
    return acc;
  }, bombData);
  console.timeEnd('Transpose bombs')

  return [entries[0], entries[entries.length -1]]
}

function addDays(date, days = 1) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    result.setHours(0)
    return result;
}
