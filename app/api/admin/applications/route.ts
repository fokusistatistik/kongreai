import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user as any;

    // Check if user has admin, reviewer, or organizer role
    if (!['ADMIN', 'SUPER_ADMIN', 'HAKEM', 'ORGANIZATOR'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Fetch applications based on role
    let applications;

    if (user.role === 'HAKEM') {
      // Reviewers only see applications assigned to them
      applications = await prisma.application.findMany({
        where: {
          reviews: {
            some: {
              hakem_id: user.id,
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              ad: true,
              soyad: true,
              email: true,
              kurum: true,
              unvan: true,
            },
          },
          event: {
            select: {
              id: true,
              baslik: true,
            },
          },
          reviews: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    } else {
      // Admins and organizers see all applications
      applications = await prisma.application.findMany({
        include: {
          user: {
            select: {
              id: true,
              ad: true,
              soyad: true,
              email: true,
              kurum: true,
              unvan: true,
            },
          },
          event: {
            select: {
              id: true,
              baslik: true,
            },
          },
          reviews: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    }

    return NextResponse.json({
      applications,
      total: applications.length,
    });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
