# AuditPulse — Professional Web Security & UX Audit Platform

🚀 **Zero-capital MVP for productized web audits** — Built with Next.js, Vercel Postgres, and manual payment processing (no Stripe fees).

## What It Does

Launch-ready 90-checkpoint audit engine that catches what AI-generated code consistently gets wrong:
- **Security vulnerabilities**: Exposed secrets, client-side paywalls, missing HTTPS/CSP/HSTS
- **UX conversion killers**: Missing CTAs, poor mobile viewport, weak trust signals
- **Performance issues**: Script bloat, missing Core Web Vitals optimization
- **Accessibility gaps**: WCAG AA compliance checks
- **SEO problems**: Missing meta tags, social cards, legal pages

## Live Demo

**Landing Page:** http://localhost:3001
- Free 5-point security scanner (lead generation widget)
- Full 90-checkpoint audit engine
- Interactive PDF-ready reports
- Client dashboard

## Tech Stack

- **Framework:** Next.js 16 (App Router + Turbopack)
- **Styling:** Tailwind CSS
- **Database:** Vercel Postgres (optional — MVP uses local JSON storage)
- **Payment:** Manual bank transfer + receipt upload (zero fees)
- **Hosting:** Vercel (one-click deploy)

## Project Structure

```
audit-agency/
├── app/
│   ├── page.tsx                    # Landing page + free audit widget
│   ├── dashboard/page.tsx          # Audit history dashboard
│   ├── checkout/page.tsx           # Manual payment flow
│   ├── report/[id]/page.tsx        # Full audit report viewer
│   └── api/
│       ├── audit/
│       │   ├── quick/route.ts      # Free 5-point scanner
│       │   └── full/route.ts       # Full 90-checkpoint audit
│       └── checkout/route.ts       # Receipt upload handler
├── components/
│   └── FreeAuditWidget.tsx         # Lead generation scanner widget
├── lib/
│   ├── audit-runner.ts             # 90-checkpoint audit engine
│   └── payment.ts                  # Manual payment config
└── .audits/                        # Local audit report storage (gitignored)
```

## Features

✅ **Free 5-Point Quick Scan**
- HTTPS/SSL validation
- Security headers (HSTS, CSP, X-Frame-Options)
- Mobile viewport configuration
- SEO metadata (title, description)
- Frontend secret exposure detection

✅ **Full 90-Checkpoint Deep Audit** (8 Categories)
1. **Security & Revenue Protection** (10 checks)
   - HTTPS enforcement, HSTS, CSP, clickjacking protection
   - Exposed API keys, database credentials, Stripe secrets
   - Client-side paywall bypass detection
   
2. **Visual Design & Frontend** (Typography, design tokens)

3. **User Flow & UX** (CTAs, social proof, trust indicators)

4. **Responsive & Mobile** (Viewport meta, breakpoints)

5. **Accessibility (WCAG AA)** (Alt text, semantic HTML5)

6. **Performance & Web Vitals** (Script overhead, LCP, INP)

7. **SEO & Discoverability** (Meta tags, OpenGraph cards)

8. **Legal & Compliance** (Privacy policy, Terms of Service)

✅ **Interactive Report Viewer**
- Category breakdowns with pass/fail/warning indicators
- Severity badges (Critical/High/Medium/Low)
- Code snippets + remediation guidance
- Print-to-PDF functionality
- JSON export

✅ **Manual Payment Flow**
- Bank transfer checkout (no Stripe/PayPal fees)
- Receipt image/PDF upload
- Order confirmation system

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.local`:
```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Payment Details (Manual Bank Transfer)
BANK_NAME="Your Bank Name"
ACCOUNT_NAME="Your Full Name or Business Name"
ACCOUNT_NUMBER="1234567890"
ROUTING_NUMBER=""
CURRENCY="USD"

# Optional: Vercel Postgres (auto-populated on Vercel)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
```

### 3. Run Development Server
```bash
npm run dev
```
Visit: http://localhost:3000

### 4. Build for Production
```bash
npm run build
```

### 5. Deploy to Vercel
```bash
npx vercel --prod
```

Or connect your GitHub repo at https://vercel.com/new

## Revenue Model

**Productized Service Pricing:**
- **One-Time Deep Audit:** $199 (90-checkpoint scan + PDF report + code fixes)
- **Monthly Monitoring:** $99/mo (weekly re-scans + vulnerability alerts)

**Why Manual Payments:**
- Zero payment processor fees (Stripe takes 2.9% + $0.30)
- Bootstrap-friendly for first 10-20 customers
- Upgrade to Stripe later when scaling

## Usage

### Free Scanner (Homepage)
1. Enter any URL (e.g., `example.com`)
2. Get instant 5-point security/UX check
3. Click "Run Full 90-Point Audit" for deep scan

### Full Audit Report
- View at `/report/[id]`
- Print to PDF (Ctrl/Cmd + P)
- Download JSON export
- Access past audits at `/dashboard`

### Payment Flow
1. User selects plan at `/checkout`
2. Sees bank account details
3. Uploads payment receipt (screenshot/PDF)
4. Manual verification → deliver report

## Roadmap

- [ ] Email notifications (SMTP integration)
- [ ] Vercel Postgres persistence (audit history)
- [ ] Automated payment verification (OCR on receipts)
- [ ] Stripe/PayPal integration (scale-up option)
- [ ] White-label PDF reports
- [ ] Scheduled recurring scans (cron jobs)

## License

MIT

---

**Built with Claude Code** — From zero to production-ready MVP in one session.
