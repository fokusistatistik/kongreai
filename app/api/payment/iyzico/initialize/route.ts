import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// iyzico configuration (would come from environment in production)
const IYZICO_API_KEY = process.env.IYZICO_API_KEY || '';
const IYZICO_SECRET_KEY = process.env.IYZICO_SECRET_KEY || '';
const IYZICO_BASE_URL = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;

    // 2. Parse request
    const { applicationId, amount } = await request.json();

    if (!applicationId || !amount) {
      return NextResponse.json(
        { error: 'Application ID and amount required' },
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

    // 5. Create payment record
    const paymentId = uuidv4();
    const conversationId = `${applicationId.substring(0, 8)}-${Date.now()}`;

    const payment = await prisma.payment.create({
      data: {
        id: paymentId,
        application_id: applicationId,
        user_id: user.id,
        tutar: amount,
        odeme_tipi: 'KREDI_KARTI',
        durum: 'BEKLIYOR',
        islem_tarihi: new Date(),
        aciklama: `${application.event.baslik} - ${application.tip}`,
        // Store iyzico conversation ID for tracking
        // Note: Add a text field in schema if needed
      },
    });

    // 6. Send to n8n webhook for payment processing
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
            source: 'iyzico-payment-init',
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
            conversationId,
            amount,
            currency: 'TRY',
            paymentMethod: 'iyzico',
            applicationId,
            eventId: application.event.id,
            eventName: application.event.baslik,
          },
          buyer: {
            id: user.id,
            name: application.user.ad,
            surname: application.user.soyad,
            email: application.user.email,
            phone: application.user.telefon || '',
            identityNumber: '00000000000', // Mock - would come from user profile
            address: 'Address', // Mock
            city: application.user.sehir || 'Istanbul',
            country: application.user.ulke || 'Turkey',
          },
          callbackUrls: {
            success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/callback/success`,
            failure: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/callback/failure`,
          },
        }),
      });

      if (webhookResponse.ok) {
        const webhookData = await webhookResponse.json();

        // If webhook returns payment URL from iyzico
        if (webhookData.data?.paymentPageUrl) {
          return NextResponse.json({
            success: true,
            paymentId,
            paymentPageUrl: webhookData.data.paymentPageUrl,
          });
        }

        if (webhookData.data?.checkoutFormContent) {
          return NextResponse.json({
            success: true,
            paymentId,
            checkoutFormContent: webhookData.data.checkoutFormContent,
          });
        }
      }
    } catch (webhookError) {
      console.error('Webhook error:', webhookError);
      // Continue with mock response for development
    }

    // 7. Mock response for development (remove in production)
    // In production, this would integrate with actual iyzico API
    const mockPaymentUrl = `https://sandbox-api.iyzipay.com/payment/auth/ecom/detail/${paymentId}`;

    return NextResponse.json({
      success: true,
      paymentId,
      paymentPageUrl: mockPaymentUrl,
      message:
        'This is a mock payment URL. In production, this would be a real iyzico payment page.',
    });
  } catch (error: any) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment initialization failed' },
      { status: 500 }
    );
  }
}
