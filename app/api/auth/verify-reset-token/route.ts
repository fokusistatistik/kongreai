import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * This endpoint is called by n8n webhook when user clicks the verification link in email
 * n8n should send: { token: string, verified: true }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, verified } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token gereklidir.' },
        { status: 400 }
      );
    }

    // Find reset token
    const resetToken = await prisma.passwordReset.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        expires_at: true,
        used: true,
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Geçersiz token.' },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > resetToken.expires_at) {
      return NextResponse.json(
        { error: 'Token süresi doldu.' },
        { status: 410 }
      );
    }

    // Check if already used
    if (resetToken.used) {
      return NextResponse.json(
        { error: 'Bu token zaten kullanıldı.' },
        { status: 410 }
      );
    }

    // Mark as verified by n8n
    await prisma.passwordReset.update({
      where: { id: resetToken.id },
      data: {
        n8n_verified: verified === true,
        n8n_response: JSON.stringify(body),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Token doğrulandı.',
    });
  } catch (error: any) {
    console.error('Verify reset token error:', error);
    return NextResponse.json(
      { error: 'Doğrulama başarısız.' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for direct browser access (when user clicks email link)
 * Redirects to the reset password page
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/auth/forgot-password?error=invalid-token', request.url));
    }

    // Find and verify token
    const resetToken = await prisma.passwordReset.findUnique({
      where: { token },
      select: {
        id: true,
        expires_at: true,
        used: true,
      },
    });

    if (!resetToken) {
      return NextResponse.redirect(new URL('/auth/forgot-password?error=invalid-token', request.url));
    }

    if (new Date() > resetToken.expires_at) {
      return NextResponse.redirect(new URL('/auth/forgot-password?error=expired-token', request.url));
    }

    if (resetToken.used) {
      return NextResponse.redirect(new URL('/login?message=already-used', request.url));
    }

    // Mark as verified
    await prisma.passwordReset.update({
      where: { id: resetToken.id },
      data: {
        n8n_verified: true,
        n8n_response: 'Direct browser access',
      },
    });

    // Redirect to reset password page
    return NextResponse.redirect(new URL(`/auth/reset-password?token=${token}`, request.url));
  } catch (error: any) {
    console.error('GET verify reset token error:', error);
    return NextResponse.redirect(new URL('/auth/forgot-password?error=system-error', request.url));
  }
}
