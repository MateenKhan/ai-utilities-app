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

// PUT - Update finance entry
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, amount, description, category } = body;

        // Check if finance exists and belongs to user
        const existing = await prisma.finance.findFirst({
            where: { id, userId: user.userId },
        });

        if (!existing) {
            return NextResponse.json({ message: 'Finance not found' }, { status: 404 });
        }

        const finance = await prisma.finance.update({
            where: { id },
            data: {
                name: name || existing.name,
                amount: amount !== undefined ? parseFloat(amount) : existing.amount,
                description: description !== undefined ? description : existing.description,
                category: category || existing.category,
            },
        });

        return NextResponse.json({ finance });
    } catch (error) {
        console.error('Update finance error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete single finance entry
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const deleted = await prisma.finance.deleteMany({
            where: {
                id,
                userId: user.userId,
            },
        });

        if (deleted.count === 0) {
            return NextResponse.json({ message: 'Finance not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Finance deleted successfully' });
    } catch (error) {
        console.error('Delete finance error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
