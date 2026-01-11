# 🚀 Coolify Deployment - Quick Start

Deploy your Utilities App to **utility.jugaaadi.com** on port **9000** using Coolify.

## ⚡ Quick Deploy (5 Minutes)

### 1️⃣ Generate Secrets

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

Save these values - you'll need them in step 3.

### 2️⃣ Push to Git

```bash
git add .
git commit -m "Add Coolify deployment configuration"
git push origin main
```

### 3️⃣ Configure in Coolify

1. **Create New Application** in Coolify
2. **Connect your Git repository**
3. **Set Build Pack**: `Dockerfile`
4. **Set Port**: `9000`
5. **Set Domain**: `utility.jugaaadi.com`
6. **Add Environment Variables**:

```env
NODE_ENV=production
PORT=9000
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@postgres:5432/utilities_db
JWT_SECRET=YOUR_GENERATED_SECRET_FROM_STEP_1
NEXTAUTH_SECRET=YOUR_GENERATED_SECRET_FROM_STEP_1
NEXTAUTH_URL=https://utility.jugaaadi.com
```

7. **Set Pre-deployment Command** (optional):
```bash
npx prisma generate && npx prisma migrate deploy
```

8. **Click Deploy** 🎉

### 4️⃣ Verify

```bash
curl https://utility.jugaaadi.com/api/health
```

Should return: `{"status":"healthy",...}`

---

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide with troubleshooting
- **[COOLIFY_SETUP.md](./COOLIFY_SETUP.md)** - Coolify-specific configuration reference
- **[DEPLOYMENT_FILES.md](./DEPLOYMENT_FILES.md)** - Overview of all deployment files

---

## 📁 Deployment Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage Docker build configuration |
| `.dockerignore` | Excludes unnecessary files from build |
| `docker-compose.yml` | Local testing & service orchestration |
| `env.production.example` | Environment variables template |
| `start.sh` | Startup script with migrations |
| `DEPLOYMENT.md` | Complete deployment guide |
| `COOLIFY_SETUP.md` | Quick reference for Coolify |

---

## 🔧 Configuration Summary

- **Domain**: utility.jugaaadi.com
- **Port**: 9000
- **Database**: PostgreSQL 16
- **Node**: 20 (Alpine)
- **SSL**: Auto-configured by Coolify

---

## 🆘 Troubleshooting

### Build Fails
- Check Coolify build logs
- Verify all environment variables are set
- Ensure `output: 'standalone'` is in `next.config.ts`

### Can't Connect to Database
- Verify `DATABASE_URL` format
- Ensure PostgreSQL is running
- Check network connectivity

### Health Check Fails
- Wait 30-60 seconds after deployment
- Check application logs in Coolify
- Verify port 9000 is accessible

**For detailed troubleshooting**, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🔐 Security Checklist

- ✅ Strong secrets generated (32+ characters)
- ✅ Environment variables not committed to Git
- ✅ HTTPS enabled (Coolify auto-configures)
- ✅ Database credentials secured
- ✅ Running as non-root user in Docker

---

## 📊 Monitoring

- **Health**: https://utility.jugaaadi.com/api/health
- **Logs**: Coolify Dashboard → Your App → Logs
- **Metrics**: Coolify Dashboard → Your App → Metrics

---

## 🔄 Update Deployment

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Then in Coolify: Click **"Redeploy"**

---

## 💡 Tips

1. **Test locally first**: `docker build -t utilities-app . && docker run -p 9000:9000 utilities-app`
2. **Use Coolify's database**: Easier than managing your own PostgreSQL
3. **Enable auto-deploy**: Coolify can auto-deploy on Git push
4. **Monitor logs**: Check Coolify logs if anything goes wrong
5. **Backup database**: Set up regular backups in Coolify

---

## 📞 Need Help?

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
2. Review Coolify logs for errors
3. Verify environment variables are correct
4. Test health endpoint: `curl https://utility.jugaaadi.com/api/health`

---

**Ready to deploy?** Follow the [Quick Deploy](#-quick-deploy-5-minutes) steps above! 🚀
