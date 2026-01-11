# Bookmark Feature Documentation

## Overview

The bookmark feature allows users to save, organize, and manage their favorite URLs with support for folders, tags, descriptions, and more. The system uses PostgreSQL database for persistent storage with localStorage fallback for offline support.

## Database Schema

### Bookmark Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | TEXT | Bookmark name/title |
| url | TEXT | Bookmark URL |
| folder | TEXT | Optional folder/category |
| tags | TEXT[] | Array of tags for categorization |
| description | TEXT | Optional description |
| favicon | TEXT | Optional favicon URL |
| userId | INTEGER | Foreign key to User table |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Indexes

- `idx_bookmark_user_id` - On userId for faster user queries
- `idx_bookmark_folder` - On folder for folder filtering
- `idx_bookmark_created_at` - On createdAt for sorting
- `idx_bookmark_tags` - GIN index on tags for array searches

### Relationships

- **User → Bookmark**: One-to-Many relationship
- **Foreign Key**: Bookmark.userId → User.id (CASCADE on delete)

## API Endpoints

### GET /api/bookmarks

Fetch all bookmarks for the authenticated user.

**Query Parameters:**
- `folder` (optional) - Filter by folder name
- `tag` (optional) - Filter by tag
- `search` (optional) - Search in name, url, and description

**Response:**
```json
{
  "bookmarks": [
    {
      "id": 1,
      "name": "Google",
      "url": "https://www.google.com",
      "folder": "Search Engines",
      "tags": ["search", "tools"],
      "description": "Popular search engine",
      "favicon": "https://www.google.com/favicon.ico",
      "userId": 1,
      "createdAt": "2026-01-11T00:00:00.000Z",
      "updatedAt": "2026-01-11T00:00:00.000Z"
    }
  ]
}
```

### POST /api/bookmarks

Create a new bookmark.

**Request Body:**
```json
{
  "name": "GitHub",
  "url": "https://github.com",
  "folder": "Development",
  "tags": ["code", "git"],
  "description": "Code hosting platform",
  "favicon": "https://github.com/favicon.ico"
}
```

**Response:**
```json
{
  "bookmark": {
    "id": 2,
    "name": "GitHub",
    "url": "https://github.com",
    ...
  }
}
```

### PUT /api/bookmarks

Update an existing bookmark.

**Request Body:**
```json
{
  "id": 2,
  "name": "GitHub - Updated",
  "folder": "Dev Tools",
  "tags": ["code", "git", "collaboration"]
}
```

**Response:**
```json
{
  "bookmark": {
    "id": 2,
    "name": "GitHub - Updated",
    ...
  }
}
```

### DELETE /api/bookmarks

Delete a bookmark.

**Query Parameters:**
- `id` (required) - Bookmark ID to delete

**Response:**
```json
{
  "message": "Bookmark deleted successfully"
}
```

## React Hook: useBookmarks

### Usage

```typescript
import { useBookmarks } from '@/hooks/useBookmarks';

function BookmarkComponent() {
  const {
    bookmarks,
    loading,
    error,
    loadBookmarks,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    syncLocalStorageToDatabase,
  } = useBookmarks();

  // Use the hook methods...
}
```

### Methods

#### loadBookmarks(filters?)

Load bookmarks with optional filters.

```typescript
// Load all bookmarks
await loadBookmarks();

// Load bookmarks in a specific folder
await loadBookmarks({ folder: 'Development' });

// Load bookmarks with a specific tag
await loadBookmarks({ tag: 'important' });

// Search bookmarks
await loadBookmarks({ search: 'github' });
```

#### addBookmark(bookmark)

Add a new bookmark.

```typescript
await addBookmark({
  name: 'Stack Overflow',
  url: 'https://stackoverflow.com',
  folder: 'Development',
  tags: ['code', 'help', 'qa'],
  description: 'Q&A for developers',
});
```

#### updateBookmark(id, updatedData)

Update an existing bookmark.

```typescript
await updateBookmark(1, {
  name: 'Updated Name',
  tags: ['new', 'tags'],
});
```

#### deleteBookmark(id)

Delete a bookmark.

```typescript
await deleteBookmark(1);
```

#### syncLocalStorageToDatabase()

Migrate bookmarks from localStorage to database (one-time operation).

```typescript
await syncLocalStorageToDatabase();
```

## Database Setup

### 1. Run DDL Script

Execute the DDL script to create the database and tables:

```bash
psql -U postgres -f src/ddl.sql
```

### 2. Update Environment Variables

Add to your `.env` file:

```env
DATABASE_URL="postgresql://utility_user:utility_2026@localhost:5432/utility_db"
```

### 3. Run Prisma Migration

```bash
npx prisma migrate deploy
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

## Migration from localStorage

If you have existing bookmarks in localStorage, they will automatically be used as a fallback when the user is not authenticated. To migrate them to the database:

1. User logs in
2. Call `syncLocalStorageToDatabase()` method
3. Bookmarks will be uploaded to the database
4. localStorage will be cleared

## Features

### ✅ Implemented

- CRUD operations (Create, Read, Update, Delete)
- User authentication and authorization
- Folder organization
- Tag-based categorization
- Search functionality
- Favicon support
- Description field
- Timestamps (createdAt, updatedAt)
- Database indexes for performance
- localStorage fallback for offline support
- Migration from localStorage to database

### 🔄 Future Enhancements

- Bulk operations (import/export)
- Bookmark sharing between users
- Bookmark collections/groups
- Automatic favicon fetching
- Bookmark preview/screenshots
- Duplicate detection
- Bookmark validation (check if URL is still valid)
- Browser extension integration
- Bookmark analytics (most visited, etc.)

## Performance Optimization

1. **Indexes**: Created on userId, folder, tags, and createdAt for fast queries
2. **Pagination**: Consider adding pagination for users with many bookmarks
3. **Caching**: Consider implementing Redis caching for frequently accessed bookmarks
4. **Lazy Loading**: Load bookmarks on demand rather than all at once

## Security

1. **Authentication**: All API endpoints require valid JWT token
2. **Authorization**: Users can only access their own bookmarks
3. **Input Validation**: Validate all input data before database operations
4. **SQL Injection Prevention**: Using Prisma ORM prevents SQL injection
5. **XSS Prevention**: Sanitize URLs and descriptions before rendering

## Testing

### Manual Testing

1. Create a bookmark:
```bash
curl -X POST http://localhost:3000/api/bookmarks \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{"name":"Test","url":"https://test.com"}'
```

2. Get all bookmarks:
```bash
curl http://localhost:3000/api/bookmarks \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

3. Update a bookmark:
```bash
curl -X PUT http://localhost:3000/api/bookmarks \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{"id":1,"name":"Updated Name"}'
```

4. Delete a bookmark:
```bash
curl -X DELETE "http://localhost:3000/api/bookmarks?id=1" \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

## Troubleshooting

### Issue: Bookmarks not loading

**Solution**: 
- Check if user is authenticated
- Verify DATABASE_URL is correct
- Check browser console for errors
- Falls back to localStorage if API fails

### Issue: Migration fails

**Solution**:
- Ensure PostgreSQL is running
- Verify database credentials
- Check if User table exists
- Run migrations in correct order

### Issue: Duplicate bookmarks

**Solution**:
- Add unique constraint on (userId, url) if needed
- Implement duplicate detection in frontend

## File Structure

```
src/
├── app/
│   └── api/
│       └── bookmarks/
│           └── route.ts          # API endpoints
├── hooks/
│   └── useBookmarks.ts           # React hook
├── ddl.sql                       # Database DDL script
prisma/
├── schema.prisma                 # Prisma schema
└── migrations/
    └── 20260111_add_bookmarks_table/
        └── migration.sql         # Migration SQL
```

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Array Types](https://www.postgresql.org/docs/current/arrays.html)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [JWT Authentication](https://jwt.io/introduction)
