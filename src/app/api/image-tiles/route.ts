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

export async function GET() {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const projects = await prisma.imageTileProject.findMany({
            where: { userId: user.userId },
            orderBy: { updatedAt: 'desc' }
        });

        // Generate presigned URLs for images
        const projectsWithUrls = await Promise.all(projects.map(async (p: any) => {
            const data = p.data as any;
            if (data && data.minioKey) {
                const url = await getFileUrl(data.minioKey);
                return { ...p, imageUrl: url, data: { ...data, imageData: url } }; // Inject url into data for frontend compatibility if needed
            }
            return p;
        }));

        return NextResponse.json({ projects: projectsWithUrls });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const formData = await req.formData();
        const imageFile = formData.get('image') as File | null;
        const dataString = formData.get('data') as string;
        const name = formData.get('name') as string; // Optional name

        if (!dataString) {
            return NextResponse.json({ message: 'Data required' }, { status: 400 });
        }

        let configData = JSON.parse(dataString);

        if (imageFile) {
            // Upload to MinIO
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            // Use sanitized filename
            const sanitizedName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filename = `tiles/${user.userId}/${Date.now()}-${sanitizedName}`;

            await uploadFile(buffer, filename, imageFile.type);

            // Update config with key, remove base64 if present so strict DB doesn't get it
            configData.minioKey = filename;
            delete configData.imageData;
        }

        // Determine name if not provided
        const projectName = name || configData.imageFileName || `Project ${new Date().toLocaleString()}`;

        const project = await prisma.imageTileProject.create({
            data: {
                name: projectName,
                data: configData,
                userId: user.userId
            }
        });

        return NextResponse.json({ project });
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
        if (!id) return NextResponse.json({ message: 'ID requred' }, { status: 400 });

        // Find project to delete file
        const existing = await prisma.imageTileProject.findUnique({
            where: { id }
        });

        if (existing && existing.userId === user.userId) {
            const data = existing.data as any;
            if (data && data.minioKey) {
                await deleteFile(data.minioKey);
            }
            await prisma.imageTileProject.delete({
                where: { id }
            });
        }

        return NextResponse.json({ message: 'Deleted' });
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
