export interface PlanConfig {
  key: string;
  name: string;
  price: number; // monthly INR
  yearlyPrice: number;
  maxBranches: number;
  maxStaff: number;
  maxCustomers: number;
  features: string[];
}

export const PLANS: Record<string, PlanConfig> = {
  STARTER: {
    key: 'STARTER',
    name: 'Starter',
    price: 999,
    yearlyPrice: 9990,
    maxBranches: 1,
    maxStaff: 5,
    maxCustomers: 500,
    features: [
      'Appointments & Calendar',
      'Basic POS & Invoicing',
      'Customer Management',
      'Up to 5 Staff',
      'Basic Reports',
      'Email Support',
    ],
  },
  PRO: {
    key: 'PRO',
    name: 'Pro',
    price: 2499,
    yearlyPrice: 24990,
    maxBranches: 3,
    maxStaff: 20,
    maxCustomers: 5000,
    features: [
      'Everything in Starter',
      'Packages & Memberships',
      'Inventory Management',
      'Staff Commissions & Payroll',
      'WhatsApp Messaging',
      'Advanced Reports & Export',
      'GST Invoices',
      'Priority Support',
    ],
  },
  MULTI_BRANCH: {
    key: 'MULTI_BRANCH',
    name: 'Multi-Branch',
    price: 4999,
    yearlyPrice: 49990,
    maxBranches: 999,
    maxStaff: 999,
    maxCustomers: 999999,
    features: [
      'Everything in Pro',
      'Unlimited Branches',
      'Unlimited Staff',
      'Marketing Campaigns',
      'Custom Roles & Permissions',
      'API Access',
      'Dedicated Support',
    ],
  },
};

export function getPlan(key: string): PlanConfig {
  return PLANS[key] || PLANS.STARTER;
}
