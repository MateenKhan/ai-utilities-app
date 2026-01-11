const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');

async function main() {
    let dbUrl = '';
    try {
        const envContent = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');
        dbUrl = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?/)[1].trim();
    } catch (e) {
        console.error('Error reading .env');
        return;
    }

    const url = new URL(dbUrl);
    const schema = url.searchParams.get('schema') || 'public';

    const pool = new Pool({ connectionString: dbUrl });

    pool.on('connect', (client) => {
        client.query(`SET search_path TO ${schema}, public`);
    });

    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('--- START PRISMA TEST (FIXED) ---');
        console.log('Using schema:', schema);
        const users = await prisma.user.findMany();
        console.log('Result Success. Count:', users.length);
        if (users.length > 0) {
            console.log('First user email:', users[0].email);
        }
    } catch (err) {
        console.error('ERROR_BEGIN');
        console.error(err.message);
        console.error('ERROR_END');
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
