const axios = require('axios');

const API_BASE = 'https://admin.foryou-realestate.com/api';
const API_KEY = 'fyr_7084daf35cf6427f60e06bccd675f133b8a19ce4866cf941156bb4f38fba4016';
const API_SECRET = '2e9e9a3a8080f207cf1c684baaeff40dcd4404c10f4d2207340bb48ee8ccdccda3f4e2fde5bd74fa4d8f463e361c45c9437206a97abb772415263e3a69655a73';
const PROPERTY_ID = 'property-75005de3';

async function fetchProperty() {
  try {
    const response = await axios.get(`${API_BASE}/public/properties/${PROPERTY_ID}`, {
      headers: {
        'x-api-key': API_KEY,
        'x-api-secret': API_SECRET,
        'Content-Type': 'application/json'
      }
    });

    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error fetching property:', error.response ? error.response.data : error.message);
    
    // Fallback to summary
    try {
      console.log('--- Falling back to summary ---');
      const response = await axios.get(`${API_BASE}/public/properties/${PROPERTY_ID}/summary`, {
        headers: {
          'x-api-key': API_KEY,
          'x-api-secret': API_SECRET,
          'Content-Type': 'application/json'
        }
      });
      console.log(JSON.stringify(response.data, null, 2));
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError.response ? fallbackError.response.data : fallbackError.message);
    }
  }
}

fetchProperty();
