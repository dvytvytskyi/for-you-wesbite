const axios = require('axios');

const API_Base = 'https://admin.foryou-realestate.com/api';
const API_KEY = 'fyr_7084daf35cf6427f60e06bccd675f133b8a19ce4866cf941156bb4f38fba4016';
const API_SECRET = '2e9e9a3a8080f207cf1c684baaeff40dcd4404c10f4d2207340bb48ee8ccdccda3f4e2fde5bd74fa4d8f463e361c45c9437206a97abb772415263e3a69655a73';

async function checkCoordinates(page) {
    try {
        console.log(`Fetching page ${page}...`);
        const response = await axios.get(`${API_Base}/properties`, {
            params: {
                propertyType: 'off-plan',
                limit: 100,
                page: page
            },
            headers: {
                'X-Api-Key': API_KEY,
                'X-Api-Secret': API_SECRET
            }
        });

        const body = response.data;
        let properties = [];

        if (body.data && body.data.properties) {
            properties = body.data.properties;
        } else if (body.data && Array.isArray(body.data.data)) {
            properties = body.data.data;
        } else if (Array.isArray(body)) {
            properties = body;
        } else if (body.properties) {
            properties = body.properties;
        }

        let validCount = 0;
        let zeroCount = 0;
        let nullCount = 0;

        const checkProp = (p) => {
            const lat = p.latitude;
            const lng = p.longitude;

            if (lat === null || lng === null || lat === undefined || lng === undefined) {
                nullCount++;
                return false;
            }

            const latNum = parseFloat(lat);
            const lngNum = parseFloat(lng);

            if (isNaN(latNum) || isNaN(lngNum) || (latNum === 0 && lngNum === 0)) {
                zeroCount++;
                return false;
            }

            if (lngNum < 50 || lngNum > 60 || latNum < 20 || latNum > 30) {
                return false;
            }

            validCount++;
            return true;
        };

        properties.forEach(checkProp);

        console.log(`Batch Page ${page} (${properties.length} items):`);
        console.log(`- Valid coordinates: ${validCount}`);
        console.log(`- Null/Undefined: ${nullCount}`);
        console.log(`- Zero/NaN: ${zeroCount}`);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function run() {
    await checkCoordinates(1);
    await checkCoordinates(10);
    await checkCoordinates(20);
    await checkCoordinates(30);
}

run();
