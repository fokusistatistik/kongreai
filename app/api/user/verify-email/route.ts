import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';
import { sendEmailVerification } from '@/app/lib/n8n-webhook';
import { randomBytes } from 'crypto';

const VERIFICATION_TIMEOUT = 180000; // 180 seconds (3 minutes)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        ad: true,
        soyad: true,
        email_verified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı.' },
        { status: 404 }
      );
    }

    if (user.email_verified) {
      return NextResponse.json(
        { error: 'E-posta adresiniz zaten doğrulanmış.' },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/user/verify-email/confirm?token=${verificationToken}&userId=${user.id}`;

    // Send verification email via webhook with 180s timeout
    const webhookPromise = sendEmailVerification({
      metadata: {
        requestId: randomBytes(16).toString('hex'),
        timestamp: new Date().toISOString(),
        source: 'web-app',
        version: '1.0',
      },
      requestedBy: {
        userId: user.id,
        userEmail: user.email,
        userName: `${user.ad} ${user.soyad}`,
      },
      user: {
        userId: user.id,
        userEmail: user.email,
        userName: `${user.ad} ${user.soyad}`,
      },
      verification: {
        verificationToken,
        verificationUrl,
      },
    });

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Webhook timeout')), VERIFICATION_TIMEOUT)
    );

    // Race between webhook response and timeout
    const webhookResponse = await Promise.race([
      webhookPromise,
      timeoutPromise,
    ]) as any;

    if (webhookResponse.success && webhookResponse.data.sent) {
      // Store verification token temporarily (you might want to create a verification table)
      // For now, we'll trust the webhook will handle verification

      return NextResponse.json({
        message: 'Doğrulama e-postası gönderildi. Lütfen e-postanızı kontrol edin.',
        sent: true,
      });
    } else {
      return NextResponse.json(
        { error: 'E-posta gönderilemedi. Lütfen tekrar deneyin.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Email verification error:', error);

    if (error.message === 'Webhook timeout') {
      return NextResponse.json(
        { error: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'E-posta doğrulama sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}
