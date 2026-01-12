const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
    let dbUrl = '';
    try {
        const envContent = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');
        dbUrl = envContent.split('\n')
            .map(line => line.trim())
            .find(line => line.startsWith('DATABASE_URL=') && !line.startsWith('#'))
            .match(/DATABASE_URL=["']?([^"'\n]+)["']?/)[1].trim();
    } catch (e) {
        console.error('Error reading .env');
        return;
    }

    const url = new URL(dbUrl);
    const schema = url.searchParams.get('schema') || 'public';

    const pool = new Pool({ connectionString: dbUrl });

    try {
        const client = await pool.connect();
        console.log('Connected to PG');

        await client.query(`SET search_path TO ${schema}, public`);
        console.log('Search path set to:', schema);

        const res = await client.query('SELECT current_schema()');
        console.log('Current schema:', res.rows[0].current_schema);

        const tables = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = $1`, [schema]);
        console.log('Tables in', schema, ':', tables.rows.map(t => t.table_name));

        const users = await client.query('SELECT * FROM "User"');
        console.log('Users count via direct SQL:', users.rows.length);

        client.release();
    } catch (err) {
        console.error('PG Error:', err.message);
    } finally {
        await pool.end();
    }
}

main();
