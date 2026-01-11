-- Run these commands as a superuser (e.g. postgres) on your remote database
-- Connect to the database "utility_db" first or run in the context of the database

-- 1. Grant connection permission
GRANT CONNECT ON DATABASE utility_db TO utility_user;

-- 2. Grant usage on schema public
GRANT USAGE ON SCHEMA public TO utility_user;

-- 3. Grant table creation permissions
GRANT CREATE ON SCHEMA public TO utility_user;

-- 4. Grant privileges on all existing tables and sequences
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO utility_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO utility_user;

-- 5. Ensure future tables are also accessible
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO utility_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO utility_user;
