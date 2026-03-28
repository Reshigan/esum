#!/bin/bash
# ESUM Platform - Quick Deploy Script
# Usage: ./deploy.sh

set -e

echo "🚀 ESUM Platform Deployment"
echo "=========================="
echo ""

# Check if logged in to Cloudflare
echo "📝 Checking Cloudflare login..."
if ! wrangler whoami > /dev/null 2>&1; then
    echo "❌ Not logged in to Cloudflare"
    echo "👉 Run: wrangler login"
    wrangler login
fi

echo "✅ Cloudflare login confirmed"
echo ""

# Create D1 Database
echo "🗄️  Creating D1 Database..."
DB_ID=$(wrangler d1 create energy_trading_db_production --json | jq -r '.[0].uuid' || echo "")
if [ -z "$DB_ID" ]; then
    echo "⚠️  Database may already exist, using existing..."
    DB_ID=$(wrangler d1 list --json | jq -r '.[] | select(.name=="energy_trading_db_production") | .uuid')
fi
echo "✅ Database ID: $DB_ID"
echo ""

# Create KV Namespaces
echo "📦 Creating KV Namespaces..."
SESSIONS_ID=$(wrangler kv:namespace create "SESSIONS_PRODUCTION" --json | jq -r '.id' || echo "")
CACHE_ID=$(wrangler kv:namespace create "CACHE_PRODUCTION" --json | jq -r '.id' || echo "")
FEATURE_FLAGS_ID=$(wrangler kv:namespace create "FEATURE_FLAGS_PRODUCTION" --json | jq -r '.id' || echo "")
echo "✅ KV Namespaces created"
echo ""

# Create R2 Buckets
echo "📤 Creating R2 Buckets..."
wrangler r2 bucket create energy-documents-production || true
wrangler r2 bucket create energy-invoices-production || true
wrangler r2 bucket create energy-reports-production || true
wrangler r2 bucket create energy-contracts-production || true
echo "✅ R2 Buckets created"
echo ""

# Create Queues
echo "📬 Creating Queues..."
wrangler queues create order-processing-production || true
wrangler queues create trade-execution-production || true
wrangler queues create settlement-production || true
wrangler queues create notification-dispatch-production || true
echo "✅ Queues created"
echo ""

# Create Vectorize Index
echo "🔍 Creating Vectorize Index..."
wrangler vectorize create esum-search-index-production --dimensions=768 || true
echo "✅ Vectorize Index created"
echo ""

echo "🎉 Infrastructure setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update wrangler.toml with the IDs above"
echo "2. Set secrets: wrangler secret put <SECRET_NAME>"
echo "3. Run migrations: npm run db:migrate:prod"
echo "4. Deploy: npm run deploy:prod"
echo ""
