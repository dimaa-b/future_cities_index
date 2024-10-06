const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors({
    origin: 'http://localhost:3001' 
}));
const PORT = process.env.PORT || 3000;

// Replace this with your actual Lightbox API key
const API_KEY = 'ybSJwuppzNOIWrOPUpw7QlRlGAWGhsG9';

// Route for Lightbox API proxy
app.get('/v1/census/us/tracts/tile/:z/:x/:y', async (req, res) => {
    const { z, x, y } = req.params;

    // Build the API URL using the parameters
    const apiUrl = `https://api.lightboxre.com/v1/census/us/tracts/tile/${z}/${x}/${y}`;

    try {
        // Make the request to the Lightbox API
        const response = await axios.get(apiUrl, {
            headers: {
                'x-api-key': `${API_KEY}`
            },
            responseType: 'stream'
        });

        // Set the correct content type for the image
        res.setHeader('Content-Type', response.headers['content-type']);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

        // Pipe the response data to the client
        response.data.pipe(res);
    } catch (error) {
        console.error('Error fetching data from Lightbox API:', error.message);

        // Handle errors
        res.status(error.response ? error.response.status : 500).json({
            message: 'Error fetching data from Lightbox API',
            error: error.message
        });
    }
});

app.get('/census/us/tracts/geometry', async (req, res) => {
    const { wkt } = req.query;


    // Build the API URL using the parameters
    // const apiUrl = `https://api.lightboxre.com/v1/census/us/tracts/geometry?wkt=${wkt}`;
    const apiUrl = `https://api.lightboxre.com/v1/census/us/tracts/geometry?wkt=${encodeURIComponent(wkt)}`;
    try {
        // Make the request to the Lightbox API
        const response = await axios.get(apiUrl, {
            headers: {
                'x-api-key': `${API_KEY}`
            }
        });

        // copy headers from response to res
        Object.keys(response.headers).forEach(key => {
            res.setHeader(key, response.headers[key]);
        });
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        // Return the response data
        res.json(response.data);


        return response.data;
    } catch (error) {
        console.error('Error fetching data from Lightbox API:', error.message);

        // Handle errors
        res.status(error.response ? error.response.status : 500).json({
            message: 'Error fetching data from Lightbox API',
            error: error.message
        });
    }
});

//gets FEMA risk index data
app.get('/v1/riskindexes/us/:tractId', async (req, res) => {
    const { tractId } = req.params;

    const apiUrl = `https://api.lightboxre.com/v1/riskindexes/us/${tractId}`;

    try {
        // Make the request to the Lightbox API
        const response = await axios.get(apiUrl, {
            headers: {
                'x-api-key': `${API_KEY}`
            }
        });

        console.log('Social Vulnerability County Score: ' + response.data.nris[0].socialVulnerability.countyScore);
        console.log('Community Resilience County Score: ' + response.data.nris[0].communityResilience.countyScore);
        res.json(response.data);


    } catch (error) {
        console.error('Error fetching data from Lightbox API:', error.message);

        // Handle errors
        res.status(error.response ? error.response.status : 500).json({
            message: 'Error fetching data from Lightbox API',
            error: error.message
        });
    }
});

app.get('/mapper/risk/tract/:tractId', async (req, res) => {
    const { tractId } = req.params; // Correctly extract tractId from request parameters

    // Build the API URL dynamically using the tractId
    const apiUrl = `https://ejscreen.epa.gov/mapper/ejscreenRESTbroker1.aspx?namestr=${tractId}&geometry=&distance=&unit=9035&areatype=tract&areaid=${tractId}&f=json`;

    try {
        const response = await axios.get(apiUrl);

        // Log and send back the data from the API
        console.log('Estimated Flood Risk in 30 Years: ' + response.data.data.extras.RAW_CI_FLOOD30);
        console.log('Estimated Fire Risk in 30 Years: ' + response.data.data.extras.RAW_CI_FIRE30);
        console.log('Hazardous Waste Proximity:     ' + response.data.data.main.RAW_E_TSDF);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from EPA EJscreeen API:', error.message);

        // Handle errors
        res.status(error.response ? error.response.status : 500).json({
            message: 'Error fetching data from EPA EJscreeen API',
            error: error.message
        });
    }
});

async function getFutureCitiesIndex(tractId) {
    try {
        // Build the API URL dynamically for the EJscreeen API
        const ejscreenApiUrl = `https://ejscreen.epa.gov/mapper/ejscreenRESTbroker1.aspx?namestr=${tractId}&geometry=&distance=&unit=9035&areatype=tract&areaid=${tractId}&f=json`;
        
        // Make the request to the EJscreeen API
        const ejscreenResponse = await axios.get(ejscreenApiUrl);
        
        // Extract the relevant values for the Future Cities Index
        const floodRiskStr = ejscreenResponse.data.data.extras.RAW_CI_FLOOD30;
        const fireRiskStr = ejscreenResponse.data.data.extras.RAW_CI_FIRE30;
        const hazardousWasteProximity = ejscreenResponse.data.data.main.RAW_E_TSDF;

        // Convert floodRisk and fireRisk from strings to numbers
        const floodRisk = parseFloat(floodRiskStr) / 100; // Convert to decimal
        const fireRisk = parseFloat(fireRiskStr) / 100;   // Convert to decimal


        // Build the API URL dynamically for the Lightbox API
        const riskIndexApiUrl = `https://api.lightboxre.com/v1/riskindexes/us/T${tractId}`;
        
        // Make the request to the Lightbox API
        const riskIndexResponse = await axios.get(riskIndexApiUrl, {
            headers: {
                'x-api-key': `${API_KEY}`
            }
        });

        // Extract the social vulnerability and community resilience scores
        const socialVulnerabilityScore = riskIndexResponse.data.nris[0].socialVulnerability.countyScore;
        const communityResilienceScore = riskIndexResponse.data.nris[0].communityResilience.countyScore;

        // Calculate the Future Cities Index (modify the formula as needed)
        const futureCitiesIndex = (
            ((socialVulnerabilityScore + communityResilienceScore) *
            (1 - floodRisk) *
            (1 - fireRisk) *
            ((100 - hazardousWasteProximity) / 100))
        ).toFixed(2);
        

        // Return the Future Cities Index and other relevant data
        return {
            futureCitiesIndex,
            floodRisk,
            fireRisk,
            hazardousWasteProximity,
            socialVulnerabilityScore,
            communityResilienceScore
        };
    } catch (error) {
        console.error('Error fetching data for Future Cities Index:', error.message);
        throw new Error('Failed to calculate Future Cities Index');
    }
}
app.get('/future-cities-index/:tractId', async (req, res) => {
    console.log('works')
    const { tractId } = req.params;

    try {
        const indexData = await getFutureCitiesIndex(tractId);
        
        // Return the Future Cities Index data
        res.json(indexData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
