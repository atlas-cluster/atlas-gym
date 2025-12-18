# Deployment Guide

## Overview

This application uses an improved deployment process designed to minimize downtime and ensure safe deployments with automatic rollback capabilities.

## Key Improvements

### 1. Zero-Downtime Deployments
- **Rolling Updates**: New containers start before old ones are stopped
- **Health Checks**: Automatic verification that new deployment is working before switching traffic
- **No Volume Destruction**: Database volumes are preserved during deployments

### 2. Data Safety
- **Preserved Volumes**: Database data is never destroyed during deployment (`-v` flag removed)
- **Proper Volume Mounting**: Database data mounted to `/var/lib/postgresql/data` for persistence
- **Backup Strategy**: Current container is backed up before deployment

### 3. Faster Deployments
- **Build Caching**: Docker build cache is utilized (removed `--no-cache` flag)
- **Incremental Updates**: Only changed files are rebuilt
- **Layer Caching**: BuildKit inline cache for faster builds

### 4. Health Monitoring
- **Application Health Endpoint**: `/api/health` checks database connectivity and app readiness
- **Docker Health Checks**: Built-in container health monitoring
- **Deployment Validation**: 120-second grace period for health checks to pass

### 5. Rollback Capability
- **Automatic Rollback**: If health checks fail, automatically reverts to previous version
- **Version Tagging**: Each deployment tagged with git commit SHA
- **Backup Images**: Previous container state preserved for quick rollback

## Architecture Changes

### Health Check Endpoint

**New endpoint**: `GET /api/health`

Returns application health status including database connectivity:

```json
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "pass",
      "message": "Database connection successful"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Docker Compose Updates

1. **Added health checks for app container**:
   - Uses custom healthcheck script
   - 30-second startup grace period
   - 10-second check intervals

2. **Build optimization**:
   - BuildKit inline caching enabled
   - Image tagging with commit SHA

3. **Volume improvements**:
   - Explicit `/var/lib/postgresql/data` path
   - Named volume with local driver

### Deployment Workflow

The deployment process now follows these steps:

1. **Checkout and prepare**: Get latest code and create environment file
2. **Copy files**: Sync files to server (no destructive deletion)
3. **Build image**: Build with caching enabled and version tagging
4. **Backup current state**: Create backup image of running container
5. **Update services**: Update database and other dependencies
6. **Run migrations**: Apply database migrations via Flyway
7. **Deploy new version**: Start new container
8. **Health check**: Wait up to 120 seconds for health checks to pass
9. **Validate or rollback**: 
   - If healthy: Complete deployment
   - If unhealthy: Automatic rollback to backup
10. **Cleanup**: Remove old backup images and dangling images

## Deployment Process

### Automatic Deployment

Deployments trigger automatically on pushes to `main` branch:

```bash
git push origin main
```

### Manual Deployment

Trigger deployment manually via GitHub Actions:
1. Go to Actions tab in GitHub
2. Select "Deploy to Production" workflow
3. Click "Run workflow"

### Monitoring Deployment

Watch the deployment progress in GitHub Actions:
- Build logs show image creation
- Health check status indicates when app is ready
- Rollback messages appear if deployment fails

## Rollback

### Automatic Rollback

If a deployment fails health checks, the system automatically:
1. Stops the failed container
2. Restores the backup image
3. Starts the previous working version

### Manual Rollback

To manually rollback to a previous version:

```bash
# SSH to server
ssh user@server

# List available backup images
docker images | grep atlas-gym-app | grep backup

# Stop current container
docker stop atlas-gym-app-prod
docker rm atlas-gym-app-prod

# Start backup version
docker run -d \
  --name atlas-gym-app-prod \
  --network atlas-network \
  -p 3000:3000 \
  atlas-gym-app:backup-YYYYMMDD-HHMMSS
```

## Health Check Monitoring

### Check Application Health

```bash
# From server
curl http://localhost:3000/api/health

# From outside
curl http://your-server:3000/api/health
```

### Check Container Health

```bash
docker ps --filter "name=atlas-gym"
# Look at STATUS column for health status
```

### View Health Check Logs

```bash
docker inspect atlas-gym-app-prod | grep -A 10 Health
```

## Troubleshooting

### Deployment Fails Health Check

1. Check container logs:
   ```bash
   docker logs atlas-gym-app-prod
   ```

2. Check health endpoint manually:
   ```bash
   docker exec atlas-gym-app-prod bun run /app/healthcheck.js
   ```

3. Check database connectivity:
   ```bash
   docker exec atlas-gym-postgres-prod pg_isready -U your_user -d your_db
   ```

### Database Connection Issues

1. Verify database is healthy:
   ```bash
   docker ps --filter "name=postgres"
   ```

2. Check database logs:
   ```bash
   docker logs atlas-gym-postgres-prod
   ```

3. Test connection:
   ```bash
   docker exec atlas-gym-app-prod curl http://localhost:3000/api/health
   ```

### Build Performance Issues

If builds are slow:

1. Check Docker BuildKit is enabled:
   ```bash
   docker buildx version
   ```

2. Prune build cache if needed:
   ```bash
   docker builder prune
   ```

3. Check available disk space:
   ```bash
   df -h
   ```

## Best Practices

1. **Always test in development first**: Use `docker-compose.dev.yml` to test changes
2. **Monitor deployments**: Watch GitHub Actions logs during deployment
3. **Keep backups**: Old backup images are automatically retained (last 2)
4. **Regular maintenance**: Periodically prune unused images and containers
5. **Database backups**: Implement regular database backups outside of deployment process

## Comparison: Old vs New Deployment

| Aspect | Old Process | New Process |
|--------|-------------|-------------|
| Downtime | Full downtime (stop → build → start) | Minimal (rolling update) |
| Data Safety | Risk of data loss (`-v` flag) | Data preserved |
| Build Time | Slow (no caching) | Fast (with caching) |
| Health Check | None | Automatic verification |
| Rollback | Manual intervention required | Automatic on failure |
| File Sync | Destructive `rm -rf` | Incremental sync |
| Database | Destroyed & recreated | Persistent across deployments |

## Security Considerations

1. **Health endpoint**: Consider adding authentication for production
2. **Secrets**: All sensitive data stored in GitHub Secrets
3. **SSH keys**: Deployment uses SSH key authentication
4. **Container security**: Running as non-root user (nextjs)

## Future Enhancements

Potential improvements for consideration:

1. **Monitoring integration**: Prometheus/Grafana for metrics
2. **Database backup automation**: Automated backups before deployment
3. **Canary deployments**: Gradual traffic shifting to new versions
4. **Multi-region deployment**: Geographic redundancy
5. **Blue-green deployment**: For even more advanced zero-downtime scenarios
