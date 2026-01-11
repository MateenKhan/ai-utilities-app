import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Docker container monitoring
 * Returns 200 OK if the application is running properly
 */
export async function GET() {
    try {
        // You can add additional health checks here
        // For example: database connection check, external service checks, etc.

        return NextResponse.json(
            {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 503 }
        );
    }
}
