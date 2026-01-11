import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');
    if (!token) return null;
    return verifyToken(token.value);
}

export async function GET() {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const history = await prisma.calculatorHistory.findMany({
            where: { userId: user.userId },
            orderBy: { timestamp: 'desc' },
            take: 50
        });

        return NextResponse.json({ history });
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { expression, result } = await req.json();

        const entry = await prisma.calculatorHistory.create({
            data: {
                expression,
                result,
                userId: user.userId
            }
        });

        return NextResponse.json({ entry });
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await prisma.calculatorHistory.deleteMany({
            where: { userId: user.userId }
        });

        return NextResponse.json({ message: 'Cleared' });
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
