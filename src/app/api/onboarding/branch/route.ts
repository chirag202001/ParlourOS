import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createBranchSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, ...branchData } = body;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
    }

    const parsed = createBranchSchema.safeParse(branchData);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const branch = await prisma.branch.create({
      data: {
        tenantId,
        name: parsed.data.name,
        city: parsed.data.city || '',
        address: parsed.data.address || '',
        phone: parsed.data.phone || '',
        timezone: parsed.data.timezone || 'Asia/Kolkata',
        currency: 'INR',
      },
    });

    return NextResponse.json({ branchId: branch.id }, { status: 201 });
  } catch (error: any) {
    console.error('Branch creation error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
