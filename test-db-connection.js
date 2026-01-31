
// Load environment variables from .env if possible
try {
  require('dotenv').config();
} catch (e) {
  // Ignore if dotenv is not available
}

const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

async function testDbConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  console.log('Testing connection to:', databaseUrl ? databaseUrl.replace(/:[^:@]+@/, ':****@') : 'Undefined');
  
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set');
    return;
  }

  const pool = new Pool({ 
    connectionString: databaseUrl,
    max: 1,
    ssl: false
  });
  // Set search path manually for the entire session
  const client = await pool.connect();
  await client.query('SET search_path TO utility_schema, public');
  
  // Verify table exists in this specific client
  const tableCheck = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'utility_schema' AND table_name = 'User'");
  console.log('User table check in utility_schema:', tableCheck.rows);
  
  // DO NOT RELEASE THE CLIENT, let the pool use it for Prisma
  // client.release();
  
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  try {
    await prisma.$connect();
    console.log('Database connection successful!');
    const users = await prisma.user.findMany();
    console.log('Users:', users);
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testDbConnection();
