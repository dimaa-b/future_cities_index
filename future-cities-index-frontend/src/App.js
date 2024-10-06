
import { MapContainer, TileLayer } from "react-leaflet";
import './App.css';
import 'leaflet/dist/leaflet.css';

function App() {
  const position = [37.0902, -95.7129];
  const mapStyle = { height: "100vh" };

  return (
    <div className="App">
      <MapContainer center={position} zoom={4.5} style={mapStyle} maxBounds={[[24.396308, -125.0], [49.384358, -66.93457]]}>
      <TileLayer
        attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
