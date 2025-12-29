import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Check authentication and authorization
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // 2. Get payment with full details
    const payment = await prisma.payment.findUnique({
      where: {
        id: params.id,
      },
      include: {
        application: {
          include: {
            user: {
              select: {
                id: true,
                ad: true,
                soyad: true,
                email: true,
                telefon: true,
                kurum: true,
              },
            },
            event: {
              select: {
                id: true,
                baslik: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // 3. Get admin info if payment was approved
    let onaylayan_admin = null;
    if (payment.onaylayan_admin_id) {
      onaylayan_admin = await prisma.user.findUnique({
        where: { id: payment.onaylayan_admin_id },
        select: {
          ad: true,
          soyad: true,
          email: true,
        },
      });
    }

    // 4. Return payment data
    return NextResponse.json({
      success: true,
      payment: {
        ...payment,
        onaylayan_admin,
      },
    });
  } catch (error: any) {
    console.error('Payment fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}
