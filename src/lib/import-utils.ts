/**
 * CSV Import Utilities for ParlourOS
 * Handles parsing, validation, and error reporting for bulk data imports
 */

// ─── Column Definitions ────────────────────────────────────────────────────────

export interface ColumnDef {
  key: string;
  label: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'phone' | 'enum';
  enumValues?: string[];
  defaultValue?: string | number | boolean;
  description?: string;
}

// ─── Import Type Schemas ────────────────────────────────────────────────────────

export const IMPORT_SCHEMAS: Record<string, { label: string; description: string; columns: ColumnDef[] }> = {
  customers: {
    label: 'Customers',
    description: 'Import your existing customer database — names, phone numbers, email, preferences.',
    columns: [
      { key: 'name', label: 'Name', required: true, type: 'string', description: 'Full name of the customer' },
      { key: 'phone', label: 'Phone', required: true, type: 'phone', description: '10-digit mobile number' },
      { key: 'email', label: 'Email', required: false, type: 'email', description: 'Email address' },
      { key: 'gender', label: 'Gender', required: false, type: 'enum', enumValues: ['MALE', 'FEMALE', 'OTHER'], description: 'MALE / FEMALE / OTHER' },
      { key: 'dob', label: 'Date of Birth', required: false, type: 'date', description: 'YYYY-MM-DD format' },
      { key: 'notes', label: 'Notes', required: false, type: 'string', description: 'Any special notes' },
      { key: 'allergies', label: 'Allergies', required: false, type: 'string', description: 'Known allergies or sensitivities' },
      { key: 'whatsappOptIn', label: 'WhatsApp Opt-In', required: false, type: 'boolean', defaultValue: false, description: 'true / false' },
    ],
  },

  services: {
    label: 'Services',
    description: 'Import your service menu — names, prices, duration, categories.',
    columns: [
      { key: 'name', label: 'Service Name', required: true, type: 'string', description: 'Name of the service' },
      { key: 'category', label: 'Category', required: false, type: 'string', defaultValue: 'General', description: 'Category (e.g. Hair, Skin, Nails)' },
      { key: 'durationMins', label: 'Duration (mins)', required: false, type: 'number', defaultValue: 30, description: 'Duration in minutes' },
      { key: 'price', label: 'Price (₹)', required: true, type: 'number', description: 'Service price in INR' },
      { key: 'gstRate', label: 'GST Rate (%)', required: false, type: 'number', defaultValue: 18, description: 'GST percentage (default 18)' },
      { key: 'active', label: 'Active', required: false, type: 'boolean', defaultValue: true, description: 'true / false' },
    ],
  },

  products: {
    label: 'Products / Inventory',
    description: 'Import products for retail sale or salon consumption.',
    columns: [
      { key: 'name', label: 'Product Name', required: true, type: 'string', description: 'Name of the product' },
      { key: 'type', label: 'Type', required: false, type: 'enum', enumValues: ['RETAIL', 'CONSUMABLE'], defaultValue: 'RETAIL', description: 'RETAIL or CONSUMABLE' },
      { key: 'unit', label: 'Unit', required: false, type: 'string', defaultValue: 'pcs', description: 'Unit of measurement (pcs, ml, g, etc.)' },
      { key: 'costPrice', label: 'Cost Price (₹)', required: false, type: 'number', defaultValue: 0, description: 'Purchase price' },
      { key: 'sellingPrice', label: 'Selling Price (₹)', required: true, type: 'number', description: 'Retail price in INR' },
      { key: 'gstRate', label: 'GST Rate (%)', required: false, type: 'number', defaultValue: 18, description: 'GST percentage' },
      { key: 'reorderLevel', label: 'Reorder Level', required: false, type: 'number', defaultValue: 5, description: 'Minimum stock before reorder alert' },
      { key: 'active', label: 'Active', required: false, type: 'boolean', defaultValue: true, description: 'true / false' },
    ],
  },

  vendors: {
    label: 'Vendors / Suppliers',
    description: 'Import your product suppliers and vendor contacts.',
    columns: [
      { key: 'name', label: 'Vendor Name', required: true, type: 'string', description: 'Company or contact name' },
      { key: 'phone', label: 'Phone', required: false, type: 'phone', description: 'Contact number' },
      { key: 'email', label: 'Email', required: false, type: 'email', description: 'Email address' },
      { key: 'address', label: 'Address', required: false, type: 'string', description: 'Full address' },
      { key: 'active', label: 'Active', required: false, type: 'boolean', defaultValue: true, description: 'true / false' },
    ],
  },

  staff: {
    label: 'Staff Members',
    description: 'Import your team — stylists, managers, receptionists. A default password will be set.',
    columns: [
      { key: 'name', label: 'Full Name', required: true, type: 'string', description: 'Staff full name' },
      { key: 'email', label: 'Email', required: true, type: 'email', description: 'Login email (must be unique)' },
      { key: 'phone', label: 'Phone', required: false, type: 'phone', description: 'Mobile number' },
      { key: 'role', label: 'Role', required: false, type: 'enum', enumValues: ['OWNER', 'MANAGER', 'RECEPTION', 'STAFF', 'ACCOUNTANT'], defaultValue: 'STAFF', description: 'OWNER / MANAGER / RECEPTION / STAFF / ACCOUNTANT' },
      { key: 'designation', label: 'Designation', required: false, type: 'string', defaultValue: '', description: 'Job title (e.g. Senior Stylist)' },
      { key: 'baseSalary', label: 'Base Salary (₹)', required: false, type: 'number', defaultValue: 0, description: 'Monthly salary' },
      { key: 'commissionPct', label: 'Commission %', required: false, type: 'number', defaultValue: 0, description: 'Commission percentage' },
    ],
  },
};

// ─── Validation ─────────────────────────────────────────────────────────────────

export interface RowError {
  row: number;
  column: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: RowError[];
  data: Record<string, any>[];
  totalRows: number;
  validRows: number;
  skippedRows: number;
}

function normalizePhone(val: string): string {
  // Strip spaces, dashes, country code +91
  let phone = val.replace(/[\s\-\(\)]/g, '');
  if (phone.startsWith('+91')) phone = phone.slice(3);
  if (phone.startsWith('91') && phone.length === 12) phone = phone.slice(2);
  return phone;
}

export function validateImportData(
  type: string,
  rawRows: Record<string, string>[],
): ValidationResult {
  const schema = IMPORT_SCHEMAS[type];
  if (!schema) throw new Error(`Unknown import type: ${type}`);

  const errors: RowError[] = [];
  const validData: Record<string, any>[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const raw = rawRows[i];
    const rowNum = i + 2; // +2 because row 1 is header, data starts at row 2
    const record: Record<string, any> = {};
    let rowValid = true;

    // Skip completely empty rows
    const hasAnyValue = Object.values(raw).some((v) => v && v.trim() !== '');
    if (!hasAnyValue) continue;

    for (const col of schema.columns) {
      const rawVal = (raw[col.key] || raw[col.label] || '').trim();

      // Required check
      if (col.required && !rawVal) {
        errors.push({ row: rowNum, column: col.label, message: `"${col.label}" is required` });
        rowValid = false;
        continue;
      }

      // Apply default if empty
      if (!rawVal) {
        record[col.key] = col.defaultValue ?? null;
        continue;
      }

      // Type validation
      switch (col.type) {
        case 'string':
          record[col.key] = rawVal;
          break;

        case 'number': {
          const num = parseFloat(rawVal.replace(/,/g, ''));
          if (isNaN(num)) {
            errors.push({ row: rowNum, column: col.label, message: `"${rawVal}" is not a valid number` });
            rowValid = false;
          } else {
            record[col.key] = num;
          }
          break;
        }

        case 'boolean': {
          const lower = rawVal.toLowerCase();
          if (['true', 'yes', '1', 'y'].includes(lower)) {
            record[col.key] = true;
          } else if (['false', 'no', '0', 'n'].includes(lower)) {
            record[col.key] = false;
          } else {
            errors.push({ row: rowNum, column: col.label, message: `"${rawVal}" is not a valid boolean (use true/false)` });
            rowValid = false;
          }
          break;
        }

        case 'date': {
          const d = new Date(rawVal);
          if (isNaN(d.getTime())) {
            errors.push({ row: rowNum, column: col.label, message: `"${rawVal}" is not a valid date (use YYYY-MM-DD)` });
            rowValid = false;
          } else {
            record[col.key] = d;
          }
          break;
        }

        case 'email': {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(rawVal)) {
            errors.push({ row: rowNum, column: col.label, message: `"${rawVal}" is not a valid email` });
            rowValid = false;
          } else {
            record[col.key] = rawVal.toLowerCase();
          }
          break;
        }

        case 'phone': {
          const phone = normalizePhone(rawVal);
          if (phone.length < 10 || !/^\d+$/.test(phone)) {
            errors.push({ row: rowNum, column: col.label, message: `"${rawVal}" is not a valid phone number` });
            rowValid = false;
          } else {
            record[col.key] = phone;
          }
          break;
        }

        case 'enum': {
          const upper = rawVal.toUpperCase();
          if (col.enumValues && !col.enumValues.includes(upper)) {
            errors.push({
              row: rowNum,
              column: col.label,
              message: `"${rawVal}" must be one of: ${col.enumValues.join(', ')}`,
            });
            rowValid = false;
          } else {
            record[col.key] = upper;
          }
          break;
        }
      }
    }

    if (rowValid) {
      validData.push(record);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: validData,
    totalRows: rawRows.filter((r) => Object.values(r).some((v) => v && v.trim() !== '')).length,
    validRows: validData.length,
    skippedRows: rawRows.filter((r) => Object.values(r).some((v) => v && v.trim() !== '')).length - validData.length,
  };
}

// ─── CSV Template Generation ────────────────────────────────────────────────────

export function generateCSVTemplate(type: string): string {
  const schema = IMPORT_SCHEMAS[type];
  if (!schema) throw new Error(`Unknown import type: ${type}`);

  const headers = schema.columns.map((c) => c.key);
  const sampleRows = getSampleRows(type);

  const lines = [headers.join(',')];
  for (const row of sampleRows) {
    const vals = headers.map((h) => {
      const v = row[h] ?? '';
      // Escape commas & quotes in CSV values
      const str = String(v);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    lines.push(vals.join(','));
  }

  return lines.join('\n');
}

function getSampleRows(type: string): Record<string, any>[] {
  switch (type) {
    case 'customers':
      return [
        { name: 'Priya Sharma', phone: '9876543210', email: 'priya@example.com', gender: 'FEMALE', dob: '1990-05-15', notes: 'Prefers organic products', allergies: '', whatsappOptIn: 'true' },
        { name: 'Rahul Verma', phone: '9123456780', email: '', gender: 'MALE', dob: '', notes: '', allergies: 'Sensitive to ammonia', whatsappOptIn: 'false' },
        { name: 'Anita Desai', phone: '8899776655', email: 'anita.d@gmail.com', gender: 'FEMALE', dob: '1985-12-01', notes: 'VIP customer', allergies: '', whatsappOptIn: 'true' },
      ];
    case 'services':
      return [
        { name: 'Haircut - Men', category: 'Hair', durationMins: '30', price: '300', gstRate: '18', active: 'true' },
        { name: 'Hair Spa', category: 'Hair', durationMins: '60', price: '1500', gstRate: '18', active: 'true' },
        { name: 'Bridal Makeup', category: 'Makeup', durationMins: '120', price: '15000', gstRate: '18', active: 'true' },
        { name: 'Manicure', category: 'Nails', durationMins: '45', price: '500', gstRate: '18', active: 'true' },
      ];
    case 'products':
      return [
        { name: 'L\'Oreal Shampoo 500ml', type: 'RETAIL', unit: 'pcs', costPrice: '350', sellingPrice: '550', gstRate: '18', reorderLevel: '10', active: 'true' },
        { name: 'Hair Color - Black', type: 'CONSUMABLE', unit: 'pcs', costPrice: '200', sellingPrice: '0', gstRate: '18', reorderLevel: '20', active: 'true' },
        { name: 'Nail Polish Set', type: 'RETAIL', unit: 'set', costPrice: '400', sellingPrice: '700', gstRate: '18', reorderLevel: '5', active: 'true' },
      ];
    case 'vendors':
      return [
        { name: 'Beauty Supplies Co.', phone: '9876500001', email: 'orders@beautysupplies.in', address: '123 MG Road, Mumbai', active: 'true' },
        { name: 'Salon Essentials', phone: '9876500002', email: 'sales@salonessentials.com', address: '45 Linking Road, Delhi', active: 'true' },
      ];
    case 'staff':
      return [
        { name: 'Meena Kumari', email: 'meena@salon.com', phone: '9988776655', role: 'STAFF', designation: 'Senior Stylist', baseSalary: '25000', commissionPct: '10' },
        { name: 'Vikram Singh', email: 'vikram@salon.com', phone: '9988776656', role: 'MANAGER', designation: 'Branch Manager', baseSalary: '35000', commissionPct: '5' },
        { name: 'Pooja Patel', email: 'pooja@salon.com', phone: '9988776657', role: 'RECEPTION', designation: 'Front Desk', baseSalary: '18000', commissionPct: '0' },
      ];
    default:
      return [];
  }
}
