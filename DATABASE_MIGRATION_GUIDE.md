# Database Migration Guide

## Quick Start

Follow these steps to set up the database and run migrations for the Utilities App.

## Prerequisites

- PostgreSQL 16 installed
- Node.js and npm installed
- Access to PostgreSQL server

## Step 1: Create Database and User

### Option A: Using psql command line

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Run the DDL script
\i src/ddl.sql

# Or copy-paste the commands from src/ddl.sql
```

### Option B: Using pgAdmin or other GUI tools

1. Open your PostgreSQL GUI tool
2. Connect to your PostgreSQL server
3. Open and execute `src/ddl.sql`

### Manual Commands

If you prefer to run commands manually:

```sql
-- Create database
CREATE DATABASE utility_db;

-- Create user
CREATE USER utility_user WITH ENCRYPTED PASSWORD 'utility_2026';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE utility_db TO utility_user;

-- Connect to the database
\c utility_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO utility_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO utility_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO utility_user;
```

## Step 2: Update Environment Variables

Create or update your `.env` file:

```env
DATABASE_URL="postgresql://utility_user:utility_2026@localhost:5432/utility_db"
JWT_SECRET="your-secret-key-min-32-characters"
NEXTAUTH_SECRET="your-nextauth-secret-min-32-characters"
```

**Important**: Change the password in production!

## Step 3: Run Prisma Migrations

### Generate Prisma Client

```bash
npx prisma generate
```

### Apply Migrations

```bash
npx prisma migrate deploy
```

### Or Create and Apply New Migration

```bash
npx prisma migrate dev --name init
```

## Step 4: Verify Database Setup

### Check Tables

```sql
-- Connect to database
psql -U utility_user -d utility_db

-- List all tables
\dt

-- Expected output:
--  Schema |   Name    | Type  |     Owner     
-- --------+-----------+-------+---------------
--  public | Bookmark  | table | utility_user
--  public | User      | table | utility_user
```

### Check Indexes

```sql
-- List all indexes
\di

-- Or using SQL
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public';
```

### Check Foreign Keys

```sql
SELECT conname, conrelid::regclass, confrelid::regclass 
FROM pg_constraint 
WHERE contype = 'f';
```

## Step 5: Test Database Connection

Create a test script `test-db.js`:

```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Count users
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);

    // Count bookmarks
    const bookmarkCount = await prisma.bookmark.count();
    console.log(`📊 Bookmarks in database: ${bookmarkCount}`);

  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

Run the test:

```bash
node test-db.js
```

## Troubleshooting

### Issue: "database does not exist"

**Solution**:
```bash
# Create database manually
createdb -U postgres utility_db
```

### Issue: "role does not exist"

**Solution**:
```bash
# Create user manually
psql -U postgres -c "CREATE USER utility_user WITH ENCRYPTED PASSWORD 'utility_2026';"
```

### Issue: "permission denied"

**Solution**:
```sql
-- Grant all necessary permissions
GRANT ALL PRIVILEGES ON DATABASE utility_db TO utility_user;
GRANT ALL ON SCHEMA public TO utility_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO utility_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO utility_user;
```

### Issue: Prisma migration fails

**Solution**:
```bash
# Reset database (WARNING: This will delete all data!)
npx prisma migrate reset

# Or manually drop and recreate tables
psql -U utility_user -d utility_db -c "DROP TABLE IF EXISTS \"Bookmark\" CASCADE;"
psql -U utility_user -d utility_db -c "DROP TABLE IF EXISTS \"User\" CASCADE;"

# Then run migrations again
npx prisma migrate deploy
```

### Issue: Connection refused

**Solution**:
- Check if PostgreSQL is running: `pg_isready`
- Check PostgreSQL port: Default is 5432
- Verify DATABASE_URL in `.env` file
- Check firewall settings

## Production Deployment

### 1. Update Database Credentials

**Never use default passwords in production!**

```sql
-- Change password
ALTER USER utility_user WITH PASSWORD 'your-strong-production-password';
```

Update `.env.production`:
```env
DATABASE_URL="postgresql://utility_user:your-strong-production-password@your-db-host:5432/utility_db"
```

### 2. Run Migrations on Production

```bash
# Set production environment
export NODE_ENV=production

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 3. Backup Database

```bash
# Create backup
pg_dump -U utility_user utility_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -U utility_user utility_db < backup_20260111_120000.sql
```

## Database Maintenance

### Vacuum Database

```sql
-- Analyze and optimize
VACUUM ANALYZE;

-- Full vacuum (requires more resources)
VACUUM FULL;
```

### Monitor Database Size

```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('utility_db'));

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Monitor Active Connections

```sql
SELECT 
  datname,
  count(*) as connections
FROM pg_stat_activity
GROUP BY datname;
```

## Migration Scripts

### Add New Column to Bookmark Table

```sql
-- Example: Add 'archived' column
ALTER TABLE "Bookmark" ADD COLUMN archived BOOLEAN DEFAULT FALSE;

-- Create index
CREATE INDEX idx_bookmark_archived ON "Bookmark"(archived);
```

### Add New Table

1. Update `prisma/schema.prisma`
2. Create migration:
```bash
npx prisma migrate dev --name add_new_table
```

## Rollback Strategy

### Rollback Last Migration

```bash
# WARNING: This may cause data loss!
npx prisma migrate resolve --rolled-back <migration-name>
```

### Manual Rollback

```sql
-- Drop the Bookmark table
DROP TABLE IF EXISTS "Bookmark" CASCADE;

-- Recreate from backup or previous state
```

## Best Practices

1. **Always backup before migrations** in production
2. **Test migrations** in development/staging first
3. **Use transactions** for complex migrations
4. **Monitor performance** after adding indexes
5. **Keep migration files** in version control
6. **Document schema changes** in commit messages
7. **Use Prisma Studio** for visual database inspection:
   ```bash
   npx prisma studio
   ```

## Useful Commands

```bash
# Open Prisma Studio (GUI for database)
npx prisma studio

# Format Prisma schema
npx prisma format

# Validate Prisma schema
npx prisma validate

# View migration status
npx prisma migrate status

# Create migration without applying
npx prisma migrate dev --create-only

# Reset database (development only!)
npx prisma migrate reset
```

## Resources

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Backup Best Practices](https://www.postgresql.org/docs/current/backup.html)
