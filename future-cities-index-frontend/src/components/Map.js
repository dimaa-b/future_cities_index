import { useState, useEffect } from "react";
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";


export default function MapComponent() {
    const [clickedPosition, setClickedPosition] = useState([0, 0]);
    const [clickedPositionData, setClickedPositionData] = useState(null);

    const initPosition = [37.0902, -95.7129];
    const mapStyle = { height: "100vh" };

    useEffect(() => {
        const wkt = `POINT(${clickedPosition[1]} ${clickedPosition[0]})`; // WKT format uses "lng lat" (long-lat order)
        fetch(`http://localhost:3000/census/us/tracts/geometry?wkt=${encodeURIComponent(wkt)}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                // Handle the data returned from the API
                // console.log('Census Tract Data:', data.censusTracts[0].tractCode);
                setClickedPositionData(data.censusTracts[0].tractCode);
            })
    }, [clickedPosition]);

    const handleMapClick = (e) => {
        const { lat, lng } = e.latlng;
        setClickedPosition([lat, lng]);

        // Construct WKT point format
        const wkt = `POINT(${lng} ${lat})`; // WKT format uses "lng lat" (long-lat order);
    };

    return (
        <MapContainer center={initPosition} zoom={4.5} style={mapStyle} maxBounds={[[24.396308, -125.0], [49.384358, -66.93457]]}>
            <TileLayer
                attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <TileLayer
                attribution='&copy; LightBox RE'
                url="http://localhost:3000/v1/census/us/tracts/tile/{z}/{x}/{y}"
            />
            <MapEventsHandler handleMapClick={handleMapClick} />

            <Marker position={clickedPosition}>
                <Popup>
                    {clickedPositionData ? `Census Tract: ${clickedPositionData}` : 'Click on the map to get Census Tract data'}
                </Popup>
            </Marker>
        </MapContainer>
    );
}

const MapEventsHandler = ({ handleMapClick }) => {
    useMapEvents({
        click: (e) => handleMapClick(e),
    });
    return null;
};