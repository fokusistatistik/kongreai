import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, User, Calendar, AlertCircle } from 'lucide-react';
import { authOptions } from '@/app/lib/auth/options';
import { listReviewerAssignmentsViaWebhook } from '@/app/lib/n8n-webhook';
import prisma from '@/app/lib/prisma';
import ReviewForm from '@/app/hakem/review/[assignmentId]/review-form';

interface PageProps {
  params: {
    assignmentId: string;
  };
}

export default async function ReviewPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/admin/login');
  }

  const user = session.user as any;

  // Only HAKEM users can access this page
  if (user.role !== 'HAKEM') {
    redirect('/dashboard');
  }

  // Get assignment details from webhook
  const assignmentsResponse = await listReviewerAssignmentsViaWebhook({
    metadata: {
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      source: 'hakem-review-page',
      environment: process.env.NODE_ENV || 'development',
    },
    requestedBy: {
      userId: user.id || '',
      userEmail: user.email || '',
      userName: user.name || '',
      userRole: 'HAKEM',
    },
    reviewer: {
      reviewerId: user.id || '',
    },
    filters: {},
  });

  const assignment = assignmentsResponse.data?.find(
    (a) => a.assignmentId === params.assignmentId
  );

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Atama Bulunamadı</h2>
          <p className="text-gray-600 mb-6">
            Bu değerlendirme ataması bulunamadı veya size ait değil.
          </p>
          <Link
            href="/hakem/panel"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Panele Dön
          </Link>
        </div>
      </div>
    );
  }

  // Get existing review from database (if any)
  let existingReview = null;
  if (assignment.applicationId) {
    existingReview = await prisma.review.findUnique({
      where: {
        application_id_hakem_id: {
          application_id: assignment.applicationId,
          hakem_id: user.id || '',
        },
      },
      include: {
        application: {
          include: {
            user: true,
            event: true,
          },
        },
      },
    });
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Belirtilmemiş';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/hakem/panel"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Panele Dön</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Bildiri Değerlendirme
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Application Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Event Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h2 className="text-sm font-medium text-gray-500 mb-1">Etkinlik</h2>
                  <p className="text-base font-semibold text-gray-900">
                    {assignment.eventName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(assignment.eventDates?.baslangicTarihi)} -{' '}
                    {formatDate(assignment.eventDates?.bitisTarihi)}
                  </p>
                </div>
              </div>
            </div>

            {/* Application Info */}
            {assignment.applicationBaslik && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start gap-2 mb-4">
                  <FileText className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Bildiri</h2>
                    <p className="text-base font-medium text-gray-900">
                      {assignment.applicationBaslik}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Applicant Info */}
            {assignment.applicantName && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start gap-2">
                  <User className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Başvuran</h2>
                    <p className="text-base font-medium text-gray-900">
                      {assignment.applicantName}
                    </p>
                    {assignment.applicantEmail && (
                      <p className="text-sm text-gray-600 mt-1">{assignment.applicantEmail}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Assignment Info */}
            <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Atama Bilgileri</h3>
              <div className="space-y-1 text-xs text-blue-700">
                <p>Atanma Tarihi: {formatDate(assignment.atanmaTarihi)}</p>
                {assignment.kabulTarihi && (
                  <p>Kabul Tarihi: {formatDate(assignment.kabulTarihi)}</p>
                )}
                {assignment.tamamlanmaTarihi && (
                  <p>Tamamlanma Tarihi: {formatDate(assignment.tamamlanmaTarihi)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Review Form */}
          <div className="lg:col-span-2">
            <ReviewForm
              assignment={assignment}
              existingReview={existingReview}
              reviewer={{
                id: user.id || '',
                name: user.name || '',
                email: user.email || '',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
