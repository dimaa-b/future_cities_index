import { useState, useEffect } from "react";
import { MapContainer, TileLayer, useMapEvents, Marker, useMap, GeoJSON } from "react-leaflet";
import MapSidebar from './MapSidebar';
import L from 'leaflet';
import wkt from 'terraformer-wkt-parser';
import "leaflet/dist/leaflet.css";
import './Map.css';

// Function to convert WKT polygon to GeoJSON
function wktToGeoJSON(wktString) {
    const geometry = wkt.parse(wktString);
    return geometry;
}
// Function to get bounds from GeoJSON object
function getGeoJsonBounds(geoJson) {
    const coordinates = geoJson.coordinates.flat(Infinity); // Flatten the coordinates array
    const latlngs = [];
    for (let i = 0; i < coordinates.length; i += 2) {
        latlngs.push([coordinates[i + 1], coordinates[i]]); // GeoJSON uses [lng, lat] format
    }
    return L.latLngBounds(latlngs);
}

export default function MapComponent() {
    const [loading, setLoading] = useState(false);
    const [clickedPosition, setClickedPosition] = useState([0, 0]);
    const [clickedPositionData, setClickedPositionData] = useState(null);

    const initPosition = [37.0902, -95.7129];;

    useEffect(() => {
        if (clickedPosition[0] === 0 && clickedPosition[1] === 0) {
            return;
        }
        const wkt = `POINT(${clickedPosition[1]} ${clickedPosition[0]})`; // WKT format uses "lng lat" (long-lat order)
        fetch(`http://localhost:3000/census/us/tracts/geometry?wkt=${encodeURIComponent(wkt)}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setClickedPositionData({
                    tractCode: data.censusTracts[0].tractCode,
                    censusName: data.censusTracts[0].name,
                    featureClass: data.censusTracts[0].featureClass,
                    geoId: data.censusTracts[0].geoid,
                    wtkOutline: data.censusTracts[0].location.geometry.wkt,
                    // process the wkt data to geojson, ensure new object
                    geoJson: { ...wktToGeoJSON(data.censusTracts[0].location.geometry.wkt) },
                    futureCitiesIndex: null
                });


                fetch(`http://localhost:3000/future-cities-index/${clickedPositionData.geoId}`)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then((data) => {
                        setClickedPositionData(prevData => ({
                            ...prevData,
                            futureCitiesIndex: data
                        }));
                    }).catch((error) => {
                        // Handle errors
                        console.error('Error fetching data from Lightbox API:', error.message);
                    });
            }).catch((error) => {
                // Handle errors
                setClickedPositionData(prevData => ({
                    ...prevData,
                    geoJson: null
                }));
            });
    }, [clickedPosition]);

    const handleMapClick = (e) => {
        const { lat, lng } = e.latlng;
        setClickedPosition([lat, lng]);

        // Construct WKT point format
        const wkt = `POINT(${lng} ${lat})`; // WKT format uses "lng lat" (long-lat order);
    };

    return (
        <>
            <MapContainer center={initPosition} zoom={4.5} maxBounds={[[24.396308, -125.0], [49.384358, -66.93457]]} className="leaflet-container" style={{ width: clickedPositionData ? '70%' : '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <TileLayer
                    attribution='&copy; LightBox RE'
                    url="http://localhost:3000/v1/census/us/tracts/tile/{z}/{x}/{y}"
                />

                <MapEventsHandler handleMapClick={handleMapClick} />
                {clickedPositionData && clickedPositionData.geoJson &&
                    <ZoomToGeoJson geoJson={clickedPositionData.geoJson} />}
                <Marker position={clickedPosition} />
                {clickedPositionData && clickedPositionData.geoJson &&
                    <GeoJSON data={clickedPositionData.geoJson} key={JSON.stringify(clickedPositionData.geoJson)} />}
            </MapContainer>

            <MapSidebar clickedPositionData={clickedPositionData} />
        </>
    );
}
// Zoom to GeoJSON component
const ZoomToGeoJson = ({ geoJson }) => {
    const map = useMap();

    useEffect(() => {
        if (geoJson) {
            const bounds = getGeoJsonBounds(geoJson);
            map.fitBounds(bounds); // Zoom the map to fit the GeoJSON bounds
        }
    }, [geoJson, map]);

    return null;
};

const MapEventsHandler = ({ handleMapClick }) => {
    useMapEvents({
        click: (e) => handleMapClick(e),
    });
    return null;
};