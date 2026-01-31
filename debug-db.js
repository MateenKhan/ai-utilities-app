const { Client } = require('pg');
require('dotenv').config();

const url = process.env.DATABASE_URL;

async function check() {
    const client = new Client({ 
        connectionString: url,
        connectionTimeoutMillis: 10000,
        ssl: false
    });
    try {
        console.log('Connecting to:', url.replace(/:[^:@]+@/, ':****@'));
        await client.connect();
        console.log('✅ Connected!');
        
        const res = await client.query("SELECT schema_name FROM information_schema.schemata");
        console.log('Schemas:', res.rows.map(r => r.schema_name));
        
        const tables = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'User'");
        console.log('User table locations:', tables.rows);
        
        const currentSchema = await client.query("SELECT current_schema()");
        console.log('Current Schema:', currentSchema.rows[0].current_schema);

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
}

check();
