const { Client } = require('pg');
require('dotenv').config();

const url = process.env.DATABASE_URL;

async function checkFinanceTable() {
    const client = new Client({ 
        connectionString: url,
        ssl: false
    });
    
    try {
        await client.connect();
        console.log('Connected!');
        console.log('Using connection:', url.replace(/:[^:@]+@/, ':****@'));
        
        // Check if Finance table exists
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'utility_schema' 
            AND table_name = 'Finance'
        `);
        
        if (tables.rows.length > 0) {
            console.log('✅ Finance table exists');
            
            // Check columns
            const columns = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = 'utility_schema' 
                AND table_name = 'Finance'
                ORDER BY ordinal_position
            `);
            
            console.log('Columns:', columns.rows);
        } else {
            console.log('❌ Finance table does NOT exist');
            console.log('Please create it manually or contact database admin');
        }
        
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
}

checkFinanceTable();
