import * as L from 'leaflet'
import d3 from 'd3'
import d3overlay from './d3overlay'
console.log('l is', L)

d3overlay(L)
const map = new L.Map('main', {dragging: false, zoomControl: false}).setView([14.25, 103.58], 6);
const tiles = 'https://b.tiles.mapbox.com/v4/mapbox.b0v97egc/{z}/{x}/{y}.png?access_token='
const access = 'pk.eyJ1IjoibWFya21hcmtvaCIsImEiOiJjaW84eGIyazgwMzJydzFrcTJkdXF4bHZ4In0.-g3eoOGOlbfUBYe9qDH6bw'
const altTiles = 'https://api.mapbox.com/styles/v1/markmarkoh/ciw9qzdyc000a2pmr5up1ckna/tiles/256/{z}/{x}/{y}@2x?access_token='

L.tileLayer(`${altTiles}${access}`, {
}).addTo(map);

var d3Overlay = L.d3SvgOverlay(function(selection, projection){
	const dataset = [
		{
			latLng: [14.25, 102.58]
		},
		{
			latLng: [13.35, 103.58]
		},
		{
			latLng: [14.25, 103.18]
		}
	]
	var updateSelection = selection.selectAll('.bomb').data(dataset);
	updateSelection.enter()
	  .append('circle')
	    .attr("class", "bomb")
			.attr("cx", function(d) { console.log('cx...', d); return projection.latLngToLayerPoint(d.latLng).x })
			.attr("cy", function(d) { return projection.latLngToLayerPoint(d.latLng).y })
			.attr("r", 10)

});

d3Overlay.addTo(map);

console.log(L)
