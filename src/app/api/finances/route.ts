import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');
    if (!token) return null;
    return verifyToken(token.value);
}

// GET - Fetch finances with pagination, filtering, and sorting
export async function GET(req: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            userId: user.userId,
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (category) {
            where.category = { equals: category, mode: 'insensitive' };
        }

        // Build order by clause
        const orderBy: any = {};
        orderBy[sortBy] = sortOrder;

        const [finances, total] = await Promise.all([
            prisma.finance.findMany({
                where,
                orderBy,
                skip,
                take: limit,
            }),
            prisma.finance.count({ where }),
        ]);

        return NextResponse.json({
            finances,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Fetch finances error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new finance entry
export async function POST(req: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, amount, description, category } = body;

        if (!name || amount === undefined || !category) {
            return NextResponse.json(
                { message: 'Name, amount, and category are required' },
                { status: 400 }
            );
        }

        const finance = await prisma.finance.create({
            data: {
                name,
                amount: parseFloat(amount),
                description: description || null,
                category,
                userId: user.userId,
            },
        });

        return NextResponse.json({ finance }, { status: 201 });
    } catch (error) {
        console.error('Create finance error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete multiple finance entries
export async function DELETE(req: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { message: 'IDs array is required' },
                { status: 400 }
            );
        }

        await prisma.finance.deleteMany({
            where: {
                id: { in: ids },
                userId: user.userId,
            },
        });

        return NextResponse.json({ message: 'Finances deleted successfully' });
    } catch (error) {
        console.error('Delete finances error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
