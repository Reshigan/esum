# ESUM Energy Trading Platform

<div align="center">

![ESUM Logo](https://img.shields.io/badge/ESUM-Energy%20Trading-00A86B?style=for-the-badge)

**World's First Integrated Open Market Energy Trading Platform**

[![License](https://img.shields.io/badge/License-CONFIDENTIAL-red.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Brand Identity](#brand-identity)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

**ESUM** (Energy Trading Platform) is the world's first fully integrated Open Market Energy Trading Platform enabling free-market exchange of green energy contracts and carbon credits across South Africa.

Built in partnership with **NXT Business Solutions**, **LTM Energy Group**, and **NTT DATA**, ESUM represents a paradigm shift in how energy is traded, settled, and accounted for in emerging markets.

### Key Value Propositions

- 🟢 **Green-First Marketplace** - Every contract carries verified environmental attributes
- ⚡ **Carbon-Native Design** - Carbon credits embedded into every transaction
- 🤖 **AI-Driven Intelligence** - Scenario planning and portfolio optimization
- 🔗 **Grid-Connected** - Real-time Eskom and municipal integration
- 📊 **Transparent Pricing** - Centralized price discovery mechanism
- 🔒 **Enterprise Security** - Cloudflare-grade security and compliance

---

## ✨ Features

### Trading Engine
- **Central Limit Order Book (CLOB)** - Real-time bid/ask matching
- **Auction Mechanisms** - Sealed first/second price, Dutch, and English auctions
- **OTC Negotiations** - Structured bilateral contract workspace
- **AI-Brokered Matching** - Intelligent counterparty discovery

### Energy Instruments
- Physical Power Purchase Agreements (PPAs)
- Virtual PPAs (Financial settlements)
- Renewable Energy Certificates (RECs)
- Carbon Credits (Gold Standard, Verra, CDM, SA National)
- Bundled Green Contracts (Energy + RECs + Carbon)
- Wheeling Service Agreements

### Carbon Management
- Credit registration and tokenization
- Transfer and retirement tracking
- Avoided emissions calculations
- Carbon tax liability modeling
- Full provenance and audit trail

### Grid Integration
- Real-time Eskom System Operator data
- Municipal tariff normalization (257 municipalities)
- Load-shedding stage tracking
- Time-of-Use (TOU) period awareness
- Weather data integration (Open-Meteo)

### AI Scenario Planning
- Portfolio optimization across energy mix
- Cost minimization with renewable targets
- Sensitivity analysis (tariff, carbon, generation)
- Risk scoring and counterparty assessment
- Price forecasting

### Settlement & Clearing
- Central clearing function
- Daily mark-to-market
- Escrow-based PPA settlements
- Automated invoice generation
- Dispute management workflow

### Compliance & Reporting
- NERSA licensing compliance
- Carbon Tax Act (Phase 2) alignment
- POPIA data protection
- GHG Protocol reporting
- SARS carbon tax return inputs

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ESUM Platform                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Next.js Frontend (Pages)                │    │
│  │   Dashboard | Trading | Auctions | Carbon | Reports  │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            API Gateway (Hono + Workers)              │    │
│  │         /api/v1/* - Central Router                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                  │
│  ┌────────┬─────────┬──────────┬─────────┬────────────┐     │
│  │ Auth   │ Trading │ Scenario │  Grid   │  Carbon    │     │
│  │ Worker │ Engine  │  Engine  │Integration│  Engine   │     │
│  └────────┴─────────┴──────────┴─────────┴────────────┘     │
│  ┌────────┬─────────┬──────────┬─────────┬────────────┐     │
│  │Settlement│Notify│ Reporting │ Search  │   Admin    │     │
│  │ Worker │ Worker │  Worker   │ Worker  │   Worker   │     │
│  └────────┴─────────┴──────────┴─────────┴────────────┘     │
│                            │                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Cloudflare Infrastructure                  │    │
│  │  D1 │ KV │ R2 │ Queues │ Durable Objects │ Vectorize│    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - UI library
- **TailwindCSS** - Utility-first CSS
- **Shadcn/UI** - Component library
- **Recharts** - Data visualization
- **TanStack Query** - Data fetching

### Backend
- **Cloudflare Workers** - Serverless compute
- **Hono** - Ultra-fast web framework
- **TypeScript** - Type safety
- **Zod** - Runtime validation

### Data & Storage
- **Cloudflare D1** - SQLite database
- **Cloudflare KV** - Key-value cache
- **Cloudflare R2** - Object storage
- **Drizzle ORM** - Database ORM

### Messaging & State
- **Cloudflare Queues** - Async processing
- **Durable Objects** - Stateful coordination
- **Cloudflare Vectorize** - Semantic search

### AI & ML
- **Workers AI** - On-platform inference
- **@cf/meta/llama-3-8b-instruct** - Text generation
- **@cf/baai/bge-base-en-v1.5** - Embeddings

### DevOps
- **Turborepo** - Build orchestration
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **GitHub Actions** - CI/CD
- **Wrangler** - Cloudflare CLI

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Cloudflare account
- Wrangler CLI installed

```bash
npm install -g wrangler
```

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/esum-platform.git
cd esum-platform

# Install dependencies
npm install

# Link Cloudflare account
wrangler login

# Create D1 database
wrangler d1 create energy_trading_db

# Create KV namespaces
wrangler kv:namespace create SESSIONS
wrangler kv:namespace create CACHE
wrangler kv:namespace create FEATURE_FLAGS

# Create R2 buckets
wrangler r2 bucket create energy-documents
wrangler r2 bucket create energy-invoices
wrangler r2 bucket create energy-reports

# Create Queues
wrangler queues create order-processing
wrangler queues create trade-execution
wrangler queues create settlement-processing
wrangler queues create notification-dispatch

# Create Vectorize index
wrangler vectorize create esum-search-index --dimensions=768

# Update wrangler.toml with resource IDs
# (Copy IDs from Cloudflare dashboard)

# Run database migrations
npm run db:migrate

# Seed the database
npm run seed

# Start development server
npm run dev
```

### Environment Variables

Create a `.dev.vars` file in the root:

```env
ENVIRONMENT=development
RESEND_API_KEY=re_xxxxxxxxxxxxx
CLOUDFLARE_ACCOUNT_ID=xxxxxxxxxxxxx
```

---

## 📁 Project Structure

```
esum-platform/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   ├── components/    # Page components
│   │   │   └── lib/           # Client utilities
│   │   └── public/
│   │
│   └── api-gateway/           # Central API router
│       └── src/
│           └── index.ts
│
├── workers/
│   ├── auth/                  # Authentication
│   ├── trading-engine/        # Order book & matching
│   ├── scenario-engine/       # AI scenario planning
│   ├── grid-integration/      # Eskom & municipal data
│   ├── carbon-engine/         # Carbon credits
│   ├── settlement/            # Clearing & settlement
│   ├── notifications/         # Email & push
│   ├── reporting/             # Reports & analytics
│   ├── admin/                 # Platform admin
│   └── search/                # Vectorize search
│
├── packages/
│   ├── shared-types/          # TypeScript types & Zod
│   ├── db-schema/             # Drizzle ORM schema
│   ├── ui-components/         # Shared React components
│   ├── utils/                 # Common utilities
│   └── ai-models/             # AI prompts & configs
│
├── scripts/
│   ├── seed-database.ts       # Database seeding
│   └── run-migrations.ts      # Migration runner
│
├── tests/
│   ├── e2e/                   # Playwright tests
│   └── integration/           # Worker integration tests
│
├── turbo.json                 # Turborepo config
├── wrangler.toml              # Cloudflare config
├── package.json               # Root package
└── README.md
```

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start all dev servers
npm run dev:web          # Frontend only
npm run dev:api          # API gateway only

# Build
npm run build            # Build everything
npm run build:workers    # Build workers only
npm run build:web        # Build frontend only

# Testing
npm run test             # Run all tests
npm run test:unit        # Unit tests
npm run test:e2e         # E2E tests

# Database
npm run db:migrate       # Run migrations
npm run db:generate      # Generate migrations
npm run seed             # Seed database

# Linting
npm run lint             # Lint all code
npm run typecheck        # Type check all code

# Deployment
npm run deploy           # Deploy to production
npm run deploy:staging   # Deploy to staging
```

### Local Development

```bash
# Start Miniflare (local Cloudflare emulator)
wrangler dev

# Access API at http://localhost:8787
# Health check: http://localhost:8787/health
```

---

## 🌐 Deployment

### Staging Environment

```bash
npm run deploy:staging
```

This deploys to your staging Cloudflare environment with separate D1, KV, and R2 resources.

### Production Environment

```bash
npm run deploy
```

**Note:** Production deployment requires manual approval in GitHub Actions.

### CI/CD Pipeline

The GitHub Actions pipeline runs on every push:

1. **Lint** - ESLint + Prettier
2. **Type Check** - TypeScript compilation
3. **Unit Tests** - Vitest with Miniflare
4. **Integration Tests** - Worker-to-worker tests
5. **Build** - Turborepo orchestration
6. **E2E Tests** - Playwright against preview
7. **Deploy** - Staging (auto) / Production (manual)

---

## 📖 API Documentation

### Base URL

```
Development: http://localhost:8787/api/v1
Production:  https://api.esum.energy/api/v1
```

### Authentication

```bash
# Register organisation
POST /auth/register/org
{
  "name": "Acme Corp",
  "email": "energy@acme.co.za",
  "type": "buyer"
}

# Register user
POST /auth/register/user
{
  "email": "trader@acme.co.za",
  "password": "securePassword123",
  "organisation_id": "uuid"
}

# Login
POST /auth/login
{
  "email": "trader@acme.co.za",
  "password": "securePassword123"
}

# Response
{
  "success": true,
  "data": {
    "access_token": "bearer_token",
    "expires_at": "2026-03-27T00:00:00Z",
    "user": { ... },
    "organisation": { ... }
  }
}
```

### Instruments

```bash
# List instruments
GET /instruments?type=physical_ppa&status=active

# Get instrument
GET /instruments/:id

# Create instrument
POST /instruments
Authorization: Bearer {token}
{
  "name": "Solar PPA 100MW",
  "type": "physical_ppa",
  "energy_source": "solar",
  "unit_price_zar": 0.75,
  "capacity_mw": 100
}
```

### Orders

```bash
# List orders
GET /orders?status=open

# Create order
POST /orders
Authorization: Bearer {token}
{
  "instrument_id": "uuid",
  "order_type": "bid",
  "volume_mwh": 1000,
  "limit_price_zar": 0.70
}

# Cancel order
PATCH /orders/:id/cancel
```

### Auctions

```bash
# List auctions
GET /auctions?status=open

# Get auction
GET /auctions/:id

# Place bid
POST /auctions/:id/bids
Authorization: Bearer {token}
{
  "volume_mwh": 500,
  "bid_price_zar": 0.68
}
```

### Carbon Credits

```bash
# List credits
GET /carbon/credits

# Retire credits
POST /carbon/credits/retire
Authorization: Bearer {token}
{
  "credit_ids": ["uuid1", "uuid2"],
  "beneficiary": "Acme Corp"
}
```

### Search

```bash
# Semantic search
GET /search/instruments?q=solar ppa northern cape
```

---

## 🎨 Brand Identity

ESUM has a comprehensive brand identity including:

- **Logo** - Green gradient with geometric letterforms
- **Colors** - Emerald green (#00A86B), Navy (#0A111E), Gold (#C9A12B)
- **Typography** - Instrument Serif (headings), Outfit (body)
- **Visual Elements** - Grid patterns, wave motifs, isometric illustrations

See [BRAND_IDENTITY.md](./BRAND_IDENTITY.md) for complete guidelines.

---

## 📊 Key Metrics

### Performance Targets

- **API Latency** - < 100ms p95
- **Order Matching** - < 10ms
- **Page Load** - < 2s (Lighthouse > 90)
- **Uptime** - 99.9% SLA

### Security

- **Authentication** - JWT with 24h expiry
- **Authorization** - Role-based access control
- **Encryption** - TLS 1.3 in transit, AES-256 at rest
- **Compliance** - POPIA, NERSA, Carbon Tax Act

---

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **TypeScript** - Strict mode, no `any` types
- **Formatting** - Prettier with default config
- **Linting** - ESLint with recommended rules
- **Testing** - All new features require tests
- **Documentation** - Update README and API docs

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add carbon credit retirement endpoint
fix: resolve order matching edge case
docs: update API authentication examples
test: add integration tests for settlement worker
```

---

## 📄 License

**CONFIDENTIAL** - This software is proprietary and confidential.

© 2026 NXT Business Solutions | LTM Energy Group | NTT DATA

**Author:** Reshigan Govender, CEO — GONXT Technology  
**Contact:** reshigan@gonxt.tech

---

## 🙏 Acknowledgments

- **Cloudflare** - For the excellent Workers platform
- **Hono** - For the blazing-fast web framework
- **Next.js** - For the React framework
- **Drizzle** - For the TypeScript ORM
- **Shadcn/UI** - For the beautiful components

---

<div align="center">

**ESUM Energy Trading Platform**

*Powering South Africa's Green Energy Future*

</div>