import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
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

    // 2. Get payment
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

    // 3. Check if payment is already processed
    if (payment.durum === 'TAMAMLANDI') {
      return NextResponse.json({ error: 'Payment already approved' }, { status: 400 });
    }

    if (payment.durum === 'RED') {
      return NextResponse.json({ error: 'Payment was rejected' }, { status: 400 });
    }

    // 4. Update payment status
    const now = new Date();
    const updatedPayment = await prisma.payment.update({
      where: { id: params.id },
      data: {
        durum: 'TAMAMLANDI',
        onaylayan_admin_id: user.id,
        onay_tarihi: now,
        odeme_tarihi: now,
      },
    });

    // 5. Update application status to approved
    await prisma.application.update({
      where: { id: payment.application_id },
      data: {
        durum: 'ODEME_TAMAMLANDI',
      },
    });

    // 6. Send webhook notification
    try {
      const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.fokusistatistik.com';
      const webhookResponse = await fetch(`${webhookUrl}/webhook-test/payment-approved`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.WEBHOOK_API_KEY && {
            'X-Webhook-Key': process.env.WEBHOOK_API_KEY,
          }),
        },
        body: JSON.stringify({
          metadata: {
            requestId: uuidv4(),
            timestamp: new Date().toISOString(),
            source: 'admin-payment-approval',
            environment: process.env.NODE_ENV || 'development',
          },
          approvedBy: {
            adminId: user.id,
            adminName: user.name || '',
            adminEmail: user.email || '',
            adminRole: user.role || 'ADMIN',
          },
          payment: {
            paymentId: payment.id,
            amount: payment.tutar,
            currency: payment.para_birimi,
            paymentMethod: payment.odeme_tipi,
            status: 'TAMAMLANDI',
            applicationId: payment.application_id,
            eventId: payment.application.event.id,
            eventName: payment.application.event.baslik,
            approvalDate: now.toISOString(),
          },
          user: {
            userId: payment.application.user.id,
            userName: `${payment.application.user.ad} ${payment.application.user.soyad}`,
            userEmail: payment.application.user.email,
          },
          notificationTargets: {
            // Notify user that payment was approved
            user: true,
            // Notify admins
            admin: true,
          },
        }),
      });

      if (!webhookResponse.ok) {
        console.warn('Webhook notification failed:', await webhookResponse.text());
      } else {
        const webhookData = await webhookResponse.json();
        console.log('Webhook response:', webhookData);
      }
    } catch (webhookError) {
      console.error('Webhook error (continuing):', webhookError);
      // Don't fail the approval if webhook fails
    }

    // 7. Return success
    return NextResponse.json({
      success: true,
      message: 'Payment approved successfully',
      payment: updatedPayment,
    });
  } catch (error: any) {
    console.error('Payment approval error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to approve payment' },
      { status: 500 }
    );
  }
}
