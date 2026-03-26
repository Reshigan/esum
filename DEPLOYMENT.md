# ESUM Energy Trading Platform - Deployment Guide

## 🚀 Cloudflare Deployment

### Prerequisites
1. Cloudflare account with Workers, Pages, D1, KV, R2, Queues, and Vectorize enabled
2. GitHub account with repository access
3. Domain configured in Cloudflare (vantax.co.za)

### Step 1: Configure Cloudflare Resources

```bash
# Login to Cloudflare
wrangler login

# Create D1 Database
wrangler d1 create energy_trading_db
# Copy the database_id from output

# Create KV Namespaces
wrangler kv:namespace create SESSIONS
wrangler kv:namespace create CACHE
wrangler kv:namespace create FEATURE_FLAGS
# Copy IDs from output

# Create R2 Buckets
wrangler r2 bucket create energy-documents
wrangler r2 bucket create energy-invoices
wrangler r2 bucket create energy-reports

# Create Queues
wrangler queues create order-processing
wrangler queues create trade-execution
wrangler queues create settlement-processing
wrangler queues create notification-dispatch

# Create Vectorize Index
wrangler vectorize create esum-search-index --dimensions=768
# Copy index_name from output
```

### Step 2: Update wrangler.toml

Replace placeholder IDs in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "energy_trading_db"
database_id = "YOUR_D1_DATABASE_ID"

[[kv_namespaces]]
binding = "SESSIONS"
id = "YOUR_KV_SESSIONS_ID"

[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_KV_CACHE_ID"

[[kv_namespaces]]
binding = "FEATURE_FLAGS"
id = "YOUR_KV_FEATURE_FLAGS_ID"

[[r2_buckets]]
binding = "DOCUMENTS"
bucket_name = "energy-documents"

[[r2_buckets]]
binding = "INVOICES"
bucket_name = "energy-invoices"

[[r2_buckets]]
binding = "REPORTS"
bucket_name = "energy-reports"

[[queues.producers]]
binding = "ORDER_QUEUE"
queue = "order-processing"

[[queues.producers]]
binding = "TRADE_QUEUE"
queue = "trade-execution"

[[queues.producers]]
binding = "SETTLEMENT_QUEUE"
queue = "settlement-processing"

[[queues.producers]]
binding = "NOTIFICATION_QUEUE"
queue = "notification-dispatch"

[[vectorize]]
binding = "SEARCH_INDEX"
index_name = "YOUR_VECTORIZE_INDEX_NAME"
```

### Step 3: Configure GitHub Secrets

In GitHub repository settings → Secrets and variables → Actions:

```
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
RESEND_API_KEY=re_xxxxx (for email)
ESKOM_SE_PUSH_TOKEN=xxxxx (optional, for Eskom data)
```

### Step 4: Deploy to Cloudflare Pages

#### Option A: Manual Deployment

```bash
cd /workspace/project/esum

# Install dependencies
pnpm install

# Build frontend
cd apps/web
pnpm run build

# Deploy to Cloudflare Pages
wrangler pages deploy .next --project-name=esum-platform
```

#### Option B: GitHub Actions (Automated)

The workflow in `.github/workflows/deploy.yml` will automatically deploy on push to main.

### Step 5: Configure Custom Domain

1. Go to Cloudflare Dashboard → Pages → esum-platform
2. Settings → Custom domains
3. Add domain: `esum.vantax.co.za`
4. Cloudflare will automatically configure DNS

### Step 6: Deploy Workers

```bash
# Deploy API Gateway
wrangler deploy apps/api-gateway/src/index.ts --name esum-api-gateway

# Deploy Trading Engine
wrangler deploy workers/trading-engine/src/index.ts --name esum-trading-engine

# Deploy Carbon Engine
wrangler deploy workers/carbon-engine/src/index.ts --name esum-carbon-engine

# Deploy Grid Integration
wrangler deploy workers/grid-integration/src/index.ts --name esum-grid-integration

# Deploy Settlement
wrangler deploy workers/settlement/src/index.ts --name esum-settlement

# Deploy Notifications
wrangler deploy workers/notifications/src/index.ts --name esum-notifications

# Deploy Admin
wrangler deploy workers/admin/src/index.ts --name esum-admin
```

### Step 7: Initialize Database

```bash
# Run migrations
pnpm run db:migrate

# Seed database
pnpm run seed
```

### Step 8: Configure Environment Variables

In Cloudflare Dashboard → Workers & Pages → esum-platform → Settings → Environment variables:

```
ENVIRONMENT=production
RESEND_API_KEY=re_xxxxx
ESKOM_SE_PUSH_TOKEN=xxxxx (optional)
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

### Step 9: Validate Deployment

#### Health Check
```bash
curl https://esum.vantax.co.za/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-26T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "d1": { "status": "healthy", "latency_ms": 5 },
    "kv": { "status": "healthy", "latency_ms": 3 },
    "r2": { "status": "healthy", "latency_ms": 8 }
  }
}
```

#### API Endpoints
```bash
# Test authentication
curl -X POST https://esum.vantax.co.za/api/v1/auth/register/org \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Org","email":"test@example.com","type":"buyer"}'

# Test instruments
curl https://esum.vantax.co.za/api/v1/instruments

# Test grid data
curl https://esum.vantax.co.za/api/grid/current
```

#### Frontend Validation
1. Visit https://esum.vantax.co.za
2. Verify landing page loads with animations
3. Test login/register flow
4. Verify dashboard loads with data
5. Test markets, carbon, auctions pages

### Step 10: Monitor Deployment

#### Cloudflare Dashboard
- Workers & Pages → esum-platform → Analytics
- Check requests, errors, and performance

#### Logs
```bash
# View worker logs
wrangler tail esum-api-gateway

# View Pages logs
wrangler pages deployment tail --project-name=esum-platform
```

### Troubleshooting

#### Common Issues

1. **D1 Database Errors**
   - Ensure database_id is correct in wrangler.toml
   - Run `wrangler d1 execute energy_trading_db --local` to test locally

2. **KV Namespace Errors**
   - Verify namespace IDs match Cloudflare dashboard
   - Check KV bindings in wrangler.toml

3. **Custom Domain Not Working**
   - Wait 24-48 hours for DNS propagation
   - Verify DNS records in Cloudflare dashboard
   - Check SSL/TLS settings

4. **Build Failures**
   - Run `pnpm install` to ensure dependencies are installed
   - Check Node.js version (requires 18+)
   - Review build logs in GitHub Actions

### Post-Deployment Checklist

- [ ] Custom domain configured (esum.vantax.co.za)
- [ ] SSL certificate active
- [ ] All workers deployed and healthy
- [ ] Database seeded with initial data
- [ ] Environment variables set
- [ ] Email notifications working (Resend)
- [ ] Grid integration fetching data
- [ ] Frontend pages loading correctly
- [ ] API endpoints responding
- [ ] Monitoring and alerts configured

---

## 📊 Production URLs

| Service | URL |
|---------|-----|
| Frontend | https://esum.vantax.co.za |
| API Gateway | https://esum-api-gateway.vantax.workers.dev |
| Trading Engine | https://esum-trading-engine.vantax.workers.dev |
| Carbon Engine | https://esum-carbon-engine.vantax.workers.dev |
| Grid Integration | https://esum-grid-integration.vantax.workers.dev |

---

**Contact:** reshigan@gonxt.tech  
**Version:** 1.0 | March 2026
