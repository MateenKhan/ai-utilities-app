const { Client } = require('pg');
require('dotenv').config();

const url = process.env.DATABASE_URL;

async function createFinanceTable() {
    const client = new Client({ 
        connectionString: url,
        ssl: false
    });
    
    try {
        await client.connect();
        console.log('Connected!');
        
        // Create Finance table in utility_schema
        await client.query(`
            CREATE TABLE IF NOT EXISTS utility_schema."Finance" (
                "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                "sno" SERIAL,
                "name" TEXT NOT NULL,
                "amount" DOUBLE PRECISION NOT NULL,
                "description" TEXT,
                "category" TEXT NOT NULL,
                "userId" INTEGER NOT NULL REFERENCES utility_schema."User"("id") ON DELETE CASCADE,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Finance table created');
        
        // Create indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS "Finance_userId_idx" ON utility_schema."Finance"("userId");
            CREATE INDEX IF NOT EXISTS "Finance_category_idx" ON utility_schema."Finance"("category");
            CREATE INDEX IF NOT EXISTS "Finance_createdAt_idx" ON utility_schema."Finance"("createdAt" DESC);
        `);
        console.log('✅ Indexes created');
        
        // Create trigger for updatedAt
        await client.query(`
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
        `);
        console.log('✅ Trigger created');
        
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
}

createFinanceTable();
