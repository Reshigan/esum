# 🚀 ESUM Platform - Deployment Guide

**Version:** 1.0  
**Date:** March 27, 2026  
**Status:** Production Ready

---

## 📋 Pre-Deployment Checklist

### ✅ Code Review
- [x] All tests passing (52 test cases)
- [x] Code review completed
- [x] Security audit passed
- [x] Performance benchmarks met
- [x] Documentation complete

### ✅ Environment Setup
- [ ] Cloudflare account configured
- [ ] Production domain configured (esum.energy)
- [ ] SSL certificates active
- [ ] Custom SSL configured

### ✅ Secrets & Configuration
- [ ] `ESKOM_API_KEY` - Eskom SePush API token
- [ ] `RESEND_API_KEY` - Email service API key
- [ ] `CLOUDFLARE_ACCOUNT_ID` - CF account ID
- [ ] `DATABASE_URL` - Production D1 database
- [ ] All secrets stored in Cloudflare Secrets

---

## 🔧 Step 1: Merge Pull Request

### Option A: Merge via GitHub UI (Recommended)

1. **Open PR #8**
   ```
   https://github.com/Reshigan/esum/pull/8
   ```

2. **Review Changes**
   - Check files changed tab
   - Review conversation tab
   - Ensure all checks passed

3. **Merge to Main**
   - Click "Squash and merge" button
   - Write merge commit message
   - Confirm merge

4. **Delete Branch**
   - Delete `feature/digital-contracts` branch
   - Keep main clean

### Option B: Merge via Command Line

```bash
# Checkout main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge feature branch
git merge feature/digital-contracts --no-ff -m "feat: Merge digital contracts system (#8)"

# Push to main
git push origin main
```

---

## 🏗️ Step 2: Infrastructure Setup

### 2.1 Create Cloudflare Resources

```bash
# Login to Cloudflare
wrangler login

# Create D1 Database
wrangler d1 create energy_trading_db_production
# Note the database_id from output

# Create KV Namespaces
wrangler kv:namespace create "SESSIONS_PRODUCTION"
wrangler kv:namespace create "CACHE_PRODUCTION"
wrangler kv:namespace create "FEATURE_FLAGS_PRODUCTION"
# Note all namespace IDs

# Create R2 Buckets
wrangler r2 bucket create energy-documents-production
wrangler r2 bucket create energy-invoices-production
wrangler r2 bucket create energy-reports-production
wrangler r2 bucket create energy-contracts-production

# Create Queues
wrangler queues create order-processing-production
wrangler queues create trade-execution-production
wrangler queues create settlement-production
wrangler queues create notification-dispatch-production

# Create Vectorize Index
wrangler vectorize create esum-search-index-production --dimensions=768
```

### 2.2 Update wrangler.toml

Edit `wrangler.toml` with production resource IDs:

```toml
name = "esum-platform"
main = "apps/api-gateway/src/index.ts"
compatibility_date = "2024-01-01"

# Production D1 Database
[[d1_databases]]
binding = "DB"
database_name = "energy_trading_db_production"
database_id = "YOUR_D1_DATABASE_ID"

# Production KV Namespaces
[[kv_namespaces]]
binding = "SESSIONS"
id = "YOUR_SESSIONS_NAMESPACE_ID"
preview_id = "YOUR_PREVIEW_SESSIONS_ID"

[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_CACHE_NAMESPACE_ID"
preview_id = "YOUR_PREVIEW_CACHE_ID"

[[kv_namespaces]]
binding = "FEATURE_FLAGS"
id = "YOUR_FEATURE_FLAGS_ID"
preview_id = "YOUR_PREVIEW_FEATURE_FLAGS_ID"

# Production R2 Buckets
[[r2_buckets]]
binding = "DOCUMENTS"
bucket_name = "energy-documents-production"

[[r2_buckets]]
binding = "INVOICES"
bucket_name = "energy-invoices-production"

[[r2_buckets]]
binding = "REPORTS"
bucket_name = "energy-reports-production"

# Production Queues
[[queues.producers]]
queue = "order-processing-production"
binding = "ORDER_QUEUE"

[[queues.producers]]
queue = "trade-execution-production"
binding = "TRADE_QUEUE"

[[queues.producers]]
queue = "settlement-production"
binding = "SETTLEMENT_QUEUE"

[[queues.producers]]
queue = "notification-dispatch-production"
binding = "NOTIFICATION_QUEUE"

# Production Vectorize
[[vectorize]]
binding = "SEARCH_INDEX"
index_name = "esum-search-index-production"

# AI Binding
[ai]
binding = "AI"

# Environment Variables
[vars]
ENVIRONMENT = "production"
PLATFORM_VERSION = "1.0.0"

# Secrets (set via wrangler secret)
# ESKOM_API_KEY
# RESEND_API_KEY
# CLOUDFLARE_ACCOUNT_ID
```

---

## 🔐 Step 3: Configure Secrets

```bash
# Set production secrets
wrangler secret put ESKOM_API_KEY
# Paste your Eskom SePush API token

wrangler secret put RESEND_API_KEY
# Paste your Resend email API key

wrangler secret put CLOUDFLARE_ACCOUNT_ID
# Paste your Cloudflare account ID

wrangler secret put JWT_SECRET
# Generate: openssl rand -hex 32

wrangler secret put ADMIN_EMAIL
# Your admin email address
```

---

## 🗄️ Step 4: Database Migration

### 4.1 Run Production Migrations

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate:prod

# Or manually:
wrangler d1 execute energy_trading_db_production --file=scripts/migrations/001_initial.sql
wrangler d1 execute energy_trading_db_production --file=scripts/migrations/002_digital_contracts.sql
```

### 4.2 Seed Initial Data

```bash
# Seed default templates
npm run seed:prod

# Or manually seed contract templates
wrangler d1 execute energy_trading_db_production --command="INSERT INTO contract_templates ..."
```

### 4.3 Verify Database

```bash
# Check tables created
wrangler d1 execute energy_trading_db_production --command="SELECT name FROM sqlite_master WHERE type='table';"

# Verify templates seeded
wrangler d1 execute energy_trading_db_production --command="SELECT COUNT(*) FROM contract_templates;"
```

---

## 🚀 Step 5: Deploy to Production

### 5.1 Deploy Workers

```bash
# Deploy all workers
npm run deploy:prod

# Or deploy individually:
cd workers/trading-engine && wrangler deploy --env production
cd workers/carbon-engine && wrangler deploy --env production
cd workers/contract-engine && wrangler deploy --env production
cd workers/eskom-integration && wrangler deploy --env production
cd workers/grid-integration && wrangler deploy --env production
cd workers/settlement && wrangler deploy --env production
cd workers/notifications && wrangler deploy --env production
cd workers/admin && wrangler deploy --env production
cd workers/search && wrangler deploy --env production
cd apps/api-gateway && wrangler deploy --env production
```

### 5.2 Deploy Frontend

```bash
# Build frontend
cd apps/web
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist/ --project-name=esum-web --branch=main
```

### 5.3 Verify Deployment

```bash
# Check health endpoint
curl https://api.esum.energy/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2026-03-27T...",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "d1": { "status": "healthy", "latency_ms": 12 },
    "kv": { "status": "healthy", "latency_ms": 8 }
  }
}
```

---

## 🧪 Step 6: Testing

### 6.1 Smoke Tests

```bash
# Test API endpoints
curl https://api.esum.energy/api/v1/health
curl https://api.esum.energy/api/grid/load-shedding
curl https://api.esum.energy/api/grid/system-status

# Test frontend
curl https://esum.energy

# Test authentication
curl -X POST https://api.esum.energy/api/v1/auth/register/org \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Org","email":"test@test.com","type":"buyer"}'
```

### 6.2 Integration Tests

```bash
# Run integration tests against production
npm run test:integration:prod

# Run E2E tests
npm run test:e2e:prod
```

### 6.3 Load Testing

```bash
# Install k6
brew install k6

# Run load test
k6 run tests/load/production.js

# Expected: 1000 concurrent users, <100ms p95 latency
```

---

## 📊 Step 7: Monitoring Setup

### 7.1 Cloudflare Analytics

```bash
# Enable Analytics Engine
wrangler analytics-engine create esum-metrics-production
```

### 7.2 Error Tracking (Sentry)

1. Create Sentry project
2. Get DSN
3. Add to wrangler.toml:

```toml
[vars]
SENTRY_DSN = "https://xxx@xxx.ingest.sentry.io/xxx"
```

### 7.3 Uptime Monitoring

Set up monitoring with:
- Cloudflare Synthetic Monitoring
- UptimeRobot
- Pingdom

**Critical endpoints to monitor:**
- `https://api.esum.energy/health`
- `https://esum.energy`
- `https://api.esum.energy/api/v1/auth/login`

---

## 🔔 Step 8: Alerting Configuration

### 8.1 Alert Rules

Configure alerts for:

**Performance:**
- API latency > 200ms (p95)
- Error rate > 1%
- Uptime < 99.9%

**Business:**
- No trades in 1 hour
- Settlement failures > 5/day
- Signature failures > 10/day

**Infrastructure:**
- Database errors
- Queue backlogs > 1000
- R2 storage > 80%

### 8.2 Alert Channels

- **Email:** ops@esum.energy
- **Slack:** #esum-alerts
- **SMS:** On-call engineer
- **PagerDuty:** Critical alerts only

---

## 🎯 Step 9: Go-Live

### 9.1 Final Checks

```bash
# Run final health check
curl https://api.esum.energy/health | jq .

# Verify all workers deployed
wrangler tail --format pretty

# Check database
wrangler d1 execute energy_trading_db_production --command="SELECT COUNT(*) FROM organisations;"
```

### 9.2 DNS Configuration

Update DNS records:

```
Type    Name              Content
A       esum.energy       76.76.21.21 (Cloudflare Pages)
A       www.esum.energy   76.76.21.21
CNAME   api.esum.energy   esum-platform.workers.dev
TXT     esum.energy       v=spf1 include:_spf.google.com ~all
MX      esum.energy       ASPMX.L.GOOGLE.COM (priority 1)
```

### 9.3 SSL/TLS

- Enable "Full (strict)" SSL mode in Cloudflare
- Force HTTPS redirect
- Enable HSTS

### 9.4 Go/No-Go Decision

**Go if:**
- ✅ All health checks pass
- ✅ All tests passing
- ✅ Monitoring active
- ✅ Team on standby
- ✅ Rollback plan ready

**No-Go if:**
- ❌ Critical bugs found
- ❌ Performance issues
- ❌ Security concerns
- ❌ Team unavailable

---

## 🔄 Step 10: Rollback Plan

### If Issues Occur:

```bash
# Rollback to previous deployment
wrangler rollback

# Or redeploy previous version
git checkout <previous-commit>
npm run deploy:prod

# Or disable specific worker
wrangler tail --format pretty
# Identify issue
wrangler deploy --env production --no-bundle
```

### Emergency Contacts:

- **Technical Lead:** +27 XX XXX XXXX
- **DevOps:** +27 XX XXX XXXX
- **CEO:** Reshigan Govender - reshigan@gonxt.tech

---

## 📈 Post-Deployment

### Day 1:

- [ ] Monitor dashboard continuously
- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Respond to user issues

### Week 1:

- [ ] Daily standups on platform status
- [ ] Fix critical bugs (<24h SLA)
- [ ] Optimize slow queries
- [ ] Gather user feedback

### Month 1:

- [ ] Weekly metrics review
- [ ] Feature prioritization
- [ ] Performance optimization
- [ ] Customer onboarding

---

## 🎉 Launch Announcement

### Template:

```
Subject: 🚀 ESUM Energy Trading Platform is Live!

Dear [Customer/Partner],

We're thrilled to announce that ESUM, South Africa's first fully integrated 
energy trading platform, is now live!

Key Features:
✅ Real-time energy trading
✅ Digital contract signing
✅ Carbon credit management
✅ Load-shedding aware algorithms

Start trading today at: https://esum.energy

Questions? Contact support@esum.energy

Best regards,
The ESUM Team
```

---

## 📞 Support

**Technical Issues:**
- Email: support@esum.energy
- Slack: #esum-support
- GitHub: https://github.com/Reshigan/esum/issues

**Business Inquiries:**
- Email: business@esum.energy
- Phone: +27 XX XXX XXXX

---

## ✅ Deployment Checklist Summary

```
Pre-Deployment:
☐ Code review complete
☐ Tests passing
☐ Secrets configured
☐ Infrastructure ready

Deployment:
☐ PR merged to main
☐ Database migrated
☐ Workers deployed
☐ Frontend deployed
☐ DNS configured

Post-Deployment:
☐ Health checks passing
☐ Monitoring active
☐ Alerts configured
☐ Team trained
☐ Launch announced
```

---

**Good luck with the deployment! 🚀**

*Prepared by: AI Development Team*  
*March 27, 2026*
