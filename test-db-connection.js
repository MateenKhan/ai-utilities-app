
const { PrismaClient } = require('@prisma/client');

async function testDbConnection() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log('Database connection successful!');
    const users = await prisma.user.findMany();
    console.log('Users:', users);
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDbConnection();
