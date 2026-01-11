import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
    const connectionString = process.env.DATABASE_URL;
    return new PrismaClient({
        datasources: {
            db: {
                url: connectionString,
            },
        },
    });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
