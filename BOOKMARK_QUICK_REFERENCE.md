# Bookmark Feature - Quick Reference

## 🚀 Quick Start

```bash
# 1. Setup database
psql -U postgres -f src/ddl.sql

# 2. Configure environment
echo 'DATABASE_URL="postgresql://utility_user:utility_2026@localhost:5432/utility_db"' >> .env

# 3. Run migrations
npx prisma generate && npx prisma migrate deploy

# 4. Start app
npm run dev
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookmarks` | Get all bookmarks |
| GET | `/api/bookmarks?folder=Work` | Filter by folder |
| GET | `/api/bookmarks?tag=important` | Filter by tag |
| GET | `/api/bookmarks?search=github` | Search bookmarks |
| POST | `/api/bookmarks` | Create bookmark |
| PUT | `/api/bookmarks` | Update bookmark |
| DELETE | `/api/bookmarks?id=1` | Delete bookmark |

## 💻 Code Examples

### Load Bookmarks

```typescript
const { bookmarks, loading } = useBookmarks();
```

### Add Bookmark

```typescript
await addBookmark({
  name: 'GitHub',
  url: 'https://github.com',
  folder: 'Development',
  tags: ['code', 'git'],
  description: 'Code hosting',
});
```

### Update Bookmark

```typescript
await updateBookmark(1, {
  name: 'Updated Name',
  tags: ['new', 'tags'],
});
```

### Delete Bookmark

```typescript
await deleteBookmark(1);
```

### Filter Bookmarks

```typescript
await loadBookmarks({ folder: 'Work' });
await loadBookmarks({ tag: 'important' });
await loadBookmarks({ search: 'github' });
```

## 🗄️ Database Schema

```sql
CREATE TABLE "Bookmark" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    folder TEXT,
    tags TEXT[],
    description TEXT,
    favicon TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);
```

## 🔧 Useful Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Check migration status
npx prisma migrate status

# Reset database (dev only!)
npx prisma migrate reset
```

## 🔐 Environment Variables

```env
DATABASE_URL="postgresql://utility_user:utility_2026@localhost:5432/utility_db"
JWT_SECRET="your-secret-key-min-32-chars"
```

## 📝 Bookmark Object

```typescript
type Bookmark = {
  id: number;
  name: string;
  url: string;
  folder?: string | null;
  tags?: string[];
  description?: string | null;
  favicon?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};
```

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection failed | Check if PostgreSQL is running: `pg_isready` |
| Migration failed | Verify DATABASE_URL in .env file |
| Unauthorized error | User must be logged in with valid JWT token |
| Bookmarks not loading | Check browser console and API logs |

## 📚 Documentation Files

- `BOOKMARK_DATABASE_SUMMARY.md` - Complete summary
- `BOOKMARKS_DOCUMENTATION.md` - Detailed API docs
- `DATABASE_MIGRATION_GUIDE.md` - Setup guide
- `src/ddl.sql` - Database schema

## ⚡ Performance Tips

- Use indexes (already created on userId, folder, tags)
- Filter on server-side using query params
- Implement pagination for large datasets
- Cache frequently accessed bookmarks

## 🔒 Security Checklist

- ✅ JWT authentication required
- ✅ User can only access own bookmarks
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Input validation on all endpoints
- ✅ Cascade delete on user removal

---

**Quick Links:**
- API: `src/app/api/bookmarks/route.ts`
- Hook: `src/hooks/useBookmarks.ts`
- Schema: `prisma/schema.prisma`
- DDL: `src/ddl.sql`
