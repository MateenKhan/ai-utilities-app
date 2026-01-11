# Deployment Guide for Coolify

This guide will help you deploy the Utilities App to your VPS using Coolify with the domain `utility.jugaaadi.com` on port 9000.

## Prerequisites

- Coolify installed on your VPS
- Domain `utility.jugaaadi.com` pointing to your VPS IP
- Git repository access
- PostgreSQL database (can be managed by Coolify)

## Files Overview

The following files have been created for deployment:

1. **Dockerfile** - Multi-stage Docker build configuration
2. **docker-compose.yml** - Service orchestration (optional, Coolify can manage this)
3. **.dockerignore** - Excludes unnecessary files from Docker build
4. **env.production.example** - Template for environment variables
5. **next.config.ts** - Updated with `output: 'standalone'` for optimized Docker builds
6. **src/app/api/health/route.ts** - Health check endpoint for monitoring

## Deployment Steps

### Step 1: Prepare Your Repository

1. Commit all the new deployment files to your Git repository:
   ```bash
   git add Dockerfile .dockerignore docker-compose.yml env.production.example next.config.ts src/app/api/health/route.ts
   git commit -m "Add deployment configuration for Coolify"
   git push origin main
   ```

### Step 2: Set Up in Coolify

1. **Log in to Coolify** on your VPS
2. **Create a New Application**:
   - Click "New Resource" → "Application"
   - Select "Public Repository" or connect your Git provider
   - Enter your repository URL

3. **Configure Build Settings**:
   - Build Pack: **Dockerfile**
   - Dockerfile Location: `./Dockerfile`
   - Build Context: `.`

4. **Configure Port**:
   - Port: **9000**
   - Exposed Port: **9000**

5. **Configure Domain**:
   - Domain: `utility.jugaaadi.com`
   - Enable HTTPS (Coolify will auto-generate SSL certificate)

### Step 3: Set Environment Variables

In Coolify's environment variables section, add the following (use `env.production.example` as reference):

#### Required Variables:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@postgres:5432/utilities_db

# Application
NODE_ENV=production
PORT=9000

# Authentication & Security
JWT_SECRET=your_jwt_secret_key_here_min_32_chars
NEXTAUTH_SECRET=your_nextauth_secret_key_here_min_32_chars
NEXTAUTH_URL=https://utility.jugaaadi.com

# Amazon API (if applicable)
AMAZON_CLIENT_ID=your_amazon_client_id
AMAZON_CLIENT_SECRET=your_amazon_client_secret
AMAZON_REDIRECT_URI=https://utility.jugaaadi.com/api/amazon/callback
```

**Important Notes:**
- Generate secure random strings for `JWT_SECRET` and `NEXTAUTH_SECRET` (minimum 32 characters)
- You can generate secrets using: `openssl rand -base64 32`
- Update `DATABASE_URL` with your actual database credentials

### Step 4: Set Up PostgreSQL Database

**Option A: Use Coolify's Database Service**
1. In Coolify, create a new PostgreSQL database
2. Note the connection details
3. Update `DATABASE_URL` in your environment variables

**Option B: Use External Database**
1. Set up PostgreSQL on your VPS or use a managed service
2. Create a database named `utilities_db`
3. Update `DATABASE_URL` accordingly

### Step 5: Configure Build Command (Optional)

If Coolify needs custom build commands, add:

**Pre-deployment command:**
```bash
npx prisma generate && npx prisma migrate deploy
```

This ensures Prisma client is generated and migrations are applied.

### Step 6: Deploy

1. Click **"Deploy"** in Coolify
2. Monitor the build logs
3. Wait for deployment to complete

### Step 7: Verify Deployment

1. **Check Health Endpoint**:
   ```bash
   curl https://utility.jugaaadi.com/api/health
   ```
   Should return: `{"status":"healthy","timestamp":"...","uptime":...}`

2. **Visit Your Application**:
   Open `https://utility.jugaaadi.com` in your browser

## Database Migrations

To run Prisma migrations after deployment:

1. Access your container via Coolify's terminal or SSH
2. Run:
   ```bash
   npx prisma migrate deploy
   ```

Or set up automatic migrations in the pre-deployment command.

## Troubleshooting

### Build Fails

- Check Coolify build logs for errors
- Ensure all environment variables are set correctly
- Verify Dockerfile syntax

### Application Won't Start

- Check if port 9000 is available
- Verify DATABASE_URL is correct
- Check application logs in Coolify

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify DATABASE_URL format: `postgresql://user:password@host:port/database`
- Check network connectivity between containers

### SSL/HTTPS Issues

- Ensure domain DNS is pointing to your VPS
- Wait for SSL certificate generation (can take a few minutes)
- Check Coolify's proxy settings

## Monitoring

- **Health Check**: `https://utility.jugaaadi.com/api/health`
- **Logs**: Available in Coolify dashboard
- **Metrics**: Monitor CPU, memory, and network usage in Coolify

## Updating the Application

1. Push changes to your Git repository
2. In Coolify, click **"Redeploy"**
3. Coolify will pull latest changes and rebuild

## Rollback

If deployment fails:
1. Go to Coolify dashboard
2. Select your application
3. Click on "Deployments" tab
4. Choose a previous successful deployment
5. Click "Redeploy"

## Security Checklist

- ✅ Environment variables are set (not hardcoded)
- ✅ Strong JWT_SECRET and NEXTAUTH_SECRET
- ✅ HTTPS enabled via Coolify
- ✅ Database credentials are secure
- ✅ .env files are in .gitignore
- ✅ Only necessary ports are exposed

## Performance Optimization

The Dockerfile uses multi-stage builds to:
- Minimize final image size
- Include only production dependencies
- Optimize build caching
- Run as non-root user for security

## Support

If you encounter issues:
1. Check Coolify documentation: https://coolify.io/docs
2. Review application logs in Coolify
3. Verify all environment variables are set correctly
4. Check database connectivity

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Coolify Documentation](https://coolify.io/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
