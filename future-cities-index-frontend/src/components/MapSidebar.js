import { useState } from "react";
import './Map.css';

export default function MapSidebar({ clickedPositionData }) {
    const [isCensusVisible, setCensusVisible] = useState(false);
    const [isFutureCitiesIndexVisible, setFutureCitiesIndexVisible] = useState(false);

    // Toggle function to show or hide the dropdown
    const toggleCensus = () => {
        setCensusVisible(!isCensusVisible);
    };
    const toggleFutureCitiesIndex = () => {
        setFutureCitiesIndexVisible(!isFutureCitiesIndexVisible);
    };

    return (
        <>
            {clickedPositionData && clickedPositionData.geoJson && (
                <div className="sidebar">
                    <h1>Census Information</h1>
                    <div className="census">
                        <button className="dropbtn" onClick={toggleCensus}>Census Information</button>
                        {isCensusVisible && (
                            <div className="dropdown-content" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                <p><strong>Census Name:</strong> {clickedPositionData.censusName}</p>
                                <p><strong>GeoID:</strong> {clickedPositionData.geoId}</p>
                                <p><strong>Tract Code:</strong> {clickedPositionData.tractCode}</p>
                                <p><strong>Feature Class:</strong> {clickedPositionData.featureClass}</p>
                            </div>)}
                    </div>
                    <div>
                        <button className="dropbtn" onClick={toggleFutureCitiesIndex}>Future Cities</button>
                        {isFutureCitiesIndexVisible && (
                            <div className="dropdown-content" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                <p><strong style={{ color: 'red' }} >Future Cities Index:</strong> {clickedPositionData.futureCitiesIndex ? clickedPositionData.futureCitiesIndex.futureCitiesIndex : "Could not be found."}</p>
                                <p><strong>Flood Risk:</strong> {clickedPositionData.futureCitiesIndex ? clickedPositionData.futureCitiesIndex.floodRisk : "N/A"}</p>
                                <p><strong>Fire Risk:</strong> {clickedPositionData.futureCitiesIndex ? clickedPositionData.futureCitiesIndex.fireRisk : "N/A"}</p>
                                <p><strong>Hazardous Waste Proximity:</strong> {clickedPositionData.futureCitiesIndex ? clickedPositionData.futureCitiesIndex.hazardousWasteProximity : "N/A"}</p>
                                <p><strong>Social Vulnerability Score:</strong> {clickedPositionData.futureCitiesIndex ? clickedPositionData.futureCitiesIndex.socialVulnerabilityScore : "N/A"}</p>
                                <p><strong>Community Resilience Score:</strong> {clickedPositionData.futureCitiesIndex ? clickedPositionData.futureCitiesIndex.communityResilienceScore : "N/A"}</p>
                            </div>)}
                    </div>
                </div>
            )}
        </>
    );
};
