const fs = require('fs');
const path = require('path');

// Read the areas-store.ts file
const filePath = path.join(__dirname, '../src/store/areas-store.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Extract the defaultCities array
const match = content.match(/const defaultCities.*?=\s*(\[[\s\S]*?\n\];)/);

if (!match) {
    console.error('Could not find defaultCities in the file');
    process.exit(1);
}

// Remove TypeScript types and convert to valid JSON
let dataStr = match[1];

// Replace single quotes with double quotes
dataStr = dataStr.replace(/'/g, '"');

// Remove trailing commas before closing brackets
dataStr = dataStr.replace(/,(\s*[\]}])/g, '$1');

// Try to parse as JSON
try {
    const data = JSON.parse(dataStr);
    
    // Write to JSON file
    fs.writeFileSync(
        path.join(__dirname, 'areas-data.json'),
        JSON.stringify(data, null, 2),
        'utf8'
    );
    
    console.log('✅ Successfully extracted areas data');
    console.log(`   - Cities: ${data.length}`);
    console.log(`   - Total regions: ${data.reduce((sum, city) => sum + city.regions.length, 0)}`);
    
} catch (error) {
    console.error('❌ Failed to parse data:', error.message);
    // Write the problematic data for debugging
    fs.writeFileSync(
        path.join(__dirname, 'debug-data.txt'),
        dataStr,
        'utf8'
    );
    console.log('Debug data written to debug-data.txt');
}
