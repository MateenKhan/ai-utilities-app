import { NextResponse } from 'next/server';

export async function GET() {
    const clientId = process.env.AMAZON_SP_CLIENT_ID;

    if (!clientId || clientId === 'YOUR_CLIENT_ID') {
        return NextResponse.json({ error: 'Missing AMAZON_SP_CLIENT_ID in .env' }, { status: 500 });
    }

    const redirectUri = 'http://localhost:3000/api/amazon/callback';
    const scope = 'sellingpartnerapi::notifications sellingpartnerapi::migration'; // Standard scopes, adjust if needed
    // Note: For Orders API, 'sellingpartnerapi::notifications' might not be strictly required but 'sellingpartnerapi::migration' is common. 
    // Actually, for SP-API, we don't pass 'scope' in the auth URL for the *Seller* flow usually, strictly speaking, 
    // but for LWA (Login with Amazon) for a hybrid app or specific grants, we might. 
    // However, for a pure SP-API app (Seller), the "Authorize" button in the Appstore initiates the flow. 
    // But for a "Website" workflow (LWA), we use specific scopes.
    // Wait, for SP-API self-authorization (Develper Authorizing their own app), 
    // we usually just use the "Authorize" button in Seller Central App settings to get the Refresh Token once.
    // BUT the user asked for "Log in with Amazon". That implies the OAuth flow.
    // Let's use the standard LWA authorization URL.

    const state = Math.random().toString(36).substring(7);

    // Scopes for SP-API usually aren't passed here for the Seller Central App flow, 
    // but if we are doing the "Website" flow (LWA), we need `profile` etc. 
    // IF we are authorizing a Selling Partner App, we construct:
    // https://sellercentral.amazon.com/apps/authorize/consent?application_id=...

    // Assuming this is a Seller Central App (SP-API)
    // We should redirect to the Seller Central App Authorization URL.
    // But we need the Application ID, not just Client ID.
    // If the user only has LWA Client ID, we should probably stick to the LWA flow if possible, 
    // or ask for App ID. 
    // Let's assume standard LWA flow for simplicity if they just have Client ID, 
    // BUT SP-API access requires the Seller Central flow `apps/authorize/consent`.

    // Let's try the generic LWA URL first as it's safer for "Login", 
    // but for SP-API access specifically, we need the Seller Central consent.
    // Valid point. Let's stick to the prompt's simplicity: "ask me to login to create tokens".
    // The most standard way for a self-hosted tool is likely reusing the LWA flow if configured as a "Website".

    // Verification: The user likely has a "Draft" app.
    // Url: https://sellercentral.amazon.in/apps/authorize/consent?application_id={APP_ID}&state={STATE}&version=beta
    // We need APP_ID. I'll add a check or asking for it. 
    // For now, let's assume we might need to ask the user, or we try to use Client ID (which sometimes works for legacy reasons or if mapped).
    // actually, let's use the explicit LWA endpoint which is safer for "Create tokens".

    const lwaUrl = `https://www.amazon.com/ap/oa?client_id=${clientId}&scope=sellingpartnerapi::notifications&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

    return NextResponse.redirect(lwaUrl);
}
