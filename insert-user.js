const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Direct connection string to avoid env issues
const databaseUrl = 'postgresql://utility_user:utility_2026@72.60.100.239:5432/utility_db';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
});

async function main() {
    try {
        console.log('🔗 Connecting...');
        // Ensure table user exists (simple check)
        try {
            await prisma.$queryRaw`SELECT 1 FROM "User" LIMIT 1`;
            console.log('✅ User table is accessible');
        } catch (e) {
            console.log('⚠️  User table might not exist or connection failed:', e.message);
            // We will try to push schema next if this script fails, but let's try to proceed
        }

        const email = 'test@test.com';
        const password = 'test';

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(`📝 Inserting/Updating user ${email}...`);

        // Upsert user
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                name: 'Test User'
            },
            create: {
                email,
                password: hashedPassword,
                name: 'Test User'
            },
        });

        console.log('✅ User entry ensured in database:', user);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
