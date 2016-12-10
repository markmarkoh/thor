import Papa from 'papaparse'
import Stats from 'stats.js'
import mapboxgl from 'mapbox-gl'



let count = 0;
let bombs = []
Papa.SCRIPT_PATH = '/papaparse.min.js'
Papa.parse('https://s3.amazonaws.com/thor-data-files/thor_series_1.csv', {
	//worker: true,
  download: true,
  dynamicTyping: true,
  header: true,
	step: function(row) {
		count += 1
    bombs.push(row.data)
	},
	complete: function() {
		console.log("All done!");
	}
});

// window.setInterval(() => {
//   count++
// }, 50)

window.setTimeout(() => {
  var stats = new Stats();
  stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild( stats.dom );


const el = document.getElementById('count')
function animate() {

    stats.begin();
    el.innerText = count
    // monitored code goes here

    stats.end();

    requestAnimationFrame( animate );

}

requestAnimationFrame( animate );

}, 500)

mapboxgl.accessToken = 'pk.eyJ1IjoibWFya21hcmtvaCIsImEiOiJjaW84eGIyazgwMzJydzFrcTJkdXF4bHZ4In0.-g3eoOGOlbfUBYe9qDH6bw'
const map = new mapboxgl.Map({
    container: 'map',
    latitude: 16.35,
    longitude: 107.31669,
    center: [107.3166, 16.35],
    zoom: 6.340440,
    bearing: -90.55991,
    pitch: 65,
    style: 'mapbox://styles/mapbox/streets-v9'
});


// function pointOnCircle(angle, radius = 20) {
//     const newB = bombs.slice(0)
//     bombs = []
//     return {
//         "type": "Point",
//         "coordinates": bombs.map(b => {
//           return [b['TGTLATDD_DDD_WGS84'], b['TGTLONDDD_DDD_WGS84']]
//         }
//     };
// }

function points () {
  const newB = bombs.slice(0)
  bombs = []
  if (newB.length === 0) return null
  const yea = {
            "type": "FeatureCollection",
            "features": newB.map(b => {
               return {
                 "type": "Feature",
                 "geometry": {
                   "type": "Point",
                   "coordinates": [ b['TGTLONDDD_DDD_WGS84'], b['TGTLATDD_DDD_WGS84']]
                 }
             }
          })
        }
  console.log(yea)
  return yea
}

map.on('load', function () {
    // Add a source and layer displaying a point which will be animated in a circle.
    map.addSource('point', {
        "type": "geojson",
        "data": points(0)
    });

    map.addLayer({
        "id": "point",
        "source": "point",
        "type": "circle",
        "paint": {
            "circle-radius": 10,
            "circle-color": "#007cbf"
        }
    });

    function animateMarker(timestamp) {
        // Update the data to a new position based on the animation timestamp. The
        // divisor in the expression `timestamp / 1000` controls the animation speed.
        const newPoints = points()
        if ( newPoints ) {
          map.getSource('point').setData(newPoints)

        }

        // Request the next frame of the animation.
        requestAnimationFrame(animateMarker);
    }

    // Start the animation.
    animateMarker(0);
});
