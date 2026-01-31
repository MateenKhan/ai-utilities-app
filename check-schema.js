const { Client } = require('pg');
require('dotenv').config();

const url = process.env.DATABASE_URL;

async function checkSchema() {
    const client = new Client({ 
        connectionString: url,
        ssl: false
    });
    
    try {
        await client.connect();
        console.log('Connected!');
        
        // Check columns in User table
        const columns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'utility_schema' 
            AND table_name = 'User'
            ORDER BY ordinal_position
        `);
        
        console.log('Columns in utility_schema.User:');
        columns.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });
        
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
}

checkSchema();
