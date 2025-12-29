import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import prisma from '@/app/lib/prisma';
import { sendPasswordResetEmail } from '@/app/lib/n8n-webhook';
import { checkRateLimit, getIpFromRequest, RATE_LIMITS } from '@/app/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check - strict for password reset
    const ip = getIpFromRequest(request);
    const rateLimitResult = checkRateLimit(ip, 'password-reset', RATE_LIMITS.PASSWORD_RESET);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: `Çok fazla şifre sıfırlama denemesi. ${rateLimitResult.retryAfter} saniye sonra tekrar deneyin.` },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter),
          }
        }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi gereklidir.' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, ad: true, soyad: true },
    });

    if (!user) {
      // Güvenlik: Email'in var olup olmadığını belli etme
      return NextResponse.json(
        { error: 'Bu e-posta adresi sistemde kayıtlı değil.' },
        { status: 404 }
      );
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex');

    // Create password reset record (expires in 180 seconds = 3 minutes)
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + 180);

    await prisma.passwordReset.create({
      data: {
        email: user.email,
        token,
        expires_at: expiresAt,
        n8n_verified: false,
      },
    });

    // Send password reset email via n8n webhook
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    const webhookResult = await sendPasswordResetEmail({
      email: user.email,
      resetToken: token,
      resetUrl,
      userName: `${user.ad} ${user.soyad}`,
      expiresInSeconds: 180,
    });

    if (!webhookResult.success) {
      console.error('n8n webhook error:', webhookResult.error);
      // Devam et, token database'de oluşturuldu
    } else {
      // Update record with n8n verification
      await prisma.passwordReset.update({
        where: { token },
        data: {
          n8n_verified: true,
          n8n_response: JSON.stringify(webhookResult.data),
        },
      });
    }

    return NextResponse.json({
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
      success: true,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
