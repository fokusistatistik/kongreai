import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;

    // 2. Parse request
    const { applicationId, receiptFile, amount } = await request.json();

    if (!applicationId || !receiptFile || !amount) {
      return NextResponse.json(
        { error: 'Application ID, receipt file, and amount required' },
        { status: 400 }
      );
    }

    // 3. Get application
    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
        user_id: user.id, // Security check
      },
      include: {
        event: true,
        user: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // 4. Check if payment already exists
    const existingPayment = await prisma.payment.findFirst({
      where: {
        application_id: applicationId,
        durum: { in: ['BEKLIYOR', 'TAMAMLANDI'] },
      },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already exists for this application' },
        { status: 400 }
      );
    }

    // 5. Create payment record with pending status
    const paymentId = uuidv4();

    const payment = await prisma.payment.create({
      data: {
        id: paymentId,
        application_id: applicationId,
        user_id: user.id,
        tutar: amount,
        odeme_tipi: 'HAVALE_EFT',
        durum: 'BEKLIYOR', // Pending approval
        islem_tarihi: new Date(),
        aciklama: `${application.event.baslik} - ${application.tip} - Havale/EFT (Onay Bekliyor)`,
      },
    });

    // 6. Send to n8n webhook for notification and tracking
    try {
      const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.fokusistatistik.com';
      const webhookResponse = await fetch(`${webhookUrl}/webhook-test/payment-process`, {
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
            source: 'bank-transfer-submit',
            environment: process.env.NODE_ENV || 'development',
          },
          requestedBy: {
            userId: user.id,
            userEmail: user.email || '',
            userName: user.name || '',
            userRole: user.role || 'KATILIMCI',
          },
          payment: {
            paymentId,
            amount,
            currency: 'TRY',
            paymentMethod: 'bank_transfer',
            status: 'pending_approval',
            applicationId,
            eventId: application.event.id,
            eventName: application.event.baslik,
            receiptFile: {
              id: receiptFile.id,
              name: receiptFile.name,
              url: receiptFile.url,
              size: receiptFile.size,
              type: receiptFile.type,
            },
          },
          applicant: {
            userId: application.user.id,
            userName: `${application.user.ad} ${application.user.soyad}`,
            userEmail: application.user.email,
            phone: application.user.telefon || '',
          },
          notificationTargets: {
            // Notify organizers to approve payment
            admin: true,
            // Notify user that receipt was received
            user: true,
          },
        }),
      });

      if (!webhookResponse.ok) {
        console.warn('Webhook notification failed (continuing):', await webhookResponse.text());
      } else {
        const webhookData = await webhookResponse.json();
        console.log('Webhook response:', webhookData);
      }
    } catch (webhookError) {
      console.error('Webhook error (continuing):', webhookError);
      // Don't fail the submission if webhook fails
    }

    // 7. Update application status to indicate payment is pending
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        durum: 'ODEME_BEKLIYOR', // Or keep existing status based on business logic
      },
    });

    // 8. Return success
    return NextResponse.json({
      success: true,
      paymentId,
      message: 'Payment receipt submitted successfully. Waiting for approval.',
    });
  } catch (error: any) {
    console.error('Bank transfer submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Submission failed' },
      { status: 500 }
    );
  }
}
