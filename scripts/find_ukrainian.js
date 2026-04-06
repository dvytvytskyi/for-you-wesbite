const fs = require('fs');
const path = require('path');

const EXCLUDE_DIRS = ['node_modules', '.next', '.git', 'public', 'lib'];
const INCLUDE_EXTS = ['.tsx', '.ts', '.js', '.jsx', '.json', '.css'];

// Ukrainian and shared Cyrillic characters
const CYRILLIC_REGEX = /[а-яёіїєґ']*[а-яёіїєґ]+[а-яёіїєґ']*/gi;

// Ukrainian specific markers (characters or common words)
const UKRAINIAN_UNIQUE_CHAR = /[ііїєґ]/i;
const RUSSIAN_UNIQUE_CHAR = /[ыэёъ]/i;

const COMMON_UK_ONLY = new Set(['та', 'як', 'що', 'або', 'буде', 'це', 'для', 'від', 'до', 'за', 'наш']);

function isUkrainian(word) {
    word = word.toLowerCase();
    
    // If it has Ukrainian unique characters, it's definitely Ukrainian
    if (UKRAINIAN_UNIQUE_CHAR.test(word)) return true;
    
    // If it has Russian unique characters, it's definitely Russian
    if (RUSSIAN_UNIQUE_CHAR.test(word)) return false;

    // Check against common Ukrainian words that use shared characters
    if (COMMON_UK_ONLY.has(word)) return true;

    // If it's a very short word shared by both (e.g., "на", "в", "з"), it's ambiguous.
    // For the purpose of finding "all Ukrainian words", we might want to flag them if they appear near definitely Ukrainian words.
    
    return false;
}

function findUkrainianInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const results = [];

    lines.forEach((line, index) => {
        const matches = line.match(CYRILLIC_REGEX);
        if (matches) {
            const ukWords = matches.filter(word => isUkrainian(word));
            if (ukWords.length > 0) {
                results.push({
                    line: index + 1,
                    words: ukWords,
                    content: line.trim()
                });
            }
        }
    });

    return results;
}

function walk(dir, callback) {
    fs.readdirSync(dir).forEach( f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            if (!EXCLUDE_DIRS.includes(f)) {
                walk(dirPath, callback);
            }
        } else {
            if (INCLUDE_EXTS.includes(path.extname(f))) {
                callback(dirPath);
            }
        }
    });
}

const allResults = {};
const uniqueUkWords = new Set();

walk(process.cwd(), (filePath) => {
    const fileResults = findUkrainianInFile(filePath);
    if (fileResults.length > 0) {
        const relativePath = path.relative(process.cwd(), filePath);
        allResults[relativePath] = fileResults;
        fileResults.forEach(res => {
            res.words.forEach(w => uniqueUkWords.add(w.toLowerCase()));
        });
    }
});

// Output results to console
console.log('--- Ukrainian Words Found ---');
for (const [file, results] of Object.entries(allResults)) {
    console.log(`\nFile: ${file}`);
    results.forEach(res => {
        console.log(`  Line ${res.line}: [${res.words.join(', ')}] -> "${res.content}"`);
    });
}

console.log('\n--- Unique Ukrainian Words Summary ---');
console.log(Array.from(uniqueUkWords).sort().join(', '));
console.log(`\nTotal unique Ukrainian words: ${uniqueUkWords.size}`);

// Save to file for the user
const reportPath = path.join(process.cwd(), 'ukrainian_words_report.json');
fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
        totalUniqueWords: uniqueUkWords.size,
        uniqueWords: Array.from(uniqueUkWords).sort()
    },
    details: allResults
}, null, 2));

console.log(`\nDetailed report saved to: ${reportPath}`);
