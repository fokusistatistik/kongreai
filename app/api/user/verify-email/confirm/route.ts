import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/dashboard/profile?verification=invalid', request.url));
    }

    // Find verification record by token
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      select: {
        id: true,
        user_id: true,
        email: true,
        expires_at: true,
        verified: true,
        webhook_verified: true,
      },
    });

    if (!verification) {
      return NextResponse.redirect(new URL('/dashboard/profile?verification=invalid', request.url));
    }

    // Check if already verified
    if (verification.verified) {
      return NextResponse.redirect(new URL('/dashboard/profile?verification=already', request.url));
    }

    // Check if expired (180 seconds)
    if (new Date() > verification.expires_at) {
      return NextResponse.redirect(new URL('/dashboard/profile?verification=expired', request.url));
    }

    // Check if webhook verified the email sending
    if (!verification.webhook_verified) {
      return NextResponse.redirect(new URL('/dashboard/profile?verification=webhook_failed', request.url));
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: verification.user_id },
      select: { id: true, email_verified: true },
    });

    if (!user) {
      return NextResponse.redirect(new URL('/dashboard/profile?verification=notfound', request.url));
    }

    // Update verification record
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: {
        verified: true,
        verified_at: new Date(),
      },
    });

    // Update user as verified
    await prisma.user.update({
      where: { id: verification.user_id },
      data: {
        email_verified: true,
        updated_at: new Date(),
      },
    });

    return NextResponse.redirect(new URL('/dashboard/profile?verification=success', request.url));
  } catch (error: any) {
    console.error('Email verification confirm error:', error);
    return NextResponse.redirect(new URL('/dashboard/profile?verification=error', request.url));
  }
}
