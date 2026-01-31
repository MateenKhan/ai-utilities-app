const { Client } = require('pg');
require('dotenv').config();

// Use appuser credentials
const url = 'postgresql://appuser:ecom_admin%402026@72.60.100.239:5432/utility_db';

async function checkPublicSchema() {
    const client = new Client({ 
        connectionString: url,
        ssl: false
    });
    
    try {
        await client.connect();
        console.log('Connected as appuser!');
        
        // Check all tables in public schema
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        console.log('Tables in public schema:', tables.rows.map(r => r.table_name));
        
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
}

checkPublicSchema();
