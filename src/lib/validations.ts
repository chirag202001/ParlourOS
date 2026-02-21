import { z } from 'zod';

// ─── Auth ────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

// ─── Tenant / Branch ────────────────────────────────────────

export const createTenantSchema = z.object({
  name: z.string().min(2, 'Business name is required'),
  ownerName: z.string().min(2, 'Your name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

export const createBranchSchema = z.object({
  name: z.string().min(1, 'Branch name is required'),
  city: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().default('Asia/Kolkata'),
});

// ─── Service ─────────────────────────────────────────────────

export const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  category: z.string().default('General'),
  durationMins: z.coerce.number().min(5).default(30),
  price: z.coerce.number().min(0, 'Price must be positive'),
  gstRate: z.coerce.number().min(0).max(100).default(18),
  active: z.boolean().default(true),
});

// ─── Customer ────────────────────────────────────────────────

export const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dob: z.string().optional(),
  notes: z.string().optional(),
  allergies: z.string().optional(),
  whatsappOptIn: z.boolean().default(false),
  smsOptIn: z.boolean().default(false),
  emailOptIn: z.boolean().default(false),
});

// ─── Appointment ─────────────────────────────────────────────

export const appointmentSchema = z.object({
  branchId: z.string().min(1, 'Branch is required'),
  customerId: z.string().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().min(10, 'Phone is required'),
  startAt: z.string().min(1, 'Start time is required'),
  endAt: z.string().min(1, 'End time is required'),
  staffUserId: z.string().optional(),
  notes: z.string().optional(),
  source: z.enum(['WALKIN', 'ONLINE', 'PHONE']).default('WALKIN'),
  depositAmount: z.coerce.number().default(0),
  status: z.enum(['BOOKED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).default('BOOKED'),
});

// ─── Invoice ─────────────────────────────────────────────────

export const invoiceLineItemSchema = z.object({
  type: z.enum(['SERVICE', 'PRODUCT', 'PACKAGE']),
  refId: z.string().optional(),
  name: z.string().min(1),
  qty: z.coerce.number().min(1).default(1),
  unitPrice: z.coerce.number().min(0),
  gstRate: z.coerce.number().default(18),
});

export const createInvoiceSchema = z.object({
  branchId: z.string().min(1, 'Branch is required'),
  customerId: z.string().optional(),
  type: z.enum(['TAX', 'BOS', 'PROFORMA']).default('TAX'),
  lineItems: z.array(invoiceLineItemSchema).min(1, 'At least one item is required'),
  discount: z.coerce.number().default(0),
  notes: z.string().optional(),
});

export const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  method: z.enum(['UPI', 'CASH', 'CARD', 'SPLIT', 'ONLINE']),
  amount: z.coerce.number().min(0),
  txnRef: z.string().optional(),
});

export const refundSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().min(0),
  reason: z.string().optional(),
  method: z.enum(['UPI', 'CASH', 'CARD', 'SPLIT', 'ONLINE']),
});

// ─── Package ─────────────────────────────────────────────────

export const packageSchema = z.object({
  name: z.string().min(1, 'Package name is required'),
  price: z.coerce.number().min(0),
  validityDays: z.coerce.number().min(1).default(365),
  sessionsTotal: z.coerce.number().min(1).default(10),
  includesJson: z.string().default('[]'),
  autoRenew: z.boolean().default(false),
  active: z.boolean().default(true),
});

export const sellPackageSchema = z.object({
  branchId: z.string().min(1),
  customerId: z.string().min(1),
  packageId: z.string().min(1),
});

// ─── Inventory ───────────────────────────────────────────────

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  type: z.enum(['CONSUMABLE', 'RETAIL']).default('RETAIL'),
  unit: z.string().default('pcs'),
  costPrice: z.coerce.number().min(0).default(0),
  sellingPrice: z.coerce.number().min(0).default(0),
  gstRate: z.coerce.number().default(18),
  reorderLevel: z.coerce.number().default(5),
  vendorId: z.string().optional(),
  trackExpiry: z.boolean().default(false),
  active: z.boolean().default(true),
});

export const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
});

export const purchaseSchema = z.object({
  branchId: z.string().min(1),
  vendorId: z.string().min(1),
  invoiceNo: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      qty: z.coerce.number().min(1),
      unitCost: z.coerce.number().min(0),
      expiryDate: z.string().optional(),
      batchNo: z.string().optional(),
    }),
  ).min(1, 'At least one item is required'),
});

// ─── Staff ───────────────────────────────────────────────────

export const staffProfileSchema = z.object({
  userId: z.string().min(1),
  skills: z.string().default('[]'),
  baseSalary: z.coerce.number().default(0),
  commissionType: z.enum(['PERCENT', 'FIXED']).default('PERCENT'),
  commissionValue: z.coerce.number().default(0),
});

export const attendanceSchema = z.object({
  branchId: z.string().min(1),
  staffUserId: z.string().min(1),
  date: z.string().min(1),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE']).default('PRESENT'),
});

// ─── Marketing ───────────────────────────────────────────────

export const messageTemplateSchema = z.object({
  channel: z.enum(['WHATSAPP', 'SMS', 'EMAIL']),
  key: z.string().min(1),
  name: z.string().min(1),
  content: z.string().min(1),
});

export const campaignSchema = z.object({
  branchId: z.string().optional(),
  name: z.string().min(1),
  channel: z.enum(['WHATSAPP', 'SMS', 'EMAIL']),
  segmentKey: z.string().default('all'),
  scheduledAt: z.string().optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type RefundInput = z.infer<typeof refundSchema>;
export type PackageInput = z.infer<typeof packageSchema>;
export type SellPackageInput = z.infer<typeof sellPackageSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type VendorInput = z.infer<typeof vendorSchema>;
export type PurchaseInput = z.infer<typeof purchaseSchema>;
export type StaffProfileInput = z.infer<typeof staffProfileSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type MessageTemplateInput = z.infer<typeof messageTemplateSchema>;
export type CampaignInput = z.infer<typeof campaignSchema>;
