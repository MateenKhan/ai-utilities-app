const { Client } = require('pg');
require('dotenv').config();

// Use utility_user to check
const url = 'postgresql://utility_user:utility_2026@72.60.100.239:5432/utility_db?schema=utility_schema';

async function checkFinanceTable() {
    const client = new Client({ 
        connectionString: url,
        ssl: false
    });
    
    try {
        await client.connect();
        console.log('✅ Connected as utility_user!');
        
        // Check if Finance table exists
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'utility_schema' 
            AND table_name = 'Finance'
        `);
        
        if (tables.rows.length > 0) {
            console.log('✅ Finance table exists in utility_schema');
            
            // Check columns
            const columns = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = 'utility_schema' 
                AND table_name = 'Finance'
                ORDER BY ordinal_position
            `);
            
            console.log('\n📋 Table Structure:');
            columns.rows.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type}`);
            });
            
            // Check if there's any data
            const count = await client.query('SELECT COUNT(*) FROM utility_schema."Finance"');
            console.log(`\n📊 Current records: ${count.rows[0].count}`);
            
        } else {
            console.log('❌ Finance table does NOT exist in utility_schema');
        }
        
    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

checkFinanceTable();
