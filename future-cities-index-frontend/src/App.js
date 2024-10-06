
import { MapContainer, TileLayer } from "react-leaflet";
import './App.css';
import 'leaflet/dist/leaflet.css';

import { useEffect } from 'react';
import L from 'leaflet';

function CustomTileLayer({ urlTemplate, apiKey, attribution }) {
  useEffect(() => {
    const tileLayer = new L.TileLayer(urlTemplate, {
      attribution: attribution,
      tileSize: 256,
      zoomOffset: 0,
      maxZoom: 18,
    });

    tileLayer.createTile = function (coords, done) {
      const url = this.getTileUrl(coords);
      const tile = document.createElement('img');

      // Fetch the tile image with the API key in the headers
      fetch(url, {
        headers: {
          'apiKey': apiKey,  // Add the API key to the request header
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.blob();
        })
        .then((blob) => {
          const objectURL = URL.createObjectURL(blob);
          tile.src = objectURL;
          done(null, tile);
        })
        .catch((err) => {
          console.error('Error fetching the tile:', err);
          done(err, tile);
        });

      return tile;
    };

    const map = L.map('map').setView([51.505, -0.09], 13);  // Example coordinates
    tileLayer.addTo(map);
  }, [urlTemplate, apiKey, attribution]);

  return null;
}


function App() {
  const position = [51.505, -0.09];
  const mapStyle = { height: "100vh" };
  const apiKey = "ybSJwuppzNOIWrOPUpw7QlRlGAWGhsG9";

  return (
    <div className="App">
      <MapContainer center={position} zoom={2} style={mapStyle}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <TileLayer
          attribution='&copy; LightBox RE'
          url="http://localhost:3000/v1/census/us/tracts/tile/{z}/{x}/{y}"
        />
      </MapContainer>
    </div>
  );
}

export default App;
