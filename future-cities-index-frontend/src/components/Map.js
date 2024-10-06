import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, GeoJSON, useMap, useMapEvents } from "react-leaflet";
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

const SearchBarControl = ({ onSearch }) => {
    const [searchInput, setSearchInput] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchInput) {
            onSearch(searchInput);
        }
    };

    return (
        <div className="search-bar-control">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search location..."
                />
            </form>
        </div>
    );
};

export default function MapComponent() {
    const [loading, setLoading] = useState(false);
    const [clickedPosition, setClickedPosition] = useState([0, 0]);
    const [clickedPositionData, setClickedPositionData] = useState(null);
    const [showCensusLayer, setShowCensusLayer] = useState(true);
    const [showFloodLayer, setShowFloodLayer] = useState(true);

    const initPosition = [37.0902, -95.7129];

    useEffect(() => {
        if (clickedPosition[0] === 0 && clickedPosition[1] === 0) {
            return;
        }

        const wkt = `POINT(${clickedPosition[1]} ${clickedPosition[0]})`;

        const fetchCensusData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/census/us/tracts/geometry?wkt=${encodeURIComponent(wkt)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch census data');
                }
                const data = await response.json();
                if (!data.censusTracts || data.censusTracts.length === 0) {
                    throw new Error('No census tracts data found');
                }

                setLoading(false);

                const tract = data.censusTracts[0];
                const updatedData = {
                    tractCode: tract.tractCode,
                    censusName: tract.name,
                    featureClass: tract.featureClass,
                    geoId: tract.geoid,
                    wtkOutline: tract.location.geometry.wkt,
                    geoJson: { ...wktToGeoJSON(tract.location.geometry.wkt) },
                    futureCitiesIndex: null
                };

                setClickedPositionData(updatedData);
                await fetchFutureCitiesIndex(updatedData.geoId);
            } catch (error) {
                console.error('Error fetching census data:', error.message);
                setClickedPositionData(prevData => ({
                    ...prevData,
                    geoJson: null
                }));
                setLoading(false);
            }
        };

        const fetchFutureCitiesIndex = async (geoId) => {
            try {
                const response = await fetch(`http://localhost:3000/future-cities-index/${geoId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch future cities index');
                }
                const data = await response.json();

                setClickedPositionData(prevData => ({
                    ...prevData,
                    futureCitiesIndex: data
                }));
            } catch (error) {
                console.error('Error fetching future cities index:', error.message);
            }
        };

        fetchCensusData();
    }, [clickedPosition]);

    const handleMapClick = (e) => {
        setLoading(true);
        const { lat, lng } = e.latlng;
        setClickedPosition([lat, lng]);
    };

    const handleCensusLayerToggle = () => setShowCensusLayer(!showCensusLayer);
    const handleFloodLayerToggle = () => setShowFloodLayer(!showFloodLayer);
    const handleSearch = (query) => {
        console.log("Searching for:", query);
    };

    return (
        <>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">
                        Loading...
                    </div>
                </div>
            )}
            <MapContainer center={initPosition} zoom={4.5} maxBounds={[[24.396308, -125.0], [49.384358, -66.93457]]} className="leaflet-container" style={{ width: clickedPositionData ? '70%' : '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <SearchBarControl onSearch={handleSearch} />

                {showCensusLayer && (
                    <TileLayer
                        attribution='&copy; LightBox RE'
                        url="http://localhost:3000/v1/census/us/tracts/tile/{z}/{x}/{y}"
                    />
                )}
                {showFloodLayer && (
                    <TileLayer
                        attribution='&copy; LightBox RE'
                        url="http://localhost:3000/v1/nfhls/us/tile/{z}/{x}/{y}"
                    />
                )}

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

const ZoomToGeoJson = ({ geoJson }) => {
    const map = useMap();

    useEffect(() => {
        if (geoJson) {
            const bounds = getGeoJsonBounds(geoJson);
            map.fitBounds(bounds);
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