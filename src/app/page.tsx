import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/rbac';
import { PLANS } from '@/lib/plans';
import {
  Scissors,
  Calendar,
  Users,
  Receipt,
  BarChart3,
  Package,
  Warehouse,
  Megaphone,
  UserCog,
  Shield,
  Smartphone,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
  Building2,
  IndianRupee,
  ChevronRight,
} from 'lucide-react';

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) {
    redirect('/app/dashboard');
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ═══════════════ NAVBAR ═══════════════ */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-md">
              <Scissors className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Parlour<span className="text-pink-600">OS</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-gray-600 transition hover:text-pink-600">Features</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 transition hover:text-pink-600">Pricing</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 transition hover:text-pink-600">Testimonials</a>
            <a href="#faq" className="text-sm font-medium text-gray-600 transition hover:text-pink-600">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Sign In
            </Link>
            <Link
              href="/onboarding"
              className="rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:brightness-110"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-pink-100 opacity-50 blur-3xl" />
          <div className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-purple-100 opacity-40 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-rose-100 opacity-30 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-4 py-1.5 text-sm font-medium text-pink-700">
              <Zap className="h-4 w-4" />
              Built for Indian Salons &amp; Parlours
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Run Your Salon Like a{' '}
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Pro Business
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
              The all-in-one platform to manage appointments, billing, inventory, staff, marketing
              and more — designed specifically for beauty parlours &amp; salons across India.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/onboarding"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition hover:shadow-xl hover:brightness-110"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 shadow-sm transition hover:border-pink-300 hover:text-pink-600"
              >
                View Demo
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                GST compliant invoicing
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                WhatsApp integration
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16">
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-gray-900 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-gray-700 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="ml-3 text-xs text-gray-400">parlour-os.vercel.app/app/dashboard</span>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
                {/* Mini dashboard preview */}
                <div className="grid gap-4 sm:grid-cols-4">
                  {[
                    { label: "Today's Appointments", value: '12', color: 'bg-blue-500', icon: Calendar },
                    { label: "Today's Revenue", value: '\u20B924,500', color: 'bg-green-500', icon: IndianRupee },
                    { label: 'Active Customers', value: '1,247', color: 'bg-purple-500', icon: Users },
                    { label: 'Staff On Duty', value: '8', color: 'bg-pink-500', icon: UserCog },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-xl bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg ${stat.color} p-2`}>
                          <stat.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                          <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="col-span-2 rounded-xl bg-white p-4 shadow-sm">
                    <p className="mb-3 text-sm font-semibold text-gray-700">Upcoming Appointments</p>
                    {['Priya Sharma — Hair Spa — 10:00 AM', 'Rahul Verma — Haircut — 10:30 AM', 'Anita Desai — Bridal Makeup — 11:00 AM'].map((apt, i) => (
                      <div key={i} className="flex items-center gap-2 border-b py-2 last:border-0">
                        <div className="h-2 w-2 rounded-full bg-pink-400" />
                        <span className="text-sm text-gray-600">{apt}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="mb-3 text-sm font-semibold text-gray-700">Quick Actions</p>
                    {['New Appointment', 'Walk-in Billing', 'Add Customer'].map((action, i) => (
                      <div key={i} className="mb-2 rounded-lg bg-pink-50 px-3 py-2 text-sm font-medium text-pink-700">
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="features" className="border-t bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-pink-600">Everything You Need</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              11 Powerful Modules, One Platform
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              From booking the first appointment to analysing monthly revenue — ParlourOS handles it all.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Calendar,
                title: 'Appointments & Calendar',
                description: 'Book, reschedule, and manage appointments with a visual calendar. Send reminders via WhatsApp.',
                color: 'bg-blue-100 text-blue-600',
              },
              {
                icon: Receipt,
                title: 'POS & Billing',
                description: 'Walk-in or appointment billing, GST invoices, multiple payment modes, split payments and refunds.',
                color: 'bg-green-100 text-green-600',
              },
              {
                icon: Users,
                title: 'Customer Management',
                description: 'Full customer profiles with visit history, preferences, allergies, loyalty points and birthday reminders.',
                color: 'bg-purple-100 text-purple-600',
              },
              {
                icon: Scissors,
                title: 'Service Menu',
                description: 'Organise services by category with pricing, duration, GST rates. Activate or deactivate anytime.',
                color: 'bg-pink-100 text-pink-600',
              },
              {
                icon: Package,
                title: 'Packages & Memberships',
                description: 'Create prepaid packages — "10 Haircuts for \u20B92,500" — track sessions used and remaining.',
                color: 'bg-amber-100 text-amber-600',
              },
              {
                icon: Warehouse,
                title: 'Inventory Management',
                description: 'Track retail and consumable products, stock levels, expiry dates, reorder alerts and purchase orders.',
                color: 'bg-orange-100 text-orange-600',
              },
              {
                icon: UserCog,
                title: 'Staff & Payroll',
                description: 'Manage staff profiles, attendance, commission tracking, salary calculation and performance metrics.',
                color: 'bg-indigo-100 text-indigo-600',
              },
              {
                icon: BarChart3,
                title: 'Reports & Analytics',
                description: 'Revenue, services, staff performance, customer retention — all with exportable charts and data.',
                color: 'bg-teal-100 text-teal-600',
              },
              {
                icon: Megaphone,
                title: 'Marketing & Campaigns',
                description: 'Run WhatsApp & SMS campaigns, set up automated birthday/follow-up messages, track engagement.',
                color: 'bg-rose-100 text-rose-600',
              },
              {
                icon: Shield,
                title: 'Role-Based Access',
                description: 'Owner, Manager, Stylist, Receptionist, Accountant — each role sees only what they need.',
                color: 'bg-gray-100 text-gray-600',
              },
              {
                icon: Building2,
                title: 'Multi-Branch',
                description: 'Manage multiple salon locations from a single dashboard with branch-level staff and reporting.',
                color: 'bg-cyan-100 text-cyan-600',
              },
              {
                icon: Smartphone,
                title: 'Mobile Ready',
                description: 'Fully responsive — works beautifully on phones, tablets and desktops. Use it at the front desk or on the go.',
                color: 'bg-violet-100 text-violet-600',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-pink-200 hover:shadow-md"
              >
                <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="border-t py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-pink-600">Simple Setup</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Get Started in 3 Minutes
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Sign Up & Create Your Salon',
                description: 'Enter your salon name, set up your first branch, and choose a plan. It takes under 2 minutes.',
              },
              {
                step: '2',
                title: 'Import Your Existing Data',
                description: 'Bulk-import your customers, services, products and staff from CSV files — or start fresh.',
              },
              {
                step: '3',
                title: 'Start Managing & Growing',
                description: 'Book appointments, create invoices, track revenue and run marketing campaigns — all from day one.',
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-2xl font-bold text-white shadow-lg">
                  {item.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ PRICING ═══════════════ */}
      <section id="pricing" className="border-t bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-pink-600">Simple Pricing</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Plans That Grow With You
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
              Start small, scale big. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {Object.values(PLANS).map((plan) => {
              const isPopular = plan.key === 'PRO';
              return (
                <div
                  key={plan.key}
                  className={`relative rounded-2xl border-2 bg-white p-8 shadow-sm transition hover:shadow-lg ${
                    isPopular ? 'border-pink-400 shadow-md' : 'border-gray-100'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-1 text-xs font-semibold text-white shadow-md">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-gray-900">{'\u20B9'}{plan.price.toLocaleString('en-IN')}</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {'\u20B9'}{plan.yearlyPrice.toLocaleString('en-IN')}/year (save {Math.round((1 - plan.yearlyPrice / (plan.price * 12)) * 100)}%)
                    </p>
                  </div>

                  <div className="mb-6 flex gap-4 border-t border-b py-4 text-center text-sm">
                    <div>
                      <p className="font-bold text-gray-900">{plan.maxBranches >= 999 ? '\u221E' : plan.maxBranches}</p>
                      <p className="text-gray-500">{plan.maxBranches === 1 ? 'Branch' : 'Branches'}</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{plan.maxStaff >= 999 ? '\u221E' : plan.maxStaff}</p>
                      <p className="text-gray-500">Staff</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{plan.maxCustomers >= 999999 ? '\u221E' : plan.maxCustomers.toLocaleString('en-IN')}</p>
                      <p className="text-gray-500">Customers</p>
                    </div>
                  </div>

                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/onboarding"
                    className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition ${
                      isPopular
                        ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md hover:shadow-lg hover:brightness-110'
                        : 'border-2 border-gray-200 text-gray-700 hover:border-pink-300 hover:text-pink-600'
                    }`}
                  >
                    Start Free Trial
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section id="testimonials" className="border-t py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-pink-600">Loved by Salon Owners</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              What Our Customers Say
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                name: 'Priya Mehta',
                role: 'Owner, Glow Beauty Lounge',
                location: 'Mumbai',
                quote: 'ParlourOS transformed how we run our salon. Billing used to take 10 minutes per customer — now it takes under 30 seconds. The WhatsApp reminders alone reduced our no-shows by 40%.',
                rating: 5,
              },
              {
                name: 'Rajesh Kumar',
                role: 'Owner, Royal Men\'s Salon',
                location: 'Delhi',
                quote: 'Managing 3 branches was a nightmare with Excel sheets. ParlourOS gave us one dashboard for everything. Staff commissions, inventory, reports — all automated now.',
                rating: 5,
              },
              {
                name: 'Sneha Reddy',
                role: 'Manager, Aura Spa & Salon',
                location: 'Hyderabad',
                quote: 'The package management is brilliant. Our Bridal Package tracking used to be a headache. Now clients can see exactly which sessions they have used. We love it!',
                rating: 5,
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-6 text-sm leading-relaxed text-gray-600">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-sm font-bold text-white">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role} &bull; {testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FAQ ═══════════════ */}
      <section id="faq" className="border-t bg-gray-50 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-12 space-y-6">
            {[
              {
                q: 'Is there a free trial?',
                a: 'Yes! All plans come with a 14-day free trial. No credit card required. You get full access to all features during the trial.',
              },
              {
                q: 'Can I import my existing customer data?',
                a: 'Absolutely. ParlourOS has a built-in CSV import tool. You can import customers, services, products, vendors, and staff in bulk — takes just a few minutes.',
              },
              {
                q: 'Does it support GST invoicing?',
                a: 'Yes. ParlourOS generates GST-compliant invoices with configurable tax rates, HSN/SAC codes, and your GSTIN. Perfect for Indian businesses.',
              },
              {
                q: 'Can I manage multiple branches?',
                a: 'Our Pro plan supports up to 3 branches, and the Multi-Branch plan offers unlimited locations — all managed from a single dashboard.',
              },
              {
                q: 'Is my data secure?',
                a: 'Your data is stored on encrypted, SOC-2 compliant cloud servers. We use industry-standard security practices including bcrypt password hashing and HTTPS everywhere.',
              },
              {
                q: 'Can my staff access it on their phones?',
                a: 'Yes! ParlourOS is fully responsive and works on any device — smartphones, tablets, or desktops. No app download needed.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major payment methods via Razorpay — UPI, credit/debit cards, net banking, and wallets.',
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="text-base font-semibold text-gray-900">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-600 via-rose-600 to-purple-700 px-8 py-16 text-center shadow-2xl sm:px-16">
            <div className="absolute inset-0 -z-10 opacity-30">
              <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
              <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            </div>

            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Transform Your Salon?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-pink-100">
              Join hundreds of salon owners who are saving time, growing revenue, and
              delighting customers with ParlourOS.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/onboarding"
                className="flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-pink-600 shadow-lg transition hover:bg-pink-50 hover:shadow-xl"
              >
                Start Your Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white transition hover:border-white/60 hover:bg-white/10"
              >
                Sign In to Demo
              </Link>
            </div>
            <p className="mt-6 text-sm text-pink-200">
              No credit card required &bull; 14-day free trial &bull; Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t bg-gray-900 py-12 text-gray-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600">
                  <Scissors className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">ParlourOS</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed">
                The complete salon management platform, built for Indian salons &amp; parlours.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="transition hover:text-pink-400">Features</a></li>
                <li><a href="#pricing" className="transition hover:text-pink-400">Pricing</a></li>
                <li><Link href="/login" className="transition hover:text-pink-400">Demo</Link></li>
                <li><Link href="/onboarding" className="transition hover:text-pink-400">Sign Up</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#faq" className="transition hover:text-pink-400">FAQ</a></li>
                <li><a href="mailto:support@parlour-os.com" className="transition hover:text-pink-400">Email Support</a></li>
                <li><a href="https://wa.me/919999999999" className="transition hover:text-pink-400">WhatsApp</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="transition hover:text-pink-400">Privacy Policy</a></li>
                <li><a href="#" className="transition hover:text-pink-400">Terms of Service</a></li>
                <li><a href="#" className="transition hover:text-pink-400">Refund Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 sm:flex-row">
            <p className="text-sm">&copy; 2026 ParlourOS. All rights reserved.</p>
            <p className="text-xs text-gray-500">Made in India for Indian salons</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
