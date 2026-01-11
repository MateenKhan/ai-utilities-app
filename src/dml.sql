-- ============================================
-- Data Manipulation Language (DML) Script
-- Insert default test user and sample data
-- ============================================

-- Connect to the database
\c utility_db

-- ============================================
-- Insert Default Test User
-- ============================================
-- Username: test@test.com
-- Password: test
-- Note: Password is hashed using bcrypt with salt rounds = 10

INSERT INTO "User" (email, password, name) 
VALUES (
    'test@test.com',
    '$2b$10$zxMMI5NQ0ZGFxh5Rk.dEIeJSW05yXjQTyp/NGvNlGxP7Tv.se',  -- bcrypt hash of "test"
    'Test User'
)
ON CONFLICT (email) DO NOTHING;

-- Get the user ID for inserting sample bookmarks
DO $$
DECLARE
    test_user_id INTEGER;
BEGIN
    -- Get the test user ID
    SELECT id INTO test_user_id FROM "User" WHERE email = 'test@test.com';
    
    -- Insert sample bookmarks for the test user
    IF test_user_id IS NOT NULL THEN
        INSERT INTO "Bookmark" (name, url, folder, tags, description, "userId") 
        VALUES 
            ('Google', 'https://www.google.com', 'Search Engines', ARRAY['search', 'tools'], 'Popular search engine', test_user_id),
            ('GitHub', 'https://github.com', 'Development', ARRAY['code', 'git', 'development'], 'Code hosting platform', test_user_id),
            ('Stack Overflow', 'https://stackoverflow.com', 'Development', ARRAY['code', 'help', 'qa'], 'Q&A for developers', test_user_id),
            ('MDN Web Docs', 'https://developer.mozilla.org', 'Development', ARRAY['documentation', 'web', 'reference'], 'Web development documentation', test_user_id),
            ('YouTube', 'https://www.youtube.com', 'Entertainment', ARRAY['video', 'entertainment'], 'Video sharing platform', test_user_id)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Sample bookmarks inserted for test user';
    END IF;
END $$;

-- ============================================
-- Verification
-- ============================================

-- Display inserted user
SELECT id, email, name, "createdAt" FROM "User" WHERE email = 'test@test.com';

-- Display inserted bookmarks
SELECT 
    b.id, 
    b.name, 
    b.url, 
    b.folder, 
    b.tags,
    u.email as "userEmail"
FROM "Bookmark" b
JOIN "User" u ON b."userId" = u.id
WHERE u.email = 'test@test.com';

-- Summary
SELECT 
    (SELECT COUNT(*) FROM "User") as total_users,
    (SELECT COUNT(*) FROM "Bookmark") as total_bookmarks;
