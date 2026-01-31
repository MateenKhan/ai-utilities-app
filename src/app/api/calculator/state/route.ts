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
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const state = await prisma.calculatorState.findUnique({
            where: { userId: user.userId }
        });

        return NextResponse.json({ state: state?.data || null });
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const data = await req.json();

        const state = await prisma.calculatorState.upsert({
            where: { userId: user.userId },
            update: { data },
            create: { userId: user.userId, data }
        });

        return NextResponse.json({ state: state.data });
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
