const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting manual setup...');

    try {
        // 1. Create User Table
        console.log('1️⃣ Creating User table...');
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" SERIAL NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `);

        // Create unique index on email safely
        try {
            await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "User_email_key" ON "User"("email");`);
        } catch (e) {
            // Ignore if index already exists
        }

        // 2. Create Bookmark Table
        console.log('2️⃣ Creating Bookmark table...');
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Bookmark" (
        "id" SERIAL NOT NULL,
        "name" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "folder" TEXT,
        "tags" TEXT[],
        "description" TEXT,
        "favicon" TEXT,
        "userId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
      );
    `);

        // Add ForeignKey safely
        try {
            await prisma.$executeRawUnsafe(`
            ALTER TABLE "Bookmark" 
            ADD CONSTRAINT "Bookmark_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
        } catch (e) {
            // Ignore if constraint exists
        }

        // 3. Insert Test User
        console.log('3️⃣ Creating/Updating test user...');
        const hashedPassword = await bcrypt.hash('test', 10);

        // We use raw sql for insert to be safe if Prisma schema mismatch
        // But let's try Prisma API first as it's cleaner
        const email = 'test@test.com';

        // Check if user exists
        const users = await prisma.$queryRaw`SELECT * FROM "User" WHERE email = ${email}`;

        if (users.length === 0) {
            await prisma.$executeRaw`
            INSERT INTO "User" (email, password, name, "createdAt")
            VALUES (${email}, ${hashedPassword}, 'Test User', NOW())
        `;
            console.log('✅ User inserted');
        } else {
            console.log('✅ User already exists');
        }

        console.log('🎉 Setup complete!');

    } catch (error) {
        console.error('❌ Error during setup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
