# ParlourOS

**Multi-tenant SaaS Salon & Parlour Management Platform for India**

Built with Next.js 14 (App Router) - TypeScript - Prisma - PostgreSQL - Tailwind CSS - shadcn/ui

**Live Demo:** [parlour-os.vercel.app](https://parlour-os.vercel.app)

---

## Quick Start (Run Locally)

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Node.js** | 18 or higher | [nodejs.org](https://nodejs.org) |
| **PostgreSQL** | 14+ | [postgresql.org](https://www.postgresql.org/download/) or use [Neon](https://neon.tech) (free) |
| **Git** | any | [git-scm.com](https://git-scm.com) |

### Step 1 - Clone and Install

```bash
git clone https://github.com/chirag202001/ParlourOS.git
cd ParlourOS
npm install
```

### Step 2 - Configure Environment

```bash
cp .env.example .env
```

Open `.env` and fill in these **3 required values**:

| Variable | What to put | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Your PostgreSQL connection string | `postgresql://user:pass@localhost:5432/parlour_os` |
| `NEXTAUTH_SECRET` | Any random string (32+ chars) | Run: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXTAUTH_URL` | Your app URL | `http://localhost:3000` |

> **No local PostgreSQL?** Create a free database at [neon.tech](https://neon.tech) and copy the connection string.

### Step 3 - Setup Database

```bash
npx prisma generate     # Generate the database client
npx prisma db push      # Create all tables
npx prisma db seed      # Load demo data (users, services, customers, etc.)
```

### Step 4 - Start the App

```bash
npm run dev
```

Open **http://localhost:3000** in your browser. You will see the login page.

---

## Demo Login Credentials

The seed creates 5 demo users. Each role sees different modules in the sidebar:

| Role | Email | Password | What they can access |
|------|-------|----------|---------------------|
| **Owner** | `owner@demo.com` | `password123` | Everything - full admin access |
| **Manager** | `manager@demo.com` | `password123` | All modules except subscription management |
| **Receptionist** | `reception@demo.com` | `password123` | Appointments, Services, Billing, Customers, Packages |
| **Stylist** | `anjali@demo.com` | `password123` | Appointments, Services, Customers (view only) |
| **Stylist** | `meena@demo.com` | `password123` | Appointments, Services, Customers (view only) |

> On the login page, click any **Quick Demo Login** button to auto-fill the credentials, then press **Sign In**.

---

## Module Guide

### Dashboard
Overview cards showing today's appointments, total customers, monthly revenue, and recent invoices. All roles see this page.

### Appointments
- Book appointments for walk-in, phone, or online customers
- Assign staff and time slots
- Track status: Booked > Confirmed > In Progress > Completed
- Cancel or mark as No Show

### Services
- Create and manage salon services (Haircut, Facial, Waxing, etc.)
- Set price, duration (minutes), category, and GST rate
- Toggle services active/inactive

### Customers
- Maintain customer profiles with phone, email, gender, DOB
- View visit history and spending
- Track loyalty points and consent preferences

### Billing / POS
- Create invoices with multiple line items (services + products)
- Auto-calculate GST (CGST + SGST split)
- Accept payments: Cash, Card, UPI, or Split
- Process refunds when needed

### Packages
- Create membership packages (e.g., "4 Haircuts + 1 Spa" for Rs 2,500)
- Set validity period and total sessions
- Sell packages to customers and track remaining sessions

### Inventory
- Manage products (retail + consumable) with cost and selling price
- Track vendors and purchase orders
- Stock ledger with auto-deduction on usage
- Low-stock alerts based on reorder levels

### Staff
- Staff profiles with designation and joining date
- Commission configuration (percentage-based)
- Daily attendance tracking (Present / Absent / Half Day / Leave)

### Reports
- **Revenue Report:** Daily/weekly/monthly/yearly breakdown with charts
- **Service Mix:** Which services are most popular and profitable
- **Staff Performance:** Appointments completed per staff member
- **Customer Retention:** Active, at-risk, and lapsed customer cohorts
- **GST Summary:** Taxable value, CGST, SGST totals for filing
- Export reports as CSV

### Marketing
- Create message templates for WhatsApp, SMS, and Email
- Launch campaigns to customer segments
- Manage Google/JustDial review links per branch

### Settings
- Update business name, GSTIN, tax rate, invoice prefix/footer
- Add/edit/delete branches (name, address, phone, hours)
- View roles and their permissions
- Manage subscription plan

---

## Deploy to Vercel (Production)

### Step 1 - Push to GitHub
```bash
git init
git add -A
git commit -m "Initial commit"
gh repo create YourAppName --public --source=. --push
```

### Step 2 - Import in Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects Next.js - no config needed

### Step 3 - Add Environment Variables
In Vercel > Project > Settings > Environment Variables, add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your production PostgreSQL URL (Neon/Supabase/etc.) |
| `NEXTAUTH_SECRET` | A random 32+ char string |
| `NEXTAUTH_URL` | Your Vercel domain (e.g., `https://your-app.vercel.app`) |

### Step 4 - Setup Production Database
After the first deploy, run these from your local machine with the production DATABASE_URL:

```bash
# Set the production DATABASE_URL
export DATABASE_URL="your-production-connection-string"

# Push schema and seed
npx prisma db push
npx prisma db seed
```

Your app is now live!

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma db push` | Push schema changes to database |
| `npx prisma db seed` | Seed demo data |
| `npx prisma studio` | Open visual database browser |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |

---

## Subscription Plans

| Plan | Price | Branches | Staff | Key Features |
|------|-------|----------|-------|--------------|
| **Starter** | Rs 999/mo | 1 | 5 | Core POS, Services, Customers |
| **Pro** | Rs 2,499/mo | 3 | 20 | + Inventory, Reports, Marketing |
| **Multi-Branch** | Rs 4,999/mo | 10 | Unlimited | + Multi-branch, API, Priority Support |

---

## GST / Tax Handling

ParlourOS supports Indian GST:
- Configurable tax rate per tenant (default 18%)
- Per-service GST rate override
- Auto-split into CGST (9%) + SGST (9%) on invoices
- GST Summary report for filing

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router, Server Components, Server Actions)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon-compatible)
- **ORM:** Prisma (30+ models)
- **Auth:** NextAuth.js v4 (Credentials provider, JWT, 30-day sessions)
- **UI:** Tailwind CSS + shadcn/ui + Radix UI primitives
- **Icons:** Lucide React
- **Validation:** Zod
- **Payments:** Razorpay (pluggable provider)
- **Messaging:** WhatsApp / SMS / Email (pluggable provider)

---

## Project Structure

```
ParlourOS/
|-- prisma/
|   |-- schema.prisma          # 30+ database models
|   |-- seed.ts                # Demo data seeder
|-- src/
|   |-- app/
|   |   |-- login/             # Login page with demo buttons
|   |   |-- onboarding/        # New tenant signup wizard
|   |   |-- app/               # Main app (authenticated)
|   |       |-- dashboard/     # Overview stats
|   |       |-- appointments/  # Booking management
|   |       |-- services/      # Service CRUD
|   |       |-- customers/     # Customer CRM
|   |       |-- pos/           # Billing and invoicing
|   |       |-- packages/      # Memberships
|   |       |-- inventory/     # Products and stock
|   |       |-- staff/         # Staff and attendance
|   |       |-- marketing/     # Campaigns and templates
|   |       |-- reports/       # Analytics
|   |       |-- settings/      # Configuration
|   |-- components/
|   |   |-- layout/            # Sidebar (role-filtered) and Topbar
|   |   |-- ui/                # shadcn/ui components
|   |-- lib/
|       |-- auth.ts            # NextAuth config
|       |-- rbac.ts            # Role-based access control
|       |-- db.ts              # Prisma client
|       |-- validations.ts     # Zod schemas
|-- .env.example               # Environment template
|-- package.json
|-- tailwind.config.ts
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Invalid email or password` | Run `npx prisma db seed` to create demo users |
| `NO_SECRET` error on Vercel | Add `NEXTAUTH_SECRET` in Vercel environment variables |
| `Forbidden: insufficient permissions` | Expected - the logged-in role does not have access to that module |
| Database connection error | Check your `DATABASE_URL` in `.env` is correct |
| `prisma generate` fails | Run `npm install` first, then `npx prisma generate` |
| Blank page after login | Make sure `NEXTAUTH_URL` matches your actual app URL |

---

## License

MIT

---

Built with love for Indian beauty and wellness businesses.
