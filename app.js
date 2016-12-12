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
import Stats from 'stats.js'

let currentSeries = 1
let hasStarted = false
let isDownloading = false
let lastDayInLatestDownloadSeries
const MAX_SERIES = 6
const LAST_DAY = formatter('1973-08-15')

const RADIUS = 150
const bombData = {}
window.missionTypes = {}
const SLOW_DOWN = 2
var stats = new Stats();

const COLORS = {
  combat: [202,0,32,255],
  support:[244,165,130,255],
  recon: [5,113,176,255],
  other: [255,255,255,200]
}


const CombatFields = [
  'ACTIVE AIR DEFENSE',
  'AIR INTERDICTION',
  'ARMED HELICOPTER',
  'ARMED RECCE',
  'ARTILLERY ADJUST',
  'BAS CMBT AIR PATROL',
  'CLOSE AIR SUPPORT',
  'DIRECT AIR SUPPORT',
  'DIR AIR SUPPT',
  'DEF CMBT AIR PATROL',
  'MIG CMBT AIR PATROL',
  'PSYCHOLOGIC WARFARE',
  'RES CMBT AIR PATROL',
  'SAR CMBT AIR PATROL',
  'SHIP_ CMBT AIR PATROL',
  'STRIKE',
  'TAR CMBT AIR PATROL'
]
const combatMission = new Set(CombatFields)

const Support = [
  'AIR REFUELING',
  'AIRLIFT',
  'AIRBORNE ALERT',
  'CASUALTY EVACUATION',
  'CBT CGO AIRLAND',
  'COMBT CARGO AIR DROP',
  'COMBT CARGO AIR LAND',
  'COMBT CARGO CARRYING',
  'COMBT TROOP CARRYING',
  'COMBT TROOP AIR DROP',
  'COMMAND/CONTROL',
  'ECCM',
  'ECM',
  'POSITIONING',
  'ESCORT/COVER',
  'EXTRACTION (GPES)',
  'EXTRACTION (PLADS)',
  'FLARE DROP',
  'FLAK SUPPRESSION',
  'FRIENDLY A/C DAM GND',
  'FRIENDLY A/C DES GND',
  'FRIENDLY A/C DES GND',
  'HELO ESCORT',
  'AEW',
  'LANDING ZONE CONST',
  'LANDING ZONE PREP',
  'LOG CARGO CARRYING',
  'PATH FINDER',
  'RADIO DIRECT FINDER',
  'SEARCH/RESCUE',
  'SMOKE SCREEN',
  'WEATHER EVACUATION'
]
const supportMission = new Set(Support)

const Recon = [
  'AERIAL MINING',
  'COMBAT OBSERVATION',
  'DEFOL/DEFOL SURVEY',
  'ECOMINT',
  'ELINT',
  'ESCORT-RECON',
  'FAC/TAC',
  'FLEET AREA RECCE',
  'HANDHELD PHOTO RECCE',
  'HYDRO ACCOUST RECCE',
  'INFRA-RED RECCE',
  'LATE-LIGHT RECCE',
  'MOTION PICTURE RECCE',
  'MOVIE RECON',
  'OPTICAL RECCE',
  'PHOTO RECCE',
  'RADAR RECCE',
  'RADIOMETER RECCE',
  'SLAR RECCE',
  'SPECTROMETER RECCE',
  'TELEMETRY RECCE',
  'TELEVISION RECCE',
  'TELLERLIGHT RECCE',
  'ULTRA-VIOLET RECCE',
  'VISUAL RECCE',
  'WEATHER RECCE'
]
const reconMission = new Set(Recon)

const NonWarFare = [
  'ADMINISTRATIVE',
  'AIR EVAC/NONTACTIC',
  'MAINTENANCE',
  'OTHER',
  'RADIO RELAY',
  'TRAINING'
]
const otherMission = new Set(NonWarFare)

//stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
//document.body.appendChild( stats.dom );
const ACCESS = 'pk.eyJ1IjoibWFya21hcmtvaCIsImEiOiJjaW84eGIyazgwMzJydzFrcTJkdXF4bHZ4In0.-g3eoOGOlbfUBYe9qDH6bw'

class Map extends React.Component {
  state = {
    currentSeries: 1,
    hasStarted: false,
    firstBomb: null,
    viewport: {
      latitude: 16.35,
      longitude: 107.31669,
      pitch: 0,
      bearing: -0.55991,
      zoom: 4.340440,
      mapboxApiAccessToken: ACCESS
    },
    width: window.outerWidth,
    height: window.outerHeight,
    locations: [
      {position: [107,14], radius: RADIUS, color: COLORS['other']},
      {position: [107.1,14.5], radius: RADIUS, color: COLORS['other']},
      {position: [106,13], radius: RADIUS, color: COLORS['other']}
    ]
  }

  componentDidMount () {
    this.download()
    // this.rotateInterval = setInterval(() => {
    //   this.setState({
    //     viewport: {
    //       ...this.state.viewport,
    //       pitch: Math.max(this.state.viewport.pitch + .025, 65),
    //       bearing: Math.max(this.state.viewport.bearing + 0.01, -90.55991),
    //       zoom: Math.max(this.state.viewport.zoom + 0.0004, 6.340440)
    //     }
    //   })
    // })
  }

  start = (first) => {
    //  date: row['MSNDATE'].indexOf('-') > -1 ? formatter(row['MSNDATE']) : altFormatter(row['MSNDATE']),
    this.setState({
      hasStarted: true
    })
    hasStarted = true

    this.zoomInterval = setInterval(() => {
      const {zoom, pitch, bearing} = this.state.viewport
      if (zoom === 6.30440 && pitch === 65 && bearing === -90.55991) {
        console.log('ending the zoom')
        clearInterval(this.zoomInterval)
        return
      }
      this.setState({
        viewport: {
          ...this.state.viewport,
          zoom: Math.min(this.state.viewport.zoom + 0.015, 6.30440),
          pitch: Math.min(this.state.viewport.pitch + 0.5, 65),
          bearing: Math.max(this.state.viewport.bearing - 0.735, -90.55991)
        }
      })
    })

    let key = first.key
    let date = altFormatter(key.slice(2))
    this.interval = setInterval(() => {
      //stats.begin()
      const bombs = bombData[key]
      if (bombs) {
        this.setState({
          date,
          locations: bombs.map(b => {
            return {position: b.p, radius: RADIUS, color: COLORS[b.cat]}
          })
        })
      } else {
        //console.log('no bomb data', key, date, Object.keys(bombData).length)
      }

      //bombData[key] = null
      delete bombData[key]

      if (date <= LAST_DAY) {
        if(isDownloading === false && Object.keys(bombData).length < 300 && currentSeries <= MAX_SERIES) {
          isDownloading = true
          window.setTimeout(() => this.download(), 10)
        }
        date = addDays(date)
        key = `d:${date.getFullYear()}${date.getMonth() < 10 ? '0' + date.getMonth(): date.getMonth()}${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`
      } else if (!bombData[key]) {
        return
      } else {
        console.log('show is over')
        clearInterval(this.interval)
        return
      }

    //  stats.end()

  }, 25)
  }

  download  = () => {
    const { currentSeries, hasStarted } = this.state
    isDownloading = true
    clearInterval(this.rotateInterval)
    csv(`https://d33bz6js14grvw.cloudfront.net/thor_series_${currentSeries}.csv.gz`, transform, (err, entries) => {
      isDownloading = false

      for (var i = 0; i < entries.length; i++) {
        const bomb = entries[i]
        if (bombData[bomb.key]) {
          bombData[bomb.key].push(bomb)
        } else {
          bombData[bomb.key] = [bomb]
        }
      }
      if (!hasStarted && this.state.currentSeries === 1) {
        console.log(entries[0])
        // this.setState({
        //   viewport: {
        //     ...this.state.viewport,
        //     pitch: 65,
        //     bearing: -90.55991,
        //     zoom: 6.340440
        //   }
        // })
        this.firstBomb = entries[0]
      }
      this.setState({
        currentSeries: currentSeries + 1
      }, () => {
        // if (this.state.currentSeries < 6) {
        //   this.download()
        // }
      })
    })

    function transform (row) {
      //dynamicTyping casts some dates in numbers (that lack a dash)
      if (!row['MSNDATE'].indexOf) row['MSNDATE'] = '' + row['MSNDATE']
      const mfuncDesc = row['MFUNC_DESC']

      let missionCategory
      if (combatMission.has(mfuncDesc)) {
        missionCategory = 'combat'
      } else if (supportMission.has(mfuncDesc)) {
        missionCategory = 'support'
      } else if (reconMission.has(mfuncDesc)) {
        missionCategory = 'recon'
      } else if (otherMission.has(mfuncDesc)) {
        missionCategory = 'other'
      } else {
        missionCategory = 'other'
        if (!missionTypes[mfuncDesc]) {
          missionTypes[mfuncDesc] = 1
        } else {
          missionTypes[mfuncDesc] += 1
        }
        //console.log('Unknown mission type', row['MFUNC_DESC'])
      }

      return {
          key: 'd:' + row['MSNDATE'].replace(/-/g, ''),
          p:[ parseFloat(row['TGTLONDDD_DDD_WGS84']), parseFloat(row['TGTLATDD_DDD_WGS84'])],
          //weapon: row['WEAPONTYPE'] || null,
          //service: row['MILSERVICE'],
          cat: missionCategory
          //mission: row['MFUNC_DESC'] || null,
          //craft: row['VALID_AIRCRAFT_ROOT']
        }
    }
  }

  render() {
    const {viewport, width, hasStarted, locations, date, height} = this.state

    const bombs = new ScatterplotLayer({
      id: 'bombs',
      data: locations
    })


    return (
      <div className={hasStarted ? 'started' : 'notstarted'}>
        {!hasStarted && <div className='overlay'>
          <div className='info'>
            <h1 className='header'>
              Vietnam War
            </h1>
            <h1>
              Theater History of Operations (THOR) Data
            </h1>
            <p className='lead'>
              Visualizing 2,912,532 air missions from 1965 to 1973 by the United States Military and their allies.<br/>
              A collaboration with data.mil, to explore the data further, go to <a href='#'>collabsite.com</a>.
            </p>
          </div>
          <div className='start'>
            <button title='Start' onClick={() => {
              this.start(this.firstBomb)
            }}>▶</button>
            <span className='help'>
              Press ▶ to begin.<br/>Modern browsers &amp;<br/> high speed internet recommended.
            </span>
          </div>
          <Legend />
        </div>}
        {hasStarted && <Timeline date={date} width={width} />}
        <MapGL
          {...viewport}
          // mapStyle="mapbox://styles/mapbox/dark-v9"
          //mapStyle="mapbox://styles/mapbox/satellite-streets-v10"
          mapStyle="mapbox://styles/markmarkoh/ciw9qzdyc000a2pmr5up1ckna"
          onChangeViewport={v => this.setState({viewport: v})}
          preventStyleDiffing={false}
          mapboxApiAccessToken={ACCESS}
          className='map'
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
        <Legend />
      </div>

    )
  }
}

class Timeline extends React.Component {
  constructor (props) {
    super(props)
    this.timeScale = scaleTime()
      .domain([new Date(1965, 9, 1), new Date(1973, 8, 15)])
      .range([0, props.width])
  }

  // don't update for every frame
  shouldComponentUpdate () {
    if (Math.random() < .5) return false
    return true
  }

  render () {
    const {date, width} = this.props
    return (
      <svg className='timeline' width={width} height={50}>
        {range(1, 116, 5).map(n => {
          return (
            (n === 1 || n === 111 || n % 4 === 0)
              ? (<g key={n}>
                <text className={n === 1 ? 'first' : 'other'} x={(width / 116) * n} y={20}>{timeDisplay(this.timeScale.invert((width / 116) * n))}</text>
                <rect x={(width / 116) * n} y={25} width={1} height={10}></rect>
              </g>)
              : (<g key={n}>
                <rect x={(width / 116) * n} y={15} width={1} height={20}></rect>
              </g>)
          )
        })}
        <rect className='marker' height={35} width={5} y={0} x={this.timeScale(date) || 0}></rect>
      </svg>
    )
  }
}

class Legend extends React.Component {
  shouldComponentUpdate () {
    return false
  }

  render () {
    return (
      <svg className='legend' width={500} height={200}>
        <g>
          <circle fill={`rgba(${COLORS['combat'].join(',')})`} cx={50} cy={50} r={10} />
          <text x={70} y={55}>Air combat, strikes, bombing, air interdiction</text>

          <circle fill={`rgba(${COLORS['support'].join(',')})`} cx={50} cy={85} r={10} />
          <text x={70} y={90}>Support missions, supply, troop evacs</text>

          <circle fill={`rgba(${COLORS['recon'].join(',')})`} cx={50} cy={120} r={10} />
          <text x={70} y={125}>Reconnaissance related missions</text>

          <circle fill={`rgba(${COLORS['other'].join(',')})`} cx={50} cy={155} r={10} />
          <text x={70} y={160}>Administrative, training, misc.</text>
        </g>
      </svg>
    )
  }
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
