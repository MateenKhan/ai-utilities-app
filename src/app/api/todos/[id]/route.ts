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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const { title, note, status, documents, amazonLink } = body;

        // Verify ownership
        const existing = await prisma.todo.findUnique({
            where: { id },
        });

        if (!existing || existing.userId !== user.userId) {
            return NextResponse.json({ message: 'Not found' }, { status: 404 });
        }

        const updated = await prisma.todo.update({
            where: { id },
            data: {
                title,
                note,
                status,
                data: { documents, amazonLink }
            }
        });

        return NextResponse.json({ todo: updated });
    } catch (error) {
        console.error('Failed to update todo:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;

        const existing = await prisma.todo.findUnique({
            where: { id },
        });

        if (!existing || existing.userId !== user.userId) {
            return NextResponse.json({ message: 'Not found' }, { status: 404 });
        }

        await prisma.todo.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Deleted' });
    } catch (error) {
        console.error('Failed to delete todo:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
