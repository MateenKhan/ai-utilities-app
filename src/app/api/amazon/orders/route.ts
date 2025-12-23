import { NextResponse } from 'next/server';
import { getAmazonConfig, getAmazonTokens } from '@/utils/amazonConfig';

export async function GET() {
    const { clientId, clientSecret } = getAmazonConfig();
    const tokens = getAmazonTokens();
    const refreshToken = tokens?.refresh_token || process.env.AMAZON_SP_REFRESH_TOKEN;

    if (!clientId || !clientSecret || clientId === 'YOUR_CLIENT_ID') {
        return NextResponse.json({
            error: 'Missing Amazon Configuration.',
            needsConfig: true
        }, { status: 401 });
    }

    if (!refreshToken || refreshToken === 'YOUR_REFRESH_TOKEN') {
        return NextResponse.json({
            error: 'Missing Amazon Config. Please click "Connect" to log in.',
            needsAuth: true
        }, { status: 401 });
    }

    try {
        // 1. Exchange LWA Refresh Token for Access Token
        const tokenResponse = await fetch('https://api.amazon.com/auth/o2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });

        if (!tokenResponse.ok) {
            const error = await tokenResponse.json();
            throw new Error(`LWA Error: ${error.error_description || error.error}`);
        }

        const { access_token } = await tokenResponse.json();

        // 2. Fetch Orders from SP-API (using EU endpoint for India)
        const spApiEndpoint = 'https://sellingpartnerapi-eu.amazon.com';
        const ordersResponse = await fetch(`${spApiEndpoint}/orders/v0/orders?CreatedAfter=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}&OrderStatuses=Unshipped,PartiallyShipped`, {
            headers: {
                'x-amz-access-token': access_token,
                'Content-Type': 'application/json',
            },
        });

        if (!ordersResponse.ok) {
            const error = await ordersResponse.json();
            throw new Error(`SP-API Error: ${JSON.stringify(error)}`);
        }

        const ordersData = await ordersResponse.json();
        return NextResponse.json({ orders: ordersData.payload.Orders });

    } catch (error: any) {
        console.error('Amazon Sync Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
