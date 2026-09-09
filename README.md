# AuditPulse — Web & Security Audit Agency

## Overview
Launch-ready website and security audits for AI-built apps, vibe-coded projects, and startups.

## Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Vercel Postgres
- **Storage:** Vercel Blob (PDF reports)
- **Auth:** NextAuth.js
- **Payments:** Stripe
- **Hosting:** Vercel

## Project Structure
```
audit-agency/
├── app/
│   ├── page.tsx               # Landing page + free teaser
│   ├── layout.tsx             # Root layout
│   ├── dashboard/page.tsx     # Client dashboard
│   ├── pricing/page.tsx       # Pricing page
│   └── api/
│       ├── audit/
│       │   ├── quick/route.ts # Free 5-point audit
│       │   └── full/route.ts  # Paid 90-checkpoint audit
│       ├── checkout/route.ts  # Stripe checkout
│       └── webhooks/stripe/route.ts
├── components/
│   ├── FreeAuditWidget.tsx    # Free URL scanner
│   ├── PricingTable.tsx       # Pricing cards
│   ├── SampleReport.tsx       # Sample report preview
│   └── Header.tsx
├── lib/
│   ├── db.ts                  # Vercel Postgres client
│   ├── audit-runner.ts        # 90-checkpoint audit logic
│   ├── pdf-generator.ts       # PDF report generation
│   └── stripe.ts              # Stripe integration
└── public/
    └── sample-report.pdf
```

## Setup Instructions

1. **Environment Variables (`.env.local`):**
```env
# Vercel Postgres (auto-populated on Vercel deploy)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Vercel Blob
BLOB_READ_WRITE_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. **Run Locally:**
```bash
npm install
npm run dev
```

3. **Deploy to Vercel:**
- Connect GitHub repo
- Add Vercel Postgres storage
- Add Vercel Blob storage
- Set environment variables
- Deploy!
