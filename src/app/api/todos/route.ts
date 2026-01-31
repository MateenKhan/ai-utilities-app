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

export async function GET() {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const todos = await prisma.todo.findMany({
            where: { userId: user.userId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ todos });
    } catch (error) {
        console.error('Failed to fetch todos:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        // Validate body?
        const { title, note, status, documents, amazonLink } = body;

        const todo = await prisma.todo.create({
            data: {
                title,
                note,
                status: status || 'todo',
                data: { documents, amazonLink }, // Store extra fields in JSON
                userId: user.userId
            }
        });

        return NextResponse.json({ todo });
    } catch (error) {
        console.error('Failed to create todo:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
