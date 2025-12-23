import fs from 'fs';
import path from 'path';

export interface AmazonConfig {
    clientId: string | undefined;
    clientSecret: string | undefined;
    refreshToken: string | undefined;
    region: string | undefined;
}

export function getAmazonConfig(): AmazonConfig {
    // 1. Try Environment Variables
    const envConfig = {
        clientId: process.env.AMAZON_SP_CLIENT_ID,
        clientSecret: process.env.AMAZON_SP_CLIENT_SECRET,
        refreshToken: process.env.AMAZON_SP_REFRESH_TOKEN,
        region: process.env.AMAZON_SP_REGION || 'eu-west-1',
    };

    if (envConfig.clientId && envConfig.clientId !== 'YOUR_CLIENT_ID' && envConfig.clientSecret) {
        return envConfig;
    }

    // 2. Try Local Config File
    try {
        const configPath = path.join(process.cwd(), 'amazon-config.json');
        if (fs.existsSync(configPath)) {
            const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return {
                clientId: fileConfig.clientId,
                clientSecret: fileConfig.clientSecret,
                refreshToken: envConfig.refreshToken, // Tokens still might be in env? No, usually tokens are separate.
                region: envConfig.region,
            };
        }
    } catch (e) {
        console.error('Failed to read amazon-config.json', e);
    }

    return envConfig;
}

export function getAmazonTokens() {
    try {
        const tokenPath = path.join(process.cwd(), 'amazon-tokens.json');
        if (fs.existsSync(tokenPath)) {
            return JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
        }
    } catch (e) {
        return null;
    }
    return null;
}
