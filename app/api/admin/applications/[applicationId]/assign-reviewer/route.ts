import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';

export async function POST(
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

    // Only admins and organizers can assign reviewers
    if (!['ADMIN', 'SUPER_ADMIN', 'ORGANIZATOR'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reviewerId } = body;

    if (!reviewerId) {
      return NextResponse.json(
        { error: 'Reviewer ID is required' },
        { status: 400 }
      );
    }

    // Check if application exists
    const application = await prisma.application.findUnique({
      where: { id: params.applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if reviewer exists and has HAKEM role
    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId },
    });

    if (!reviewer || reviewer.role !== 'HAKEM') {
      return NextResponse.json(
        { error: 'Invalid reviewer' },
        { status: 400 }
      );
    }

    // Check if reviewer is already assigned
    const existingReview = await prisma.review.findUnique({
      where: {
        application_id_hakem_id: {
          application_id: params.applicationId,
          hakem_id: reviewerId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Bu hakem zaten bu başvuruya atanmış' },
        { status: 400 }
      );
    }

    // Create review assignment
    const review = await prisma.review.create({
      data: {
        application_id: params.applicationId,
        hakem_id: reviewerId,
        tamamlandi: false,
      },
    });

    // Update application status to HAKEMDE if it was BEKLEMEDE
    if (application.durum === 'BEKLEMEDE') {
      await prisma.application.update({
        where: { id: params.applicationId },
        data: {
          durum: 'HAKEMDE',
          updated_at: new Date(),
        },
      });
    }

    return NextResponse.json({
      message: 'Reviewer assigned successfully',
      review,
    });
  } catch (error: any) {
    console.error('Error assigning reviewer:', error);
    return NextResponse.json(
      { error: 'Failed to assign reviewer' },
      { status: 500 }
    );
  }
}
