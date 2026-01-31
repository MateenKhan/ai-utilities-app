import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
    const url = process.env.DATABASE_URL;
    
    // Handle missing DATABASE_URL
    if (!url) {
        throw new Error('DATABASE_URL is not set');
    }
    
    // Extract schema from URL
    const dbUrlObj = new URL(url);
    const schema = dbUrlObj.searchParams.get('schema') || 'utility_schema';
    
    const pool = new Pool({ 
        connectionString: url,
        ssl: false,
        // Set search_path option directly in the connection
        options: `-c search_path="${schema}",public`
    });
    
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter } as any);
};

export const prisma = (globalForPrisma.prisma as PrismaClient) || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
