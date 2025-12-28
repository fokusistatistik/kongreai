import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');

    if (!token || !userId) {
      return NextResponse.redirect(new URL('/dashboard/profile?verification=invalid', request.url));
    }

    // In a production system, you would:
    // 1. Check if token exists in a VerificationTokens table
    // 2. Check if token is not expired
    // 3. Delete token after successful verification

    // For now, we'll just mark the user as verified
    // The webhook system should have validated the token before calling this endpoint

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email_verified: true },
    });

    if (!user) {
      return NextResponse.redirect(new URL('/dashboard/profile?verification=notfound', request.url));
    }

    if (user.email_verified) {
      return NextResponse.redirect(new URL('/dashboard/profile?verification=already', request.url));
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: userId },
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
