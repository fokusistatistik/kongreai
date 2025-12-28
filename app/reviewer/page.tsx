'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import {
  listReviewerAssignmentsViaWebhook,
  updateReviewerAssignmentViaWebhook,
  ReviewerAssignmentDetail,
} from '@/app/lib/n8n-webhook';
import { v4 as uuidv4 } from 'uuid';

export default function ReviewerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [assignments, setAssignments] = useState<ReviewerAssignmentDetail[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<ReviewerAssignmentDetail[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);

  // Check authorization
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'HAKEM') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!session || session.user.role !== 'HAKEM') return;

      setLoading(true);
      try {
        const response = await listReviewerAssignmentsViaWebhook({
          metadata: {
            requestId: uuidv4(),
            timestamp: new Date().toISOString(),
            source: 'web-app',
            environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
          },
          requestedBy: {
            userId: session.user.id,
            userEmail: session.user.email,
            userName: session.user.name,
            userRole: session.user.role,
          },
          reviewer: {
            reviewerId: session.user.id,
          },
          filters: {},
        });

        if (response.success && response.data) {
          setAssignments(response.data);
          setFilteredAssignments(response.data);
        } else {
          setError(response.error || 'Atamalar yüklenemedi');
        }
      } catch (err) {
        console.error('Assignments fetch error:', err);
        setError('Atamalar yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (session && session.user.role === 'HAKEM') {
      fetchAssignments();
    }
  }, [session]);

  // Filter assignments
  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredAssignments(assignments);
    } else {
      setFilteredAssignments(assignments.filter((a) => a.durum === filterStatus));
    }
  }, [filterStatus, assignments]);

  const handleAcceptAssignment = async (assignmentId: string) => {
    if (!session) return;

    setSubmitting(assignmentId);
    setError(null);

    try {
      const response = await updateReviewerAssignmentViaWebhook({
        metadata: {
          requestId: uuidv4(),
          timestamp: new Date().toISOString(),
          source: 'web-app',
          environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
        },
        requestedBy: {
          userId: session.user.id,
          userEmail: session.user.email,
          userName: session.user.name,
          userRole: session.user.role,
        },
        assignment: {
          assignmentId,
          reviewerId: session.user.id,
        },
        update: {
          durum: 'KABUL_EDILDI',
        },
      });

      if (response.success) {
        // Update local state
        setAssignments((prev) =>
          prev.map((a) =>
            a.assignmentId === assignmentId
              ? { ...a, durum: 'KABUL_EDILDI', kabulTarihi: new Date().toISOString() }
              : a
          )
        );
      } else {
        setError(response.error || 'Atama kabul işlemi başarısız oldu');
      }
    } catch (err) {
      console.error('Accept assignment error:', err);
      setError('Atama kabul edilirken hata oluştu');
    } finally {
      setSubmitting(null);
    }
  };

  const handleRejectAssignment = async (assignmentId: string) => {
    if (!session) return;

    const reason = prompt('Reddetme nedeninizi belirtiniz (opsiyonel):');
    if (reason === null) return; // User cancelled

    setSubmitting(assignmentId);
    setError(null);

    try {
      const response = await updateReviewerAssignmentViaWebhook({
        metadata: {
          requestId: uuidv4(),
          timestamp: new Date().toISOString(),
          source: 'web-app',
          environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
        },
        requestedBy: {
          userId: session.user.id,
          userEmail: session.user.email,
          userName: session.user.name,
          userRole: session.user.role,
        },
        assignment: {
          assignmentId,
          reviewerId: session.user.id,
        },
        update: {
          durum: 'REDDEDILDI',
          redNedeni: reason || undefined,
        },
      });

      if (response.success) {
        // Update local state
        setAssignments((prev) =>
          prev.map((a) =>
            a.assignmentId === assignmentId ? { ...a, durum: 'REDDEDILDI' } : a
          )
        );
      } else {
        setError(response.error || 'Atama reddetme işlemi başarısız oldu');
      }
    } catch (err) {
      console.error('Reject assignment error:', err);
      setError('Atama reddedilirken hata oluştu');
    } finally {
      setSubmitting(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: assignments.length,
    pending: assignments.filter((a) => a.durum === 'BEKLEMEDE').length,
    accepted: assignments.filter((a) => a.durum === 'KABUL_EDILDI').length,
    completed: assignments.filter((a) => a.reviewStatus?.tamamlandi).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hakem Paneli</h1>
              <p className="text-gray-600 mt-1">
                Hoş geldiniz, {session?.user?.name}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600">Toplam Görev</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600">Bekleyen</div>
              <div className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600">Kabul Edildi</div>
              <div className="text-3xl font-bold text-green-600 mt-2">{stats.accepted}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600">Tamamlandı</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">{stats.completed}</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Hata</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Tümü ({assignments.length})
          </button>
          <button
            onClick={() => setFilterStatus('BEKLEMEDE')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'BEKLEMEDE'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Bekleyen ({stats.pending})
          </button>
          <button
            onClick={() => setFilterStatus('KABUL_EDILDI')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'KABUL_EDILDI'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Kabul Edildi ({stats.accepted})
          </button>
          <button
            onClick={() => setFilterStatus('TAMAMLANDI')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'TAMAMLANDI'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Tamamlandı ({stats.completed})
          </button>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {filterStatus === 'all'
                  ? 'Henüz size atanmış bir görev bulunmuyor'
                  : 'Bu filtreye uygun görev bulunamadı'}
              </p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
              <div
                key={assignment.assignmentId}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left: Event Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {assignment.eventName}
                        </h3>
                        {assignment.applicationBaslik && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Bildiri:</strong> {assignment.applicationBaslik}
                          </p>
                        )}
                        {assignment.applicantName && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Başvuran:</strong> {assignment.applicantName} ({assignment.applicantEmail})
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(assignment.eventDates.baslangicTarihi).toLocaleDateString('tr-TR')}
                            {' - '}
                            {new Date(assignment.eventDates.bitisTarihi).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Atanma: {new Date(assignment.atanmaTarihi).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                        {assignment.notlar && (
                          <div className="mt-3 flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>Not:</strong> {assignment.notlar}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status and Actions */}
                  <div className="flex flex-col items-start lg:items-end gap-3">
                    {/* Status Badge */}
                    <div>
                      {assignment.durum === 'KABUL_EDILDI' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-4 h-4" />
                          Kabul Edildi
                        </span>
                      ) : assignment.durum === 'REDDEDILDI' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          <XCircle className="w-4 h-4" />
                          Reddedildi
                        </span>
                      ) : assignment.durum === 'TAMAMLANDI' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          <CheckCircle className="w-4 h-4" />
                          Tamamlandı
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-4 h-4" />
                          Beklemede
                        </span>
                      )}
                    </div>

                    {/* Review Status */}
                    {assignment.reviewStatus && (
                      <div className="text-sm text-gray-600">
                        {assignment.reviewStatus.tamamlandi ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Değerlendirme Tamamlandı
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-yellow-600">
                            <Clock className="w-4 h-4" />
                            Değerlendirme Bekleniyor
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {assignment.durum === 'BEKLEMEDE' && (
                        <>
                          <button
                            onClick={() => handleAcceptAssignment(assignment.assignmentId)}
                            disabled={submitting === assignment.assignmentId}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            {submitting === assignment.assignmentId ? 'İşleniyor...' : 'Kabul Et'}
                          </button>
                          <button
                            onClick={() => handleRejectAssignment(assignment.assignmentId)}
                            disabled={submitting === assignment.assignmentId}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            <ThumbsDown className="w-4 h-4" />
                            Reddet
                          </button>
                        </>
                      )}
                      {assignment.durum === 'KABUL_EDILDI' && assignment.applicationId && (
                        <Link
                          href={`/reviewer/review/${assignment.applicationId}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          {assignment.reviewStatus?.tamamlandi ? 'Değerlendirmeyi Gör' : 'Değerlendir'}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
