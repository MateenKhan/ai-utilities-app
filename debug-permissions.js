const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read DATABASE_URL
let connectionString = '';
try {
    const envPath = path.resolve(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    connectionString = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?/)[1].trim();
} catch (e) {
    console.error('❌ Could not read .env file');
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        await client.connect();
        console.log('✅ Connected to Database');

        // 1. Check current user and database
        const userRes = await client.query('SELECT current_user, current_database(), version()');
        console.log('👤 Current User:', userRes.rows[0].current_user);
        console.log('🗄️  Current DB:', userRes.rows[0].current_database);
        console.log('ℹ️  Postgres Version:', userRes.rows[0].version);

        // 2. Check Schema Ownership and Permissions
        const schemaRes = await client.query(`
      SELECT n.nspname AS schema_name,
             pg_catalog.pg_get_userbyid(n.nspowner) AS owner,
             n.nspacl
      FROM   pg_catalog.pg_namespace n
      WHERE  n.nspname = 'public';
    `);
        console.log('\n🔒 Schema "public" Info:', schemaRes.rows[0]);

        // 3. Test Create Permission Specifically
        try {
            await client.query('CREATE TABLE public.test_perm_check (id int)');
            console.log('✅ CREATE TABLE SUCCESS (Permission seems fine now!)');
            await client.query('DROP TABLE public.test_perm_check');
        } catch (e) {
            console.log('❌ CREATE TABLE FAILED:', e.message);
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

main();
