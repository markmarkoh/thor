require("babel-core/register");
require("babel-polyfill");
import {csv, timeParse} from 'd3'
import crossfilter from 'crossfilter2'
const formatter = timeParse('%Y-%m-%d')
const altFormatter = timeParse('%Y%m%d')

const currentSeries = 1
const MAX_SERIES = 5
const bombData = {}
const hasStarted = false

console.time('Get file')
csv(`/thor/thor_series_${currentSeries}.csv`, row => {
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
  start(entries)
})

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
function start (entries) {

  //const bombGen = bomb(entries)
  const main = document.getElementById('main')
  let date = entries[0].date

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

  console.time('Different group')
  entries.reduce((acc, bomb) => {
    const key = bomb.date.toString().split(' 00:00:00')[0]
    acc[key] = acc[key] || [];
    acc[key].push(bomb);
    return acc;
  }, bombData);
  console.log(bombData)
  console.timeEnd('Different group')
  console.log('First day', bombData[date])
  const interval = setInterval(() => {
    const key = date.toString().split(' 00:00:00')[0]
    const bombs = bombData[key]
    if (bombs) {
      main.innerHTML = `
        <h2>${date}</h2>
        <ul>${bombs.map(b => `<li>${b.craft} at ${b.lat},${b.lng}</li>`)}</ul>`
    }
    if (Object.keys(bombData).length > 1) {
      console.log('Upping the day', date)
      date = addDays(date)
      console.log('Upped', date)
    } else {
      clearInterval(interval)
      console.log('show is over')
    }
    delete bombData[key]
  }, 250)


}

function addDays(date, days = 1) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    result.setHours(0)
    return result;
}
