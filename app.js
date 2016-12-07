import 'babel-polyfill'
import React from 'react'
import {render} from 'react-dom';
import * as Immutable from 'immutable'
console.log('starting this thing')
import MapGL, {ScatterplotOverlay} from 'react-map-gl';

const ACCESS = 'pk.eyJ1IjoibWFya21hcmtvaCIsImEiOiJjaW84eGIyazgwMzJydzFrcTJkdXF4bHZ4In0.-g3eoOGOlbfUBYe9qDH6bw'
class Map extends React.Component {
  state = {
    viewport: {
      latitude: 13.25,
      longitude: 106.41669,
      zoom: 6.140440,
      //bearing: -50.55991,
    //  pitch: 70,
      mapboxApiAccessToken: ACCESS
    },
    width: 1500,
    height: 1000,
    locations: new Immutable.fromJS([
      [107,14]
    ])
  }

  addLocation = () => {
    this.setState({
      locations: this.state.locations.push(new Immutable.List([107 + (Math.random() * 5), 14 + (Math.random() * 5)]))
    })
  }

  render() {
    setInterval(this.addLocation, 500)
		const {viewport, width, locations, height} = this.state
    return (
      <div>
        <h1>hi there</h1>
        <MapGL
					{...viewport}
					width={width}
					height={height}
        >
        <ScatterplotOverlay
          {...viewport}
          height={height}
          width={width}
          locations={locations}
          isDragging={false}
          dotRadius={4}
          globalOpacity={1}
          compositeOperation="screen" />
        </MapGL>
      </div>
    )
  }
}

const root = document.createElement('div');
document.body.appendChild(root);

render(<Map />, root);
console.log('rendered')
