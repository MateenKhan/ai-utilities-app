const { Client } = require('pg');
require('dotenv').config();

// Use appuser credentials
const url = 'postgresql://appuser:ecom_admin%402026@72.60.100.239:5432/utility_db';

async function checkPermissions() {
    const client = new Client({ 
        connectionString: url,
        ssl: false
    });
    
    try {
        await client.connect();
        console.log('Connected as appuser!');
        
        // Check what schemas appuser can access
        const schemas = await client.query(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
        `);
        console.log('Accessible schemas:', schemas.rows.map(r => r.schema_name));
        
        // Check if User table exists and in which schema
        const tables = await client.query(`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_name = 'User'
        `);
        console.log('User table locations:', tables.rows);
        
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
}

checkPermissions();
