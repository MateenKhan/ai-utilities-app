const fs = require('fs');
const content = fs.readFileSync('.env', 'utf8');
const dbUrl = content.match(/DATABASE_URL=["']?([^"'\n]+)["']?/)[1];
const url = new URL(dbUrl);
console.log('User:', url.username);
console.log('Host:', url.hostname);
console.log('Path:', url.pathname);
console.log('Search:', url.search);
