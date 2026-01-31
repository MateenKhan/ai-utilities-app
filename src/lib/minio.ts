import * as Minio from 'minio';

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || '',
    secretKey: process.env.MINIO_SECRET_KEY || '',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'utilities-app';

export const uploadFile = async (buffer: Buffer, filename: string, contentType: string) => {
    try {
        const exists = await minioClient.bucketExists(BUCKET_NAME);
        if (!exists) {
            await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
        }
    } catch (err) {
        console.error('Error checking/creating bucket', err);
    }

    await minioClient.putObject(BUCKET_NAME, filename, buffer, buffer.length, {
        'Content-Type': contentType
    });

    return filename;
};

export const getFileUrl = async (filename: string) => {
    try {
        return await minioClient.presignedGetObject(BUCKET_NAME, filename, 24 * 60 * 60);
    } catch (error) {
        console.error('Error generating presigned url', error);
        return null;
    }
};

export const deleteFile = async (filename: string) => {
    try {
        await minioClient.removeObject(BUCKET_NAME, filename);
    } catch (err) {
        console.error('Error deleting file', err);
    }
};
