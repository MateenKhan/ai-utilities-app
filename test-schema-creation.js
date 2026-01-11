const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

let connectionString = '';
try {
    connectionString = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8')
        .match(/DATABASE_URL=["']?([^"'\n]+)["']?/)[1].trim();
} catch (e) { }

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
    try {
        await client.connect();

        // Try to create a dedicated schema
        console.log('Attempting to create schema "utility_schema"...');
        await client.query('CREATE SCHEMA IF NOT EXISTS utility_schema AUTHORIZATION utility_user');
        console.log('✅ Schema "utility_schema" created successfully!');

        // Test table creation inside it
        await client.query('CREATE TABLE IF NOT EXISTS utility_schema.test_table (id int)');
        console.log('✅ Created table inside "utility_schema"');

    } catch (err) {
        console.log('❌ Failed:', err.message);
    } finally {
        await client.end();
    }
}
main();
