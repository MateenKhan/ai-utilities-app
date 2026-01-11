const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Hardcoded for reliability in this run
const databaseUrl = 'postgresql://utility_user:utility_2026@72.60.100.239:5432/utility_db';

console.log('🔗 Connecting to remote database...');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
});

async function main() {
    try {
        // 1. Test Connection
        await prisma.$connect();
        console.log('✅ Connected to database successfully!');

        // 2. Check/Create Tables
        try {
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "User" (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255),
            "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
            console.log('✅ Table "User" ensured');

            await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
      `);

            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Bookmark" (
            id SERIAL PRIMARY KEY,
            name VARCHAR(500) NOT NULL,
            url TEXT NOT NULL,
            folder VARCHAR(255),
            tags TEXT[],
            description TEXT,
            favicon VARCHAR(500),
            "userId" INTEGER NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_bookmark_user FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
        );
      `);
            console.log('✅ Table "Bookmark" ensured');

            await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_bookmark_user_id ON "Bookmark"("userId");`);
            await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_bookmark_folder ON "Bookmark"(folder);`);
            await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_bookmark_created_at ON "Bookmark"("createdAt" DESC);`);
            await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_bookmark_tags ON "Bookmark" USING GIN(tags);`);

            // Create trigger function if not exists
            try {
                await prisma.$executeRawUnsafe(`
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
              NEW."updatedAt" = CURRENT_TIMESTAMP;
              RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
        `);

                // Check if trigger exists before creating to avoid errors
                await prisma.$executeRawUnsafe(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bookmark_updated_at') THEN
              CREATE TRIGGER update_bookmark_updated_at
              BEFORE UPDATE ON "Bookmark"
              FOR EACH ROW
              EXECUTE FUNCTION update_updated_at_column();
            END IF;
          END
          $$;
        `);
            } catch (e) {
                console.log('⚠️  Trigger setup warning (ignorable if exists):', e.message);
            }

        } catch (error) {
            console.error('❌ Error creating tables:', error.message);
            // Don't return, maybe tables exist and permissions are just weird
        }

        // 3. Create Test User
        const email = 'test@test.com';
        const password = 'test';
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (!existingUser) {
            console.log('📝 Creating test user...');
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: 'Test User',
                },
            });
            console.log('✅ Test user created:', user.id);

            // 4. Create Bookmarks
            console.log('📝 Creating sample bookmarks...');
            await prisma.bookmark.createMany({
                data: [
                    { name: 'Google', url: 'https://www.google.com', folder: 'Search Engines', tags: ['search'], userId: user.id },
                    { name: 'GitHub', url: 'https://github.com', folder: 'Development', tags: ['code', 'git'], userId: user.id },
                    { name: 'Stack Overflow', url: 'https://stackoverflow.com', folder: 'Development', tags: ['help'], userId: user.id },
                    { name: 'MDN', url: 'https://developer.mozilla.org', folder: 'Docs', tags: ['web'], userId: user.id },
                    { name: 'YouTube', url: 'https://www.youtube.com', folder: 'Entertainment', tags: ['video'], userId: user.id },
                ]
            });
            console.log('✅ Sample bookmarks created');
        } else {
            console.log('✅ Test user already exists');
        }

    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
