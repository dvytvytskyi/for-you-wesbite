const axios = require('axios');
const fs = require('fs');

const API_BASE = 'https://admin.foryou-realestate.com/api';
const API_KEY = 'fyr_7084daf35cf6427f60e06bccd675f133b8a19ce4866cf941156bb4f38fba4016';
const API_SECRET = '2e9e9a3a8080f207cf1c684baaeff40dcd4404c10f4d2207340bb48ee8ccdccda3f4e2fde5bd74fa4d8f463e361c45c9437206a97abb772415263e3a69655a73';

const CYRILLIC_REGEX = /[а-яёіїєґ']*[а-яёіїєґ]+[а-яёіїєґ']*/gi;
const UKRAINIAN_UNIQUE_CHAR = /[ііїєґ]/i;
const RUSSIAN_UNIQUE_CHAR = /[ыэёъ]/i;
const COMMON_UK_ONLY = new Set(['та', 'як', 'що', 'або', 'буде', 'це', 'для', 'від', 'до', 'за', 'наш']);

function isUkrainian(word) {
    if (!word) return false;
    word = word.toLowerCase();
    if (UKRAINIAN_UNIQUE_CHAR.test(word)) return true;
    if (RUSSIAN_UNIQUE_CHAR.test(word)) return false;
    if (COMMON_UK_ONLY.has(word)) return true;
    return false;
}

function findUkrainianIn(obj, path = '') {
    let results = [];
    if (!obj) return results;

    if (typeof obj === 'string') {
        const matches = obj.match(CYRILLIC_REGEX);
        if (matches) {
            const ukWords = matches.filter(word => isUkrainian(word));
            if (ukWords.length > 0) {
                results.push({ path, value: obj, ukWords });
            }
        }
    } else if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
            results = results.concat(findUkrainianIn(item, `${path}[${index}]`));
        });
    } else if (typeof obj === 'object') {
        // Skip descriptions as requested
        for (const key in obj) {
            if (key.toLowerCase().includes('description')) continue;
            results = results.concat(findUkrainianIn(obj[key], `${path}.${key}`));
        }
    }
    return results;
}

async function scanApi() {
    console.log('--- Scanning API Data ---');
    try {
        const endpoints = [
            '/public/properties',
            '/public/areas',
            '/public/developers',
            '/public/facilities'
        ];

        const allUkData = {};

        for (const endpoint of endpoints) {
            console.log(`Fetching from: ${endpoint}...`);
            const response = await axios.get(`${API_BASE}${endpoint}`, {
                headers: {
                    'x-api-key': API_KEY,
                    'x-api-secret': API_SECRET
                }
            });

            const data = response.data.data;
            const findings = findUkrainianIn(data, endpoint);
            if (findings.length > 0) {
                allUkData[endpoint] = findings;
                console.log(`  Found ${findings.length} occurrences in ${endpoint}`);
            }
        }

        const reportPath = 'api_ukrainian_words_report.json';
        fs.writeFileSync(reportPath, JSON.stringify(allUkData, null, 2));
        console.log(`\nScan complete. Results saved to ${reportPath}`);

    } catch (error) {
        console.error('Error during API scan:', error.message);
    }
}

scanApi();
