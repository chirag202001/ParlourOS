# ParlourOS 💇‍♀️

**Multi-tenant SaaS Salon & Parlour Management Platform for India**

Built with Next.js 14 (App Router) · TypeScript · Prisma · PostgreSQL · Tailwind CSS · shadcn/ui

---

## Features

| Module | Description |
|--------|-------------|
| **Auth & RBAC** | Email/password login, JWT sessions, 5 roles (Owner, Manager, Reception, Staff, Accountant) with granular permissions |
| **Multi-Tenant** | Isolated data per salon, slug-based tenant identification |
| **Multi-Branch** | Manage multiple locations, branch-scoped data |
| **Services** | Full CRUD, categories (Hair, Skin, Nails, Makeup, Spa, etc.), duration & GST rate |
| **Customers** | Customer profiles, birthday tracking, visit history, consent management |
| **Appointments** | Calendar booking, staff assignment, status workflow, walk-in / WhatsApp / phone sources |
| **POS & Billing** | Invoice builder, line items (services + products), GST calculation (CGST + SGST), multi-payment support (Cash/Card/UPI), refunds |
| **Packages** | Membership packages with session tracking, sell to customers, auto-expiry |
| **Inventory** | Products (retail + consumable), vendors, purchase orders, stock ledger, low-stock alerts |
| **Staff** | Staff profiles, attendance tracking, base salary + commission configuration |
| **Marketing** | Message templates (WhatsApp/SMS/Email), campaign management, review links |
| **Reports** | Revenue analytics, service mix, staff performance, customer retention cohorts, GST summary |
| **Settings** | Business profile, branch management, invoice customization, role viewer, subscription management |
| **Subscription** | 3-tier plans (Starter ₹999, Pro ₹2,499, Multi-Branch ₹4,999) with feature gating |

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router, Server Components, Server Actions)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon-compatible)
- **ORM:** Prisma
- **Auth:** NextAuth.js v4 (Credentials provider, JWT strategy)
- **UI:** Tailwind CSS + shadcn/ui + Radix UI primitives
- **Icons:** Lucide React
- **Validation:** Zod
- **Payments:** Razorpay / Stripe (pluggable provider, stubbed)
- **Messaging:** WhatsApp / SMS / Email (pluggable provider, stubbed)

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or [Neon](https://neon.tech))
- npm or pnpm

### 1. Clone & Install

```bash
git clone <your-repo-url> parlour-os
cd parlour-os
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random 32+ char secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |

### 3. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Seed with demo data
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Owner | `owner@demo.com` | `password123` |
| Manager | `manager@demo.com` | `password123` |
| Receptionist | `reception@demo.com` | `password123` |
| Stylist | `anjali@demo.com` | `password123` |
| Stylist | `meena@demo.com` | `password123` |

---

## Project Structure

```
parlour-os/
├── prisma/
│   ├── schema.prisma          # Database schema (30+ models)
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/
│   │   ├── api/auth/          # NextAuth route handler
│   │   ├── api/onboarding/    # Tenant + branch onboarding APIs
│   │   ├── login/             # Login page
│   │   ├── onboarding/        # 3-step onboarding wizard
│   │   └── app/               # Authenticated app shell
│   │       ├── dashboard/     # Dashboard with stats
│   │       ├── services/      # Service management
│   │       ├── customers/     # Customer CRM
│   │       ├── appointments/  # Appointment booking
│   │       ├── pos/           # Point of Sale / Billing
│   │       ├── packages/      # Membership packages
│   │       ├── inventory/     # Products & stock
│   │       ├── staff/         # Staff & attendance
│   │       ├── marketing/     # Templates & campaigns
│   │       ├── reports/       # Analytics & reports
│   │       └── settings/      # Configuration & billing
│   ├── components/
│   │   ├── layout/            # Sidebar & Topbar
│   │   ├── ui/                # shadcn/ui components
│   │   └── providers.tsx      # Session & tooltip providers
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── rbac.ts            # Role-based access control
│   │   ├── plans.ts           # Subscription plan definitions
│   │   ├── audit.ts           # Audit log helper
│   │   ├── utils.ts           # Utility functions
│   │   ├── validations.ts     # Zod schemas
│   │   └── providers/
│   │       ├── messaging.ts   # WhatsApp/SMS/Email provider
│   │       └── payments.ts    # Razorpay/Stripe provider
│   └── types/
│       └── next-auth.d.ts     # NextAuth type augmentation
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create migration |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |

---

## GST / Tax Handling

ParlourOS supports Indian GST:
- Configurable tax rate per tenant (default 18%)
- Per-service GST rate override
- Auto-split into CGST (9%) + SGST (9%) on invoices
- GST Summary report for filing

---

## Subscription Plans

| Plan | Price | Branches | Staff | Key Features |
|------|-------|----------|-------|--------------|
| **Starter** | ₹999/mo | 1 | 5 | Core POS, Services, Customers |
| **Pro** | ₹2,499/mo | 3 | 20 | + Inventory, Reports, Marketing |
| **Multi-Branch** | ₹4,999/mo | 10 | Unlimited | + Multi-branch, API, Priority Support |

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## License

MIT

---

Built with ❤️ for Indian beauty & wellness businesses.
