const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const fs = require('fs');
const path = require('path');

// Read .env file manually
let connectionString = '';
try {
    const envPath = path.resolve(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
    if (match) {
        connectionString = match[1];
        console.log('Found DATABASE_URL in .env');
        // Sanitize any potential carriage returns
        connectionString = connectionString.trim();
    } else {
        throw new Error('DATABASE_URL not found in .env');
    }
} catch (e) {
    console.error('Error loading .env:', e.message);
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Relax SSL for testing
});

async function main() {
    try {
        console.log('🔗 Connecting to database...');
        await client.connect();
        console.log('✅ Connected!');

        // Ensure schema exists and set search path
        console.log('0️⃣ Setting up schema "utility_schema"...');
        // Extract username from connection string to use in AUTHORIZATION
        const dbUser = new URL(connectionString).username;
        await client.query(`CREATE SCHEMA IF NOT EXISTS utility_schema AUTHORIZATION ${dbUser}`);
        await client.query('SET search_path TO utility_schema');

        await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "password" VARCHAR(255) NOT NULL,
        "name" VARCHAR(255),
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Create index if not exists (Postgres doesn't support IF NOT EXISTS for indexes directly in older versions, but let's try or catch)
        try {
            await client.query(`CREATE INDEX idx_user_email ON "User"(email);`);
        } catch (e) { /* ignore */ }

        console.log('2️⃣ Creating Bookmark table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS "Bookmark" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(500) NOT NULL,
        "url" TEXT NOT NULL,
        "folder" VARCHAR(255),
        "tags" TEXT[],
        "description" TEXT,
        "favicon" VARCHAR(500),
        "userId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_bookmark_user FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      );
    `);

        // Create indexes
        const indexes = [
            'idx_bookmark_user_id ON "Bookmark"("userId")',
            'idx_bookmark_folder ON "Bookmark"(folder)',
            'idx_bookmark_created_at ON "Bookmark"("createdAt" DESC)',
            'idx_bookmark_tags ON "Bookmark" USING GIN(tags)'
        ];

        for (const idx of indexes) {
            try {
                await client.query(`CREATE INDEX ${idx};`);
            } catch (e) { /* ignore */ }
        }

        console.log('3️⃣ Ensuring triggers...');
        try {
            await client.query(`
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
              NEW."updatedAt" = CURRENT_TIMESTAMP;
              RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
        `);

            await client.query(`
          DROP TRIGGER IF EXISTS update_bookmark_updated_at ON "Bookmark";
          CREATE TRIGGER update_bookmark_updated_at
          BEFORE UPDATE ON "Bookmark"
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        `);
        } catch (e) {
            console.log('⚠️  Trigger setup skipped:', e.message);
        }

        console.log('4️⃣ Inserting test user...');
        const email = 'test@test.com';
        const password = 'test';
        const hashedPassword = await bcrypt.hash(password, 10);

        const res = await client.query('SELECT id FROM "User" WHERE email = $1', [email]);
        if (res.rows.length === 0) {
            await client.query(
                'INSERT INTO "User" (email, password, name) VALUES ($1, $2, $3)',
                [email, hashedPassword, 'Test User']
            );
            console.log(`✅ User ${email} inserted.`);
        } else {
            console.log(`✅ User ${email} already exists.`);
        }

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await client.end();
    }
}

main();
