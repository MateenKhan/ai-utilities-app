import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { clientId, clientSecret } = await request.json();

        if (!clientId || !clientSecret) {
            return NextResponse.json({ error: 'Client ID and Secret are required' }, { status: 400 });
        }

        const configPath = path.join(process.cwd(), 'amazon-config.json');
        const config = {
            clientId,
            clientSecret
        };

        await fs.writeFile(configPath, JSON.stringify(config, null, 2));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Save Config Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
