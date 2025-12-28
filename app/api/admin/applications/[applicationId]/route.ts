import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user as any;

    // Check if user has appropriate role
    if (!['ADMIN', 'SUPER_ADMIN', 'HAKEM', 'ORGANIZATOR'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const application = await prisma.application.findUnique({
      where: {
        id: params.applicationId,
      },
      include: {
        user: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            email: true,
            telefon: true,
            unvan: true,
            kurum: true,
          },
        },
        event: {
          select: {
            id: true,
            baslik: true,
            baslangic_tarihi: true,
            bitis_tarihi: true,
          },
        },
        reviews: {
          include: {
            hakem: {
              select: {
                ad: true,
                soyad: true,
                email: true,
                unvan: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // If user is a reviewer, check if they're assigned to this application
    if (user.role === 'HAKEM') {
      const isAssigned = application.reviews.some(
        (review: any) => review.hakem.email === user.email
      );

      if (!isAssigned) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      application,
    });
  } catch (error: any) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user as any;

    // Only admins and organizers can update application status
    if (!['ADMIN', 'SUPER_ADMIN', 'ORGANIZATOR'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { durum, yonetici_notu, sunum_tarihi, sunum_salonu, oturum } = body;

    const updatedApplication = await prisma.application.update({
      where: {
        id: params.applicationId,
      },
      data: {
        durum,
        yonetici_notu: yonetici_notu || null,
        sunum_tarihi: sunum_tarihi || null,
        sunum_salonu: sunum_salonu || null,
        oturum: oturum || null,
        updated_at: new Date(),
        ...(durum === 'KABUL' || durum === 'RED' ? { karar_tarihi: new Date() } : {}),
      },
    });

    return NextResponse.json({
      message: 'Application updated successfully',
      application: updatedApplication,
    });
  } catch (error: any) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
