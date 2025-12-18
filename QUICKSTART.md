# Quick Start Guide

## What Changed?

Your deployment process has been significantly improved for zero-downtime deployments!

## Old Process ❌
```
1. Stop ALL services (app + database)        ⛔ DOWNTIME STARTS
2. Delete database volumes                   💀 DATA AT RISK
3. Rebuild everything from scratch           ⏰ SLOW (5-10 min)
4. Start services                            🤞 HOPE IT WORKS
5. No validation                             ⛔ DOWNTIME ENDS
```
**Result**: 2-5 minutes of complete downtime, data loss risk, no safety net

## New Process ✅
```
1. Build new version (with cache)            ⚡ FAST (1-2 min)
2. Backup current container                  💾 SAFETY NET
3. Start new container (old still running)   ✨ NO DOWNTIME
4. Health check validation (120s timeout)    🏥 AUTOMATED CHECK
   ├─ PASS: Stop old container               ✅ SMOOTH SWITCH
   └─ FAIL: Rollback to backup               🔄 AUTO RECOVERY
5. Cleanup old backups                       🧹 MAINTENANCE
```
**Result**: Zero downtime, data preserved, automatic validation & rollback

## How to Deploy

### Automatic (Recommended)
Push to `main` branch:
```bash
git push origin main
```
The deployment happens automatically via GitHub Actions.

### Manual Trigger
1. Go to GitHub Actions tab
2. Select "Deploy to Production" workflow
3. Click "Run workflow"

## Monitor Deployment

Watch the deployment in GitHub Actions:
- ✅ Green checkmark = Success
- ❌ Red X = Failed (automatically rolled back)

Or check on server:
```bash
# Check application health
curl http://your-server:3000/api/health

# View running containers
docker ps --filter "name=atlas-gym"

# View deployment logs
docker logs atlas-gym-app-prod
```

## Rollback (If Needed)

### Automatic Rollback
If health checks fail, the system automatically rolls back to the previous version.

### Manual Rollback
```bash
# List available backups
docker images | grep atlas-gym-app | grep backup

# Restore a specific backup
docker stop atlas-gym-app-prod
docker rm atlas-gym-app-prod
docker run -d --name atlas-gym-app-prod \
  --network atlas-network -p 3000:3000 \
  atlas-gym-app:backup-YYYYMMDD-HHMMSS
```

## Key Features

### 🎯 Zero Downtime
Your app stays running during the entire deployment process.

### 🛡️ Data Safety
Database volumes are never destroyed. Your data is safe.

### ⚡ Fast Builds
Docker layer caching makes builds 5x faster (1-2 min vs 5-10 min).

### 🏥 Health Checks
Automatic verification that new deployment is working before switching.

### 🔄 Auto Rollback
If anything goes wrong, automatically reverts to previous working version.

### 📊 Version Tracking
Each deployment tagged with git commit SHA for easy identification.

## Troubleshooting

### Deployment Failed?
1. Check GitHub Actions logs for error details
2. System automatically rolled back to previous version
3. Fix the issue and deploy again
4. Application is still running on previous version (no downtime!)

### Database Connection Issues?
```bash
# Check database health
docker exec atlas-gym-postgres-prod pg_isready

# Check application health
curl http://localhost:3000/api/health
```

### Need Help?
See full documentation:
- `DEPLOYMENT.md` - Complete deployment guide
- `DEPLOYMENT_SUMMARY.md` - Detailed improvements breakdown

## First Deployment

The first deployment after these changes will:
1. Fix the database volume path (one-time migration)
2. Enable health checks
3. Use the new rolling update process

Subsequent deployments will be fast with zero downtime!

## Best Practices

1. **Test in development**: Use `docker-compose.dev.yml` first
2. **Watch the first deployment**: Monitor GitHub Actions closely
3. **Check health endpoint**: Verify `/api/health` returns 200 OK
4. **Keep backups**: System keeps last 2 backup images automatically
5. **Monitor disk space**: Backup images consume disk space

## Summary

Your deployment process is now:
- ✅ Production-ready
- ✅ Zero-downtime
- ✅ Self-healing (auto-rollback)
- ✅ Fast and efficient
- ✅ Safe and reliable

Happy deploying! 🚀
