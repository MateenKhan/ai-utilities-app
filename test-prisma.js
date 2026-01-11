try {
    const { PrismaClient } = require('@prisma/client');
    console.log('✅ PrismaClient imported');
    const prisma = new PrismaClient();
    console.log('✅ PrismaClient instantiated');
} catch (e) {
    console.error('❌ Error:', e.message);
}
