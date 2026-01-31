require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

async function testPrismaInAPI() {
    const url = process.env.DATABASE_URL;
    console.log('DATABASE_URL:', url ? url.replace(/:[^:@]+@/, ':****@') : 'NOT SET');
    
    if (!url) {
        console.error('DATABASE_URL is not set');
        return;
    }

    try {
        // Extract schema from URL
        const dbUrlObj = new URL(url);
        const schema = dbUrlObj.searchParams.get('schema') || 'utility_schema';
        
        const pool = new Pool({ 
            connectionString: url,
            ssl: false,
            // Set search_path option directly in the connection
            options: `-c search_path="${schema}",public`
        });
        
        const adapter = new PrismaPg(pool);
        const prisma = new PrismaClient({ adapter });

        console.log('Testing Prisma connection...');
        await prisma.$connect();
        console.log('✅ Prisma connected!');

        console.log('Querying user...');
        const user = await prisma.user.findUnique({
            where: { email: 'test@test.com' }
        });
        console.log('User found:', user ? user.email : 'NOT FOUND');

        await prisma.$disconnect();
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testPrismaInAPI();
