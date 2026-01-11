# Coolify Quick Configuration

## Application Settings

**Type**: Docker
**Build Pack**: Dockerfile
**Port**: 9000
**Domain**: utility.jugaaadi.com

## Build Configuration

```yaml
Build Method: Dockerfile
Dockerfile Path: ./Dockerfile
Build Context: .
```

## Environment Variables (Copy to Coolify)

```env
NODE_ENV=production
PORT=9000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@postgres:5432/utilities_db
JWT_SECRET=GENERATE_32_CHAR_SECRET
NEXTAUTH_SECRET=GENERATE_32_CHAR_SECRET
NEXTAUTH_URL=https://utility.jugaaadi.com
AMAZON_CLIENT_ID=YOUR_AMAZON_CLIENT_ID
AMAZON_CLIENT_SECRET=YOUR_AMAZON_CLIENT_SECRET
AMAZON_REDIRECT_URI=https://utility.jugaaadi.com/api/amazon/callback
```

## Generate Secrets

Run these commands to generate secure secrets:

```bash
# For JWT_SECRET
openssl rand -base64 32

# For NEXTAUTH_SECRET
openssl rand -base64 32
```

## Pre-deployment Command

```bash
npx prisma generate && npx prisma migrate deploy
```

## Health Check Endpoint

```
https://utility.jugaaadi.com/api/health
```

## PostgreSQL Database Setup (if using Coolify DB)

1. Create new PostgreSQL database in Coolify
2. Database Name: `utilities_db`
3. Copy connection string to `DATABASE_URL`

## Post-Deployment Verification

```bash
# Test health endpoint
curl https://utility.jugaaadi.com/api/health

# Should return:
# {"status":"healthy","timestamp":"...","uptime":...}
```

## Common Issues

### Issue: Build fails with "output: standalone" error
**Solution**: Ensure Next.js version is 12.0.0 or higher

### Issue: Database connection refused
**Solution**: Check DATABASE_URL format and ensure PostgreSQL is running

### Issue: Port 9000 already in use
**Solution**: Stop conflicting service or change PORT in environment variables

## Deployment Checklist

- [ ] Repository pushed to Git
- [ ] All environment variables set in Coolify
- [ ] Database created and accessible
- [ ] Domain DNS pointing to VPS
- [ ] SSL certificate configured (auto by Coolify)
- [ ] Pre-deployment command configured
- [ ] Health check endpoint working
