# Database Setup Instructions

## Test User Credentials

**Email:** `test@test.com`  
**Password:** `test`

## Quick Setup Options

### Option 1: Using Docker Compose (Recommended)

1. **Start PostgreSQL container:**
   ```bash
   docker-compose up -d postgres
   ```

2. **Wait for PostgreSQL to start (about 10 seconds)**

3. **Run DDL script:**
   ```bash
   docker-compose exec postgres psql -U utility_user -d utility_db -f /app/src/ddl.sql
   ```
   
   Or connect and run manually:
   ```bash
   docker-compose exec postgres psql -U postgres
   ```
   Then paste the contents of `src/ddl.sql`

4. **Run DML script:**
   ```bash
   docker-compose exec postgres psql -U utility_user -d utility_db -f /app/src/dml.sql
   ```

5. **Generate Prisma client:**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

### Option 2: Using Local PostgreSQL

If you have PostgreSQL installed locally:

1. **Run DDL script:**
   ```bash
   psql -U postgres -f src/ddl.sql
   ```

2. **Run DML script:**
   ```bash
   psql -U utility_user -d utility_db -f src/dml.sql
   ```
   Password: `utility_2026`

3. **Generate Prisma client:**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

### Option 3: Using pgAdmin or GUI Tool

1. Open pgAdmin or your preferred PostgreSQL GUI
2. Connect to your PostgreSQL server
3. Open and execute `src/ddl.sql`
4. Open and execute `src/dml.sql`
5. Run in terminal:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

### Option 4: Automated Setup Script

```bash
node setup-database.js
```

This will attempt to automatically run the DDL and DML scripts.

## Environment Configuration

Ensure your `.env` file has:

```env
DATABASE_URL="postgresql://utility_user:utility_2026@localhost:5432/utility_db"
JWT_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_SECRET="your-nextauth-secret-min-32-chars"
```

For Docker:
```env
DATABASE_URL="postgresql://utility_user:utility_2026@postgres:5432/utility_db"
```

## Verification

### 1. Check Database Connection

```bash
# Using psql
psql -U utility_user -d utility_db -c "SELECT * FROM \"User\";"

# Or using Prisma Studio
npx prisma studio
```

### 2. Test Login

1. Go to http://localhost:3000
2. Navigate to login page
3. Use credentials:
   - Email: `test@test.com`
   - Password: `test`

### 3. Check Bookmarks

After logging in, the test user should have 5 sample bookmarks:
- Google
- GitHub
- Stack Overflow
- MDN Web Docs
- YouTube

## Troubleshooting

### Issue: "database does not exist"

**Solution:**
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE utility_db;

-- Create user
CREATE USER utility_user WITH ENCRYPTED PASSWORD 'utility_2026';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE utility_db TO utility_user;
```

### Issue: "relation does not exist"

**Solution:** Run the DDL script to create tables:
```bash
psql -U postgres -f src/ddl.sql
```

### Issue: "password authentication failed"

**Solution:** Check your PostgreSQL password or update it:
```sql
ALTER USER utility_user WITH PASSWORD 'utility_2026';
```

### Issue: Prisma migration fails

**Solution:**
```bash
# Generate Prisma client first
npx prisma generate

# Then run migrations
npx prisma migrate deploy
```

## What Gets Created

### Database: `utility_db`

### User: `utility_user`
- Password: `utility_2026`

### Tables:
1. **User** - Stores user accounts
2. **Bookmark** - Stores user bookmarks

### Default Data:
1. **Test User**
   - Email: test@test.com
   - Password: test (hashed)
   - Name: Test User

2. **Sample Bookmarks** (5 bookmarks for test user)
   - Google (Search Engines)
   - GitHub (Development)
   - Stack Overflow (Development)
   - MDN Web Docs (Development)
   - YouTube (Entertainment)

## Files

- `src/ddl.sql` - Database schema (CREATE statements)
- `src/dml.sql` - Sample data (INSERT statements)
- `setup-database.js` - Automated setup script
- `generate-hash.js` - Password hash generator

## Next Steps

After database setup:

1. ✅ Database created
2. ✅ Tables created
3. ✅ Test user inserted
4. ✅ Sample bookmarks inserted
5. 🔄 Run: `npx prisma generate`
6. 🔄 Run: `npx prisma migrate deploy`
7. 🔄 Test login at http://localhost:3000

## Security Note

⚠️ **IMPORTANT:** The default password `utility_2026` is for development only!

**For production:**
1. Change the database password
2. Update DATABASE_URL in `.env`
3. Use strong, unique passwords
4. Never commit `.env` files to Git
