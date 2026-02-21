import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate, generateInvoiceNumber, computeGST, slugify } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn()', () => {
    it('merges class names correctly', () => {
      const result = cn('text-sm', 'font-bold');
      expect(result).toContain('text-sm');
      expect(result).toContain('font-bold');
    });

    it('handles conflicting tailwind classes', () => {
      const result = cn('text-sm', 'text-lg');
      // twMerge should resolve conflict
      expect(result).toBe('text-lg');
    });

    it('handles undefined and null inputs', () => {
      const result = cn('text-sm', undefined, null, 'font-bold');
      expect(result).toContain('text-sm');
      expect(result).toContain('font-bold');
    });
  });

  describe('formatCurrency()', () => {
    it('formats number as INR currency', () => {
      const result = formatCurrency(1500);
      expect(result).toContain('1,500');
      expect(result).toContain('₹');
    });

    it('formats zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });

    it('formats decimal amounts', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('1,234');
    });
  });

  describe('generateInvoiceNumber()', () => {
    it('generates invoice number with prefix', () => {
      const result = generateInvoiceNumber('INV');
      expect(result).toMatch(/^INV-/);
      expect(result.length).toBeGreaterThan(4);
    });

    it('uses default prefix when none provided', () => {
      const result = generateInvoiceNumber();
      expect(result).toMatch(/^INV-/);
    });
  });

  describe('computeGST()', () => {
    it('computes 18% GST correctly', () => {
      const result = computeGST(1000, 18);
      expect(result.cgst).toBe(90);
      expect(result.sgst).toBe(90);
      expect(result.total).toBe(180);
    });

    it('computes 0% GST', () => {
      const result = computeGST(1000, 0);
      expect(result.cgst).toBe(0);
      expect(result.sgst).toBe(0);
      expect(result.total).toBe(0);
    });

    it('computes GST on small amounts', () => {
      const result = computeGST(50, 18);
      expect(result.total).toBe(9);
    });
  });

  describe('slugify()', () => {
    it('converts string to slug', () => {
      expect(slugify('Glamour Studio')).toBe('glamour-studio');
    });

    it('handles special characters', () => {
      expect(slugify('My Salon & Spa!')).toBe('my-salon--spa');
    });

    it('handles multiple spaces', () => {
      expect(slugify('hello   world')).toBe('hello---world');
    });
  });
});

describe('Plans', () => {
  it('has three plans defined', async () => {
    const { PLANS } = await import('@/lib/plans');
    expect(Object.keys(PLANS)).toHaveLength(3);
    expect(PLANS.STARTER).toBeDefined();
    expect(PLANS.PRO).toBeDefined();
    expect(PLANS.MULTI_BRANCH).toBeDefined();
  });

  it('starter plan has correct limits', async () => {
    const { PLANS } = await import('@/lib/plans');
    expect(PLANS.STARTER.maxBranches).toBe(1);
    expect(PLANS.STARTER.maxStaff).toBe(5);
    expect(PLANS.STARTER.price).toBe(999);
  });
});
