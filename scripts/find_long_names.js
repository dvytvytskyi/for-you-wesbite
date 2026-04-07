const axios = require('axios');
const fs = require('fs');

const API_BASE = 'https://admin.foryou-realestate.com/api';
const API_KEY = 'fyr_7084daf35cf6427f60e06bccd675f133b8a19ce4866cf941156bb4f38fba4016';
const API_SECRET = '2e9e9a3a8080f207cf1c684baaeff40dcd4404c10f4d2207340bb48ee8ccdccda3f4e2fde5bd74fa4d8f463e361c45c9437206a97abb772415263e3a69655a73';

async function fetchAllOffPlan() {
  let allProperties = [];
  let page = 1;
  const limit = 50; 
  let total = 0;

  console.log('Fetching off-plan properties (spoofing UA)...');

  try {
    do {
      const response = await axios.get(`${API_BASE}/public/properties`, {
        params: {
          propertyType: 'off-plan',
          page: page,
          limit: limit
        },
        headers: {
          'x-api-key': API_KEY,
          'x-api-secret': API_SECRET,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      const resData = response.data;
      const properties = resData.data?.data || resData.data?.properties || resData.data || [];
      allProperties = allProperties.concat(properties);
      
      total = resData.data?.total || resData.data?.pagination?.total || resData.meta?.total || allProperties.length;
      
      console.log(`Fetched page ${page}, total so far: ${allProperties.length} / ${total}`);
      page++;

      if (properties.length === 0 || allProperties.length >= total) break;
      await new Promise(resolve => setTimeout(resolve, 500));
    } while (page <= 100);

    const longNamedProjects = allProperties
      .filter(p => (p.name && p.name.length > 50) || (p.nameEn && p.nameEn.length > 50))
      .map(p => ({
        id: p.id,
        name: p.name || p.nameEn,
        name_length: (p.name || p.nameEn).length,
        slug: p.slug
      }));

    const resultFile = 'long_named_projects.json';
    fs.writeFileSync(resultFile, JSON.stringify(longNamedProjects, null, 2));
    console.log(`Successfully found ${longNamedProjects.length} projects with names > 50 chars.`);
    
  } catch (error) {
    if (error.response) {
       console.error(`Error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    } else {
       console.error('Error:', error.message);
    }
  }
}

fetchAllOffPlan();
