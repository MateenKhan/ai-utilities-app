import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { uploadFile, getFileUrl, deleteFile } from '@/lib/minio';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');
    if (!token) return null;
    return verifyToken(token.value);
}

export async function GET(req: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';

        const images = await prisma.savedImage.findMany({
            where: {
                userId: user.userId,
                ...(search && {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                        { category: { contains: search, mode: 'insensitive' } },
                    ]
                }),
                ...(category && {
                    category: {
                        equals: category,
                        mode: 'insensitive'
                    }
                })
            },
            orderBy: { createdAt: 'desc' }
        });

        // Generate presigned URLs for each image
        const imagesWithUrls = await Promise.all(images.map(async (img: any) => {
            const url = await getFileUrl(img.minioKey);
            return { ...img, url };
        }));

        return NextResponse.json({ images: imagesWithUrls });
    } catch (error) {
        console.error('List images error', error);
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const formData = await req.formData();
        const imageFile = formData.get('image') as File | null;
        const name = formData.get('name') as string || '';
        const description = formData.get('description') as string || '';
        const category = formData.get('category') as string || '';

        if (!imageFile) {
            return NextResponse.json({ message: 'Image file required' }, { status: 400 });
        }

        // Upload to MinIO
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const sanitizedName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `gallery/${user.userId}/${Date.now()}-${sanitizedName}`;

        await uploadFile(buffer, filename, imageFile.type);

        // Save to DB
        const savedImage = await prisma.savedImage.create({
            data: {
                name: name || imageFile.name,
                description,
                category,
                minioKey: filename,
                userId: user.userId
            }
        });

        return NextResponse.json({ image: savedImage });
    } catch (error) {
        console.error('Upload error', error);
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

        const existing = await prisma.savedImage.findUnique({
            where: { id }
        });

        if (existing && existing.userId === user.userId) {
            await deleteFile(existing.minioKey);
            await prisma.savedImage.delete({
                where: { id }
            });
            return NextResponse.json({ message: 'Deleted' });
        }

        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    } catch (error) {
        console.error('Delete error', error);
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
