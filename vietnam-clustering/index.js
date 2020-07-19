// load the h3 json
fetch('hexed.json')
    .then(r => r.json())
    .then(data => {
        // create a hex layer
        function layer() {
            return new deck.H3HexagonLayer({
                id: 'h3-hex',
                data: data,
                pickable: false,
                elevationScale: 50,
                extruded: true,
                opacity: 0.3,
                getHexagon: d => d.hex,
                getElevation: d => d.count,
                getFillColor: d => [255, (1 - d.count / 500) * 255, 0]
            });
        }

        function textLayer() {
            return new deck.TextLayer({
                id: 'text-layer',
                data: [{
                    title: 'Targeted bombing coords\nby US forces\nfrom 1963 to 1968'
                }],
                getPosition: d => [108.5, 9.3],
                getText: d => d.title,
                getSize: 50,
                getAngle: 0
            })
        }
        map.setProps({
            layers: [layer()]
        })
    })

// create map
const map = new deck.DeckGL({
    mapboxApiAccessToken: 'pk.eyJ1IjoidGhvci1tYXJrIiwiYSI6ImNrY3IzbnpxMzBnc3QyeXBkZmFicHhhNXQifQ.levs2UY_u0y9PcCLKJIpsA',
    mapStyle: 'mapbox://styles/thor-mark/ckcs2f18w1fk41imj7dphkl04',
    initialViewState: {
        longitude: 106.65,
        latitude: 11.8,
        zoom: 6.5,
        pitch:60 
    },
    controller: true
})

