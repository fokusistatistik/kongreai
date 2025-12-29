import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;

    // 2. Get application
    const application = await prisma.application.findUnique({
      where: {
        id: params.applicationId,
        user_id: user.id, // Security: Only show user's own applications
      },
      include: {
        event: true,
        user: true,
        reviews: {
          include: {
            hakem: {
              select: {
                id: true,
                ad: true,
                soyad: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // 3. Calculate payment amount
    const event = application.event;
    let paymentAmount = event.ucret || 0;

    // Check if event is free
    if (event.ucretsiz) {
      paymentAmount = 0;
    }

    // Check for student discount
    if (application.user.ogrenci && event.ogrenci_ucret) {
      paymentAmount = event.ogrenci_ucret;
    }

    // Check for early registration
    const now = new Date();
    const erkenKayit = event.erken_kayit_tarihi ? new Date(event.erken_kayit_tarihi) : null;
    if (erkenKayit && now <= erkenKayit && event.erken_kayit_ucret) {
      paymentAmount = event.erken_kayit_ucret;
    }

    // 4. Get payment info if exists
    const payment = await prisma.payment.findFirst({
      where: {
        application_id: params.applicationId,
      },
    });

    // 5. Return data
    return NextResponse.json({
      success: true,
      application,
      paymentAmount,
      payment,
    });
  } catch (error: any) {
    console.error('Application fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch application' },
      { status: 500 }
    );
  }
}
