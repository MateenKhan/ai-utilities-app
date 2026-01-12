import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getAmazonConfig } from '@/utils/amazonConfig';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
        return NextResponse.json({ error: 'No code returned' }, { status: 400 });
    }

    const { clientId, clientSecret } = getAmazonConfig();
    const redirectUri = `${process.env.NEXTAUTH_URL || 'https://utility.jugaaadi.com'}/api/amazon/callback`;

    try {
        const tokenResponse = await fetch('https://api.amazon.com/auth/o2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                client_id: clientId!,
                client_secret: clientSecret!,
            }),
        });

        if (!tokenResponse.ok) {
            const error = await tokenResponse.json();
            throw new Error(error.error_description || error.error);
        }

        const tokens = await tokenResponse.json();

        // Save to local file
        const tokenPath = path.join(process.cwd(), 'amazon-tokens.json');
        await fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2));

        // Redirect to app with success
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://utility.jugaaadi.com'}/todo?amazon_connected=true`);

    } catch (error: any) {
        console.error('Token Exchange Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
