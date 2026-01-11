import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return null;
    }

    try {
        const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: number };
        return decoded.userId;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

/**
 * GET /api/bookmarks
 * Fetch all bookmarks for the authenticated user
 */
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserFromToken(request);

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get query parameters for filtering
        const { searchParams } = new URL(request.url);
        const folder = searchParams.get('folder');
        const tag = searchParams.get('tag');
        const search = searchParams.get('search');

        // Build query filters
        const where: any = { userId };

        if (folder) {
            where.folder = folder;
        }

        if (tag) {
            where.tags = { has: tag };
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { url: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const bookmarks = await prisma.bookmark.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ bookmarks });
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bookmarks' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/bookmarks
 * Create a new bookmark
 */
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserFromToken(request);

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, url, folder, tags, description, favicon } = body;

        // Validate required fields
        if (!name || !url) {
            return NextResponse.json(
                { error: 'Name and URL are required' },
                { status: 400 }
            );
        }

        // Create bookmark
        const bookmark = await prisma.bookmark.create({
            data: {
                name,
                url,
                folder: folder || null,
                tags: tags || [],
                description: description || null,
                favicon: favicon || null,
                userId,
            },
        });

        return NextResponse.json({ bookmark }, { status: 201 });
    } catch (error) {
        console.error('Error creating bookmark:', error);
        return NextResponse.json(
            { error: 'Failed to create bookmark' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/bookmarks
 * Update an existing bookmark
 */
export async function PUT(request: NextRequest) {
    try {
        const userId = await getUserFromToken(request);

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { id, name, url, folder, tags, description, favicon } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Bookmark ID is required' },
                { status: 400 }
            );
        }

        // Check if bookmark exists and belongs to user
        const existingBookmark = await prisma.bookmark.findFirst({
            where: { id: parseInt(id), userId },
        });

        if (!existingBookmark) {
            return NextResponse.json(
                { error: 'Bookmark not found' },
                { status: 404 }
            );
        }

        // Update bookmark
        const bookmark = await prisma.bookmark.update({
            where: { id: parseInt(id) },
            data: {
                name: name || existingBookmark.name,
                url: url || existingBookmark.url,
                folder: folder !== undefined ? folder : existingBookmark.folder,
                tags: tags !== undefined ? tags : existingBookmark.tags,
                description: description !== undefined ? description : existingBookmark.description,
                favicon: favicon !== undefined ? favicon : existingBookmark.favicon,
            },
        });

        return NextResponse.json({ bookmark });
    } catch (error) {
        console.error('Error updating bookmark:', error);
        return NextResponse.json(
            { error: 'Failed to update bookmark' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/bookmarks
 * Delete a bookmark
 */
export async function DELETE(request: NextRequest) {
    try {
        const userId = await getUserFromToken(request);

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Bookmark ID is required' },
                { status: 400 }
            );
        }

        // Check if bookmark exists and belongs to user
        const existingBookmark = await prisma.bookmark.findFirst({
            where: { id: parseInt(id), userId },
        });

        if (!existingBookmark) {
            return NextResponse.json(
                { error: 'Bookmark not found' },
                { status: 404 }
            );
        }

        // Delete bookmark
        await prisma.bookmark.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ message: 'Bookmark deleted successfully' });
    } catch (error) {
        console.error('Error deleting bookmark:', error);
        return NextResponse.json(
            { error: 'Failed to delete bookmark' },
            { status: 500 }
        );
    }
}
