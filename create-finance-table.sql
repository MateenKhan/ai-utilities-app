-- SQL to create Finance table in utility_schema
-- Run this with a user that has CREATE permissions on utility_schema
-- For example: psql -U postgres -d utility_db -f create-finance-table.sql

-- Create Finance table
CREATE TABLE IF NOT EXISTS utility_schema."Finance" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sno" SERIAL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "userId" INTEGER NOT NULL REFERENCES utility_schema."User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Finance_userId_idx" ON utility_schema."Finance"("userId");
CREATE INDEX IF NOT EXISTS "Finance_category_idx" ON utility_schema."Finance"("category");
CREATE INDEX IF NOT EXISTS "Finance_createdAt_idx" ON utility_schema."Finance"("createdAt" DESC);

-- Create trigger for updatedAt
CREATE OR REPLACE FUNCTION utility_schema.update_finance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_finance_updated_at ON utility_schema."Finance";
CREATE TRIGGER update_finance_updated_at
BEFORE UPDATE ON utility_schema."Finance"
FOR EACH ROW
EXECUTE FUNCTION utility_schema.update_finance_updated_at();

-- Grant permissions (if needed)
GRANT ALL PRIVILEGES ON utility_schema."Finance" TO utility_user;
GRANT USAGE, SELECT ON SEQUENCE utility_schema."Finance_sno_seq" TO utility_user;
