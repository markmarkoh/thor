// load the h3 json
fetch('hexed.json')
    .then(r => r.json())
    .then(data => {
        // create a hex layer
        const hexLayer = new deck.H3HexagonLayer({
            id: 'h3-hex',
            data: data,
            pickable: false,
            coverage: 0.9,
            elevationScale: 50,
            extruded: true,
            opacity: 0.3,
            getHexagon: d => d.hex,
            getElevation: d => d.count,
            getFillColor: d => [255, (1 - d.count / 500) * 255, 0]
        });
        map.setProps({
            layers: [hexLayer]
        })
    })

// create map
const map = new deck.DeckGL({
    mapboxApiAccessToken: 'pk.eyJ1IjoidGhvci1tYXJrIiwiYSI6ImNrY3IzbnpxMzBnc3QyeXBkZmFicHhhNXQifQ.levs2UY_u0y9PcCLKJIpsA',
    mapStyle: 'mapbox://styles/mapbox/outdoors-v11',
    initialViewState: {
        longitude: 106.65,
        latitude: 11.8,
        zoom: 6.5,
        pitch:60 
    },
    controller: true
})

