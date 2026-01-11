const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
let content = fs.readFileSync(envPath, 'utf8');

// Replace standard postgres url ending or existing schema param
if (content.includes('utility_db')) {
    // Replace schema param if exists, or append if not
    if (content.match(/utility_db\?/)) {
        content = content.replace(/utility_db\?schema=[^"'\s]+/, 'utility_db?schema=utility_schema');
    } else {
        content = content.replace('utility_db', 'utility_db?schema=utility_schema');
    }
}

fs.writeFileSync(envPath, content);
console.log('✅ Updated .env with schema=utility_schema');
