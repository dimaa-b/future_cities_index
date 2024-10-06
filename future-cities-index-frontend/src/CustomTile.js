import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

function CustomTileLayer() {
  useEffect(() => {
    // Define a custom tile layer
    const tileLayer = new L.TileLayer(
      "https://api.lightboxre.com/v1/census/us/tracts/tile/{z}/{x}/{y}",
      {
        attribution: '&copy; LightBox RE',
        tileSize: 256,
        zoomOffset: 0,
        maxZoom: 18
      }
    );

    // Intercept the requests and add the API key to the headers
    tileLayer.createTile = function (coords, done) {
      const url = this.getTileUrl(coords);
      const tile = document.createElement('img');

      fetch(url, {
        headers: {
          'x-api-key': 'ybSJwuppzNOIWrOPUpw7QlRlGAWGhsG9' // Add the API key to the header
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.blob();
        })
        .then(blob => {
          const objectURL = URL.createObjectURL(blob);
          tile.src = objectURL;
          done(null, tile);
        })
        .catch(err => {
          console.error('Error fetching the tile:', err);
          done(err, tile);
        });

      return tile;
    };

    // Adding this layer to the map
    const map = L.map('map').setView([51.505, -0.09], 13); // Example coordinates
    tileLayer.addTo(map);
  }, []);

  return <div id="map" style={{ height: "100vh", width: "100%" }}></div>;
}

// function MapWithCustomTileLayer() {
//   return (
//     <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100vh", width: "100%" }}>
//       <CustomTileLayer />
//     </MapContainer>
//   );
// }

export default CustomTileLayer;
