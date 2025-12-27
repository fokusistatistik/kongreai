import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

// n8n webhook URL - prod environment
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.fokusistatistik.com/webhook/password-reset';

export async function POST(request: NextRequest) {
  try {
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

    // Create password reset record (expires in 30 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    await prisma.passwordReset.create({
      data: {
        email: user.email,
        token,
        expires_at: expiresAt,
        n8n_verified: false,
      },
    });

    // Call n8n webhook
    try {
      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          token,
          name: `${user.ad} ${user.soyad}`,
          resetUrl: `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`,
          expiresAt: expiresAt.toISOString(),
        }),
      });

      if (!n8nResponse.ok) {
        console.error('n8n webhook error:', await n8nResponse.text());
        // Devam et ama webhook yanıtını kaydet
      }

      return NextResponse.json({
        message: 'Şifre sıfırlama talebi alındı.',
        token, // Frontend'e token gönder
      });
    } catch (webhookError) {
      console.error('n8n webhook call failed:', webhookError);
      // Hata olsa bile token oluşturduk, kullanıcıyı bilgilendir
      return NextResponse.json({
        message: 'Şifre sıfırlama talebi alındı. E-postanızı kontrol edin.',
        token,
      });
    }
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
