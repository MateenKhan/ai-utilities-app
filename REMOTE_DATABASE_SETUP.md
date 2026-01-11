# Remote Database Connection Guide

## Your Remote Database

**IP Address:** 72.60.100.239  
**Port:** 5432 (default PostgreSQL port)

## Step 1: Update .env File

Add this line to your `.env` file:

```env
DATABASE_URL="postgresql://utility_user:utility_2026@72.60.100.239:5432/utility_db"
```

**If your remote database has different credentials**, update accordingly:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@72.60.100.239:5432/YOUR_DATABASE_NAME"
```

## Step 2: Test Connection

Run this command to test the connection:

```bash
npx prisma db pull
```

This will check if Prisma can connect to your remote database.

## Step 3: Push Schema to Remote Database

If the database is empty or doesn't have the tables yet:

```bash
npx prisma db push
```

This will create the User and Bookmark tables on your remote database.

## Step 4: Generate Prisma Client

```bash
npx prisma generate
```

## Step 5: Create Test User and Sample Data

Run the setup script:

```bash
node setup-database.js
```

This will:
- Create test user (test@test.com / test)
- Add 5 sample bookmarks

## Manual Setup (Alternative)

If you prefer to run SQL directly on your remote database:

### Connect to Remote Database

```bash
psql -h 72.60.100.239 -U utility_user -d utility_db
```

### Run DDL Script

```sql
-- Copy and paste contents from src/ddl.sql
-- Or run: \i src/ddl.sql
```

### Run DML Script

```sql
-- Copy and paste contents from src/dml.sql
-- Or run: \i src/dml.sql
```

## Firewall & Security

Make sure:

1. **Port 5432 is open** on the remote server
2. **PostgreSQL allows remote connections**
   - Edit `postgresql.conf`: `listen_addresses = '*'`
   - Edit `pg_hba.conf`: Add your IP or `host all all 0.0.0.0/0 md5`
3. **Firewall allows connections** from your IP

## Test Connection from Command Line

```bash
# Test if port is accessible
Test-NetConnection -ComputerName 72.60.100.239 -Port 5432

# Or using psql
psql -h 72.60.100.239 -U utility_user -d utility_db -c "SELECT version();"
```

## Environment Variables Summary

Add to your `.env` file:

```env
# Remote Database
DATABASE_URL="postgresql://utility_user:utility_2026@72.60.100.239:5432/utility_db"

# Authentication
JWT_SECRET="your-jwt-secret-key-min-32-chars"
NEXTAUTH_SECRET="your-nextauth-secret-min-32-chars"

# Application
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

## Troubleshooting

### Connection Timeout

**Issue:** Cannot connect to remote database

**Solutions:**
1. Check if PostgreSQL is running on remote server
2. Verify firewall rules allow port 5432
3. Check `pg_hba.conf` allows your IP
4. Verify credentials are correct

### Authentication Failed

**Issue:** Password authentication failed

**Solutions:**
1. Verify username and password
2. Check if user exists on remote database
3. Ensure password is correct in DATABASE_URL

### Database Does Not Exist

**Issue:** Database "utility_db" does not exist

**Solutions:**
1. Create database on remote server:
   ```sql
   CREATE DATABASE utility_db;
   ```
2. Or update DATABASE_URL with existing database name

## Quick Setup Commands

```bash
# 1. Update .env with remote database URL
# (Edit .env file manually)

# 2. Test connection
npx prisma db pull

# 3. Create tables
npx prisma db push

# 4. Generate Prisma client
npx prisma generate

# 5. Create test user and data
node setup-database.js

# 6. Verify
npx prisma studio
```

## Next Steps

After successful connection:

1. ✅ Database connected
2. ✅ Tables created
3. ✅ Test user created
4. 🔄 Restart your dev server (if needed)
5. 🔄 Test login at http://localhost:3000
