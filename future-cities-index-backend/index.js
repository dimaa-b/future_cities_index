const express = require('express');
const axios = require('axios');
const app = express();
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




app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
});
