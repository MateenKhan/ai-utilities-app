import { NextResponse } from 'next/server';

export async function GET() {
    const clientId = process.env.AMAZON_SP_CLIENT_ID;
    const clientSecret = process.env.AMAZON_SP_CLIENT_SECRET;
    const refreshToken = process.env.AMAZON_SP_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken || clientId === 'YOUR_CLIENT_ID') {
        // Return mock data for demonstration if credentials aren't set
        return NextResponse.json({
            orders: [
                {
                    AmazonOrderId: '111-0000000-0000001',
                    PurchaseDate: new Date().toISOString(),
                    OrderStatus: 'Unshipped',
                    OrderTotal: { Amount: '150.00', CurrencyCode: 'INR' },
                    BuyerInfo: { BuyerName: 'Mock Buyer 1' },
                    // SP-API doesn't return product names in the Orders API (only Order Items API), 
                    // but for simplicity in this mock we'll assume we fetched items too or user will fill it.
                    // To get product details requires a second call to /orders/v0/orders/{orderId}/orderItems
                    // For now, we'll return a generic title or placeholder.
                    Title: 'Mock Amazon Product A'
                },
                {
                    AmazonOrderId: '222-0000000-0000002',
                    PurchaseDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                    OrderStatus: 'Unshipped',
                    OrderTotal: { Amount: '299.00', CurrencyCode: 'INR' },
                    BuyerInfo: { BuyerName: 'Mock Buyer 2' },
                    Title: 'Mock Amazon Product B'
                }
            ],
            mock: true
        });
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
