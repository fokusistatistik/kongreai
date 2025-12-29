import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { authOptions } from '@/app/lib/auth/options';
import { listReviewerAssignmentsViaWebhook, type ReviewerAssignmentDetail } from '@/app/lib/n8n-webhook';

async function getReviewerAssignments(reviewerId: string, userEmail: string, userName: string) {
  try {
    // Get assignments from n8n webhook
    const response = await listReviewerAssignmentsViaWebhook({
      metadata: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        source: 'hakem-panel',
        environment: process.env.NODE_ENV || 'development',
      },
      requestedBy: {
        userId: reviewerId,
        userEmail,
        userName,
        userRole: 'HAKEM',
      },
      reviewer: {
        reviewerId,
      },
      filters: {
        // Only show active assignments (not rejected)
        durum: 'KABUL_EDILDI',
      },
    });

    if (response.success && response.data) {
      return response.data;
    } else {
      console.warn('n8n reviewer assignments webhook failed:', response.error);
      return [];
    }
  } catch (error) {
    console.error('n8n reviewer assignments webhook error:', error);
    return [];
  }
}

export default async function HakemPanel() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/admin/login');
  }

  const user = session.user as any;

  // Only HAKEM users can access this page
  if (user.role !== 'HAKEM') {
    redirect('/dashboard');
  }

  const assignments = await getReviewerAssignments(
    user.id || '',
    user.email || '',
    user.name || ''
  );

  // Filter active events (with upcoming or ongoing dates)
  const now = new Date();
  const activeAssignments = assignments.filter((assignment) => {
    if (!assignment.eventDates?.bitisTarihi) return true;
    const endDate = new Date(assignment.eventDates.bitisTarihi);
    return endDate >= now;
  });

  // Separate completed and pending reviews
  const pendingReviews = activeAssignments.filter(
    (assignment) => !assignment.reviewStatus?.tamamlandi
  );
  const completedReviews = activeAssignments.filter(
    (assignment) => assignment.reviewStatus?.tamamlandi
  );

  // Count by decision
  const acceptedReviews = completedReviews.filter(
    (assignment) => assignment.reviewStatus?.karar === 'KABUL'
  );
  const rejectedReviews = completedReviews.filter(
    (assignment) => assignment.reviewStatus?.karar === 'RED'
  );
  const revisionReviews = completedReviews.filter(
    (assignment) =>
      assignment.reviewStatus?.karar === 'MINOR_REVISION' ||
      assignment.reviewStatus?.karar === 'MAJOR_REVISION' ||
      assignment.reviewStatus?.karar === 'REVIZYON'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Hakem Değerlendirme Paneli
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Hoş geldiniz, {user.name}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Link
              href="/admin/profile"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm md:text-base"
            >
              <User className="w-4 h-4" />
              <span>Profil Ayarları</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm md:text-base"
            >
              <span>Ana Siteye Dön</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards - Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            title="Toplam Atamalar"
            value={activeAssignments.length}
            icon={<FileText className="w-6 h-6" />}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title="Tamamlanan Değerlendirmeler"
            value={completedReviews.length}
            icon={<CheckCircle className="w-6 h-6" />}
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            title="Bekleyen Değerlendirmeler"
            value={pendingReviews.length}
            icon={<Clock className="w-6 h-6" />}
            color="bg-gradient-to-br from-yellow-500 to-orange-500"
          />
        </div>

        {/* Stats Cards - Detailed Decision Breakdown */}
        {completedReviews.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Değerlendirme Sonuçları
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Kabul Edilenler</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{acceptedReviews.length}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Revizyon Gereken</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">{revisionReviews.length}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Reddedilenler</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{rejectedReviews.length}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Reviews */}
        {pendingReviews.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Bekleyen Değerlendirmeler ({pendingReviews.length})
            </h2>
            <div className="space-y-4">
              {pendingReviews.map((assignment) => (
                <AssignmentCard key={assignment.assignmentId} assignment={assignment} pending />
              ))}
            </div>
          </div>
        )}

        {/* Completed Reviews */}
        {completedReviews.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Tamamlanan Değerlendirmeler ({completedReviews.length})
            </h2>
            <div className="space-y-4">
              {completedReviews.map((assignment) => (
                <AssignmentCard key={assignment.assignmentId} assignment={assignment} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeAssignments.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Henüz Değerlendirme Ataması Bulunmuyor
            </h3>
            <p className="text-gray-600">
              Etkinlik organizatörleri tarafından size değerlendirme ataması yapıldığında burada
              görüntülenecektir.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`${color} text-white p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm font-medium text-gray-600">{title}</p>
      </div>
    </div>
  );
}

function AssignmentCard({
  assignment,
  pending = false,
}: {
  assignment: ReviewerAssignmentDetail;
  pending?: boolean;
}) {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Belirtilmemiş';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Event Name */}
          <div>
            <div className="flex items-start gap-2 mb-1">
              <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{assignment.eventName}</h3>
                <p className="text-sm text-gray-500">
                  {formatDate(assignment.eventDates?.baslangicTarihi)} -{' '}
                  {formatDate(assignment.eventDates?.bitisTarihi)}
                </p>
              </div>
            </div>
          </div>

          {/* Application Details */}
          {assignment.applicationBaslik && (
            <div className="pl-7">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Bildiri Başlığı</p>
                  <p className="text-sm font-medium text-gray-900">
                    {assignment.applicationBaslik}
                  </p>
                </div>
                {assignment.applicantName && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Başvuran</p>
                    <p className="text-sm text-gray-700">
                      {assignment.applicantName}
                      {assignment.applicantEmail && (
                        <span className="text-gray-500"> ({assignment.applicantEmail})</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assignment Info */}
          <div className="pl-7 text-xs text-gray-500">
            <p>Atanma Tarihi: {formatDate(assignment.atanmaTarihi)}</p>
            {assignment.tamamlanmaTarihi && (
              <p>Tamamlanma Tarihi: {formatDate(assignment.tamamlanmaTarihi)}</p>
            )}
          </div>

          {/* Review Status */}
          {assignment.reviewStatus && !pending && (
            <div className="pl-7">
              <div className="flex items-center gap-3">
                {assignment.reviewStatus.puan && (
                  <span className="text-sm font-medium text-gray-700">
                    Puan: {assignment.reviewStatus.puan}/10
                  </span>
                )}
                {assignment.reviewStatus.karar && (
                  <StatusBadge status={assignment.reviewStatus.karar} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex lg:flex-col gap-2">
          <Link
            href={`/hakem/review/${assignment.assignmentId}`}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              pending
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {pending ? (
              <>
                <FileText className="w-4 h-4" />
                Değerlendir
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Görüntüle
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    KABUL: 'bg-green-100 text-green-800',
    RED: 'bg-red-100 text-red-800',
    REVIZYON: 'bg-orange-100 text-orange-800',
  };

  const labels = {
    KABUL: 'Kabul',
    RED: 'Red',
    REVIZYON: 'Revizyon',
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}
