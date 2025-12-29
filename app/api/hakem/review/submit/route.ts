import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';
import { submitReviewViaWebhook } from '@/app/lib/n8n-webhook';

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;

    // 2. Verify user is a reviewer (HAKEM)
    if (user.role !== 'HAKEM') {
      return NextResponse.json(
        { error: 'Only reviewers can submit reviews' },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const {
      assignmentId,
      applicationId,
      eventId,
      eventName,
      applicationBaslik,
      applicantName,
      applicantEmail,
      reviewData,
      tamamlandi,
    } = body;

    // 4. Validate required fields
    if (!applicationId || !eventId) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, eventId' },
        { status: 400 }
      );
    }

    if (tamamlandi && (!reviewData.karar || !reviewData.puan)) {
      return NextResponse.json(
        { error: 'For final submission, both karar and puan are required' },
        { status: 400 }
      );
    }

    // 5. Get or create review in database
    let review = await prisma.review.findUnique({
      where: {
        application_id_hakem_id: {
          application_id: applicationId,
          hakem_id: user.id,
        },
      },
    });

    if (review) {
      // Update existing review
      review = await prisma.review.update({
        where: {
          id: review.id,
        },
        data: {
          puan: reviewData.puan || review.puan,
          karar: reviewData.karar || review.karar,
          yorum: reviewData.yorum !== undefined ? reviewData.yorum : review.yorum,
          gizli_yorum: reviewData.gizli_yorum !== undefined ? reviewData.gizli_yorum : review.gizli_yorum,
          tamamlandi,
          tamamlanma_tarihi: tamamlandi ? new Date() : review.tamamlanma_tarihi,
          updated_at: new Date(),
        },
      });
    } else {
      // Create new review
      review = await prisma.review.create({
        data: {
          application_id: applicationId,
          hakem_id: user.id,
          puan: reviewData.puan,
          karar: reviewData.karar,
          yorum: reviewData.yorum,
          gizli_yorum: reviewData.gizli_yorum,
          tamamlandi,
          tamamlanma_tarihi: tamamlandi ? new Date() : null,
        },
      });
    }

    // 6. Get applicant info from database
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: true,
        event: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // 7. Send to n8n webhook (only if completed)
    if (tamamlandi) {
      try {
        const webhookResponse = await submitReviewViaWebhook({
          metadata: {
            requestId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            source: 'hakem-review-submit',
            environment: process.env.NODE_ENV || 'development',
          },
          requestedBy: {
            userId: user.id,
            userEmail: user.email || '',
            userName: user.name || '',
            userRole: 'HAKEM',
          },
          event: {
            eventId: application.event.id,
            eventName: application.event.baslik,
            eventSlug: application.event.slug,
          },
          application: {
            applicationId: application.id,
            baslik: application.baslik,
            tip: application.tip,
          },
          applicant: {
            userId: application.user.id,
            userName: `${application.user.ad} ${application.user.soyad}`,
            userEmail: application.user.email,
          },
          review: {
            reviewId: review.id,
            puan: review.puan || undefined,
            karar: review.karar || '',
            yorum: review.yorum || undefined,
            revizyonTalebi: review.karar === 'REVIZYON' ? review.yorum : undefined,
            status: tamamlandi ? 'TAMAMLANDI' : 'BEKLEMEDE',
          },
          reviewer: {
            reviewerId: user.id,
            reviewerName: user.name || '',
            reviewerEmail: user.email || '',
          },
          operationType: reviewData.puan ? 'update' : 'submit',
        });

        if (!webhookResponse.success) {
          console.warn('n8n webhook failed (continuing):', webhookResponse.error);
          // Don't fail the request, review is already saved in DB
        }
      } catch (webhookError) {
        console.error('n8n webhook error (continuing):', webhookError);
        // Don't fail the request, review is already saved in DB
      }
    }

    // 8. Update application status if review is completed
    if (tamamlandi) {
      // Check if all reviews for this application are completed
      const allReviews = await prisma.review.findMany({
        where: { application_id: applicationId },
      });

      const allCompleted = allReviews.every((r) => r.tamamlandi);

      if (allCompleted) {
        // Update application status to indicate all reviews are done
        await prisma.application.update({
          where: { id: applicationId },
          data: {
            durum: 'DEGERLENDIRILIYOR', // Or KABUL/RED based on review results
            updated_at: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      reviewId: review.id,
      message: tamamlandi
        ? 'Review submitted successfully'
        : 'Review saved as draft',
    });
  } catch (error: any) {
    console.error('Review submit error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
