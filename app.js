import 'babel-polyfill'
import React from 'react'
import {render, findDOMNode} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGL from 'deck.gl/react';
import {ScatterplotLayer} from 'deck.gl';
import {csv, timeParse, range, scaleTime, select, timeFormat, axisBottom} from 'd3'
const formatter = timeParse('%Y-%m-%d')
const altFormatter = timeParse('%Y%m%d')
const timeDisplay = timeFormat('%b %Y')

let currentSeries = 1
let hasStarted = false
let lastDayInLatestDownloadSeries
const MAX_SERIES = 5
const LAST_DAY = formatter('1975-05-15')
const COLOR = [255,0,0,200]
const RADIUS = 120
const bombData = {}
const SLOW_DOWN = 2

const ACCESS = 'pk.eyJ1IjoibWFya21hcmtvaCIsImEiOiJjaW84eGIyazgwMzJydzFrcTJkdXF4bHZ4In0.-g3eoOGOlbfUBYe9qDH6bw'

class Map extends React.Component {
  state = {
    currentSeries: 1,
    hasStarted: false,
    viewport: {
      latitude: 16.35,
      longitude: 107.31669,
      zoom: 6.340440,
      bearing: -90.55991,
      pitch: 65,
      mapboxApiAccessToken: ACCESS
    },
    width: window.outerWidth,
    height: window.outerHeight,
    locations: [
      {position: [107,14], radius: RADIUS, color: COLOR},
      {position: [107.1,14.5], radius: RADIUS, color: COLOR},
      {position: [106,13], radius: RADIUS, color: COLOR}
    ]
  }

  componentDidMount () {
    this.download(this.state.currentSeries)

    // setTimeout(() => setInterval(() => {
    //   this.setState({
    //     viewport: {
    //       ...this.state.viewport,
    //       pitch: this.state.viewport.pitch + .025,
    //       bearing: Math.max(this.state.viewport.bearing + .01, -70)
    //     }
    //   })
    // }, 50 * SLOW_DOWN), 4000)
  }

  start = (date) => {
    this.interval = setInterval(() => {
      const key = date.toString().split(' 00:00:00')[0]
      const bombs = bombData[key]
      if (bombs) {
        this.setState({
          date,
          locations: bombs.map(b => {
            return {position: [b.lng, b.lat], radius: RADIUS, color: COLOR}
          })
        })
      } else {
        console.log('no bomb data', date)
      }
      const keysLeft = Object.keys(bombData).length
      if (date <= LAST_DAY) {
        const inAdvance = new Date(date)
        inAdvance.setDate(date.getDate() + 91)
        if (inAdvance.toDateString() == lastDayInLatestDownloadSeries && currentSeries <= MAX_SERIES) {
          console.log('Needs more data')
          this.download()
        }
        date = addDays(date)
      } else {
        clearInterval(this.interval)
        console.log('show is over')
      }
    }, 50 * SLOW_DOWN)
  }

  download  = () => {
    const { hasStarted, currentSeries } = this.state
    csv(`/thor/thor_series_${currentSeries}.csv`, row => {
      return {
        date: row['MSNDATE'].indexOf('-') > -1 ? formatter(row['MSNDATE']) : altFormatter(row['MSNDATE']),
        lat: parseFloat(row['TGTLATDD_DDD_WGS84']),
        lng: parseFloat(row['TGTLONDDD_DDD_WGS84']),
        weapon: row['WEAPONTYPE'] || null,
        service: row['MILSERVICE'],
        mission: row['MFUNC_DESC'] || null,
        craft: row['VALID_AIRCRAFT_ROOT']
      }
    }, (err, entries) => {
      console.timeEnd('Get file')
      this.setState({
        currentSeries: currentSeries + 1
      })
      console.log('Error', err)
      console.log('Entries', entries[0])
      console.log('Entries', entries[1])
      console.log('Entries', entries[entries.length - 5])
      const [firstEntry, lastEntry] = process(entries)
      lastDayInLatestDownloadSeries = lastEntry.date.toString().split(' 00:00:00')[0]
      if (!hasStarted) {
        this.start(firstEntry.date)
        this.setState({
          hasStarted: true
        })
      }
    })
  }

  render() {
    const {viewport, width, locations, date, height} = this.state

    const bombs = new ScatterplotLayer({
      id: 'bombs',
    //  drawOutline: true,
      strokeWidth: 15,
      data: locations // Some flight points
    });

    return (
      <div>
        <Timeline date={date} width={width} />
        <MapGL
          {...viewport}
        //mapStyle="mapbox://styles/mapbox/dark-v9"
          mapStyle="mapbox://styles/markmarkoh/ciw9qzdyc000a2pmr5up1ckna"
          onChangeViewport={v => this.setState({viewport: v})}
          preventStyleDiffing={false}
          mapboxApiAccessToken={ACCESS}
          perspectiveEnabled
          width={width}
          height={height}>
          <DeckGL
            {...viewport}
            width={width}
            height={height}
            layers={[bombs]}
             />
        </MapGL>
      </div>

    )
  }
}

class Timeline extends React.Component {
  constructor (props) {
    super(props)
    this.timeScale = scaleTime()
      .domain([new Date(1965, 9, 1), new Date(1975, 5, 15)])
      .range([0, props.width])
  }

  render () {
    const {date, width} = this.props
    return (
      <svg className='timeline' width={width} height={50}>
        {range(1, 116, 5).map(n => {
          return (
            <g key={n}>
              {(n === 1 || n === 111 || n % 4 === 0) && <text className={n === 1 ? 'first' : 'other'} x={(width / 116) * n} y={20}>{timeDisplay(this.timeScale.invert((width / 116) * n))}</text>}
              <rect x={(width / 116) * n} y={25} width={1} height={10}></rect>
            </g>
          )
        })}
        <rect className='marker' height={35} width={5} y={0} x={this.timeScale(date) || 0}></rect>
      </svg>
    )
  }
}

console.time('Get file')

const seenTypes = {}
function process (entries) {
  console.time('Transpose bombs')
  entries.reduce((acc, bomb) => {
    const key = bomb.date.toString().split(' 00:00:00')[0]
    acc[key] = acc[key] || [];
    acc[key].push(bomb);
    if (!seenTypes[bomb.mission]) {
      seenTypes[bomb.mission] = 1
    } else seenTypes[bomb.mission] += 1
    return acc;
  }, bombData);
  console.timeEnd('Transpose bombs')
  console.log('seen types', seenTypes)
  return [entries[0], entries[entries.length -1]]
}

function addDays(date, days = 1) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    result.setHours(0)
    return result;
}


const root = document.createElement('div');
document.body.appendChild(root);

render(<Map />, root);
console.log('rendered')
