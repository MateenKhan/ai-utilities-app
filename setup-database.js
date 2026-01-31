const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Use the DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set.');
    console.error('Please check your .env file.');
    process.exit(1);
}

console.log('🔗 Connecting to database...');
console.log('Database URL:', databaseUrl.replace(/:[^:@]+@/, ':****@')); // Hide password

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
});

async function setupDatabase() {
    try {
        console.log('\n1️⃣ Testing database connection...');
        await prisma.$connect();
        console.log('✅ Connected to database successfully!');

        console.log('\n2️⃣ Checking if User table exists...');
        try {
            const userCount = await prisma.user.count();
            console.log(`✅ User table exists with ${userCount} users`);
        } catch (error) {
            console.log('❌ User table does not exist');
            console.log('📝 Please run the DDL script first:');
            console.log('   psql -U postgres -f src/ddl.sql');
            console.log('\nOr manually create tables using Prisma:');
            console.log('   npx prisma db push');
            await prisma.$disconnect();
            return;
        }

        console.log('\n3️⃣ Checking for test user...');
        const existingUser = await prisma.user.findUnique({
            where: { email: 'test@test.com' },
        });

        if (existingUser) {
            console.log('✅ Test user already exists');
            console.log('   ID:', existingUser.id);
            console.log('   Email:', existingUser.email);
            console.log('   Name:', existingUser.name);
        } else {
            console.log('📝 Creating test user...');

            // Hash the password
            const hashedPassword = await bcrypt.hash('test', 10);

            const newUser = await prisma.user.create({
                data: {
                    email: 'test@test.com',
                    password: hashedPassword,
                    name: 'Test User',
                },
            });

            console.log('✅ Test user created successfully!');
            console.log('   ID:', newUser.id);
            console.log('   Email:', newUser.email);
            console.log('   Name:', newUser.name);
        }

        console.log('\n4️⃣ Checking for sample bookmarks...');
        const user = await prisma.user.findUnique({
            where: { email: 'test@test.com' },
            include: { bookmarks: true },
        });

        if (!user) {
            console.log('❌ User not found');
            await prisma.$disconnect();
            return;
        }

        if (user.bookmarks.length > 0) {
            console.log(`✅ User already has ${user.bookmarks.length} bookmarks`);
        } else {
            console.log('📝 Creating sample bookmarks...');

            const sampleBookmarks = [
                {
                    name: 'Google',
                    url: 'https://www.google.com',
                    folder: 'Search Engines',
                    tags: ['search', 'tools'],
                    description: 'Popular search engine',
                    userId: user.id,
                },
                {
                    name: 'GitHub',
                    url: 'https://github.com',
                    folder: 'Development',
                    tags: ['code', 'git', 'development'],
                    description: 'Code hosting platform',
                    userId: user.id,
                },
                {
                    name: 'Stack Overflow',
                    url: 'https://stackoverflow.com',
                    folder: 'Development',
                    tags: ['code', 'help', 'qa'],
                    description: 'Q&A for developers',
                    userId: user.id,
                },
                {
                    name: 'MDN Web Docs',
                    url: 'https://developer.mozilla.org',
                    folder: 'Development',
                    tags: ['documentation', 'web', 'reference'],
                    description: 'Web development documentation',
                    userId: user.id,
                },
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com',
                    folder: 'Entertainment',
                    tags: ['video', 'entertainment'],
                    description: 'Video sharing platform',
                    userId: user.id,
                },
            ];

            for (const bookmark of sampleBookmarks) {
                await prisma.bookmark.create({ data: bookmark });
            }

            console.log(`✅ Created ${sampleBookmarks.length} sample bookmarks`);
        }

        console.log('\n5️⃣ Final verification...');
        const finalUser = await prisma.user.findUnique({
            where: { email: 'test@test.com' },
            include: { bookmarks: true },
        });

        console.log('\n📊 Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Database setup complete!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n👤 Test User:');
        console.log('   Email: test@test.com');
        console.log('   Password: test');
        console.log('   Name:', finalUser?.name);
        console.log('   Bookmarks:', finalUser?.bookmarks.length);
        console.log('\n📚 Sample Bookmarks:');
        finalUser?.bookmarks.forEach((b, i) => {
            console.log(`   ${i + 1}. ${b.name} (${b.folder})`);
        });
        console.log('\n🎯 Next Steps:');
        console.log('1. Go to http://localhost:3000');
        console.log('2. Login with: test@test.com / test');
        console.log('3. Check your bookmarks!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);

        if (error.code === 'P1001') {
            console.log('\n📝 Database connection failed. Please check:');
            console.log('1. PostgreSQL is running');
            console.log('2. DATABASE_URL in .env is correct');
            console.log('3. Database and user exist (run src/ddl.sql)');
        } else if (error.code === 'P2002') {
            console.log('\n📝 User already exists');
        } else {
            console.log('\nFull error:', error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

setupDatabase();
