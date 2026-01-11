-- ============================================
-- Database Setup Script
-- ============================================

-- Create database
CREATE DATABASE utility_db;

-- Create user with password
CREATE USER utility_user WITH ENCRYPTED PASSWORD 'utility_2026';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE utility_db TO utility_user;

-- Connect to the database
\c utility_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO utility_user;

-- ============================================
-- Table: User
-- ============================================
CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_user_email ON "User"(email);

-- ============================================
-- Table: Bookmark
-- ============================================
CREATE TABLE "Bookmark" (
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
    
    -- Foreign key constraint
    CONSTRAINT fk_bookmark_user 
        FOREIGN KEY ("userId") 
        REFERENCES "User"(id) 
        ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_bookmark_user_id ON "Bookmark"("userId");
CREATE INDEX idx_bookmark_folder ON "Bookmark"(folder);
CREATE INDEX idx_bookmark_created_at ON "Bookmark"("createdAt" DESC);

-- Create index for tag searches (GIN index for array operations)
CREATE INDEX idx_bookmark_tags ON "Bookmark" USING GIN(tags);

-- ============================================
-- Trigger: Update updatedAt timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookmark_updated_at
    BEFORE UPDATE ON "Bookmark"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Insert sample user
-- INSERT INTO "User" (email, password, name) 
-- VALUES ('test@example.com', '$2a$10$examplehashedpassword', 'Test User');

-- Insert sample bookmarks
-- INSERT INTO "Bookmark" (name, url, folder, tags, description, "userId") 
-- VALUES 
--     ('Google', 'https://www.google.com', 'Search Engines', ARRAY['search', 'tools'], 'Popular search engine', 1),
--     ('GitHub', 'https://github.com', 'Development', ARRAY['code', 'git', 'development'], 'Code hosting platform', 1),
--     ('Stack Overflow', 'https://stackoverflow.com', 'Development', ARRAY['code', 'help', 'qa'], 'Q&A for developers', 1);

-- ============================================
-- Grant table permissions to utility_user
-- ============================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO utility_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO utility_user;

-- ============================================
-- Verification Queries
-- ============================================

-- Check tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check indexes
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';

-- Check foreign keys
-- SELECT conname, conrelid::regclass, confrelid::regclass 
-- FROM pg_constraint 
-- WHERE contype = 'f';
