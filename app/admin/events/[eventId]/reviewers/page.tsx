'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  UserCheck,
  ArrowLeft,
  Plus,
  X,
  Search,
  Mail,
  Building2,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  Trash2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import {
  assignReviewerViaWebhook,
  unassignReviewerViaWebhook,
  listEventReviewersViaWebhook,
  listReviewersViaWebhook,
  getEventViaWebhook,
  WebhookRequestedBy
} from '@/app/lib/n8n-webhook';
import { v4 as uuidv4 } from 'uuid';

interface Reviewer {
  id: string;
  email: string;
  name: string;
  uzmanlik_alani?: string;
  totalReviews: number;
  pendingReviews: number;
  completedReviews: number;
}

interface AssignedReviewer {
  assignmentId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerEmail: string;
  uzmanlikAlani?: string;
  durum: string;
  atanmaTarihi: string;
  kabulTarihi?: string;
  notlar?: string;
  reviewCount: number;
  completedReviews: number;
  pendingReviews: number;
}

export default function EventReviewersPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const eventId = params?.eventId as string;

  const [event, setEvent] = useState<any>(null);
  const [assignedReviewers, setAssignedReviewers] = useState<AssignedReviewer[]>([]);
  const [availableReviewers, setAvailableReviewers] = useState<Reviewer[]>([]);
  const [filteredReviewers, setFilteredReviewers] = useState<Reviewer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState<Reviewer | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authorization
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      if (!session) return;

      try {
        const response = await getEventViaWebhook({
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
          event: {
            eventId: eventId,
          },
        });

        if (response.success && response.data) {
          setEvent(response.data);
        } else {
          setError('Etkinlik yüklenemedi');
        }
      } catch (err) {
        console.error('Event fetch error:', err);
        setError('Etkinlik yüklenirken hata oluştu');
      }
    };

    if (eventId && session) {
      fetchEvent();
    }
  }, [eventId, session]);

  // Fetch assigned reviewers and available reviewers
  useEffect(() => {
    const fetchReviewers = async () => {
      if (!session || !event) return;

      setLoading(true);
      try {
        const requestedBy: WebhookRequestedBy = {
          userId: session.user.id,
          userEmail: session.user.email,
          userName: session.user.name,
          userRole: session.user.role,
        };

        // Fetch assigned reviewers
        const assignedResponse = await listEventReviewersViaWebhook({
          metadata: {
            requestId: uuidv4(),
            timestamp: new Date().toISOString(),
            source: 'web-app',
            environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
          },
          requestedBy,
          event: {
            eventId: eventId,
          },
          filters: {},
        });

        if (assignedResponse.success && assignedResponse.data) {
          setAssignedReviewers(assignedResponse.data);
        }

        // Fetch all available reviewers
        const availableResponse = await listReviewersViaWebhook({
          metadata: {
            requestId: uuidv4(),
            timestamp: new Date().toISOString(),
            source: 'web-app',
            environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
          },
          requestedBy,
          filters: {},
        });

        if (availableResponse.success && availableResponse.data) {
          setAvailableReviewers(availableResponse.data);
          setFilteredReviewers(availableResponse.data);
        }
      } catch (err) {
        console.error('Reviewers fetch error:', err);
        setError('Hakem listesi yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (session && event) {
      fetchReviewers();
    }
  }, [session, event, eventId]);

  // Filter reviewers based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredReviewers(availableReviewers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = availableReviewers.filter(
      (reviewer) =>
        reviewer.name.toLowerCase().includes(query) ||
        reviewer.email.toLowerCase().includes(query) ||
        (reviewer.uzmanlik_alani && reviewer.uzmanlik_alani.toLowerCase().includes(query))
    );
    setFilteredReviewers(filtered);
  }, [searchQuery, availableReviewers]);

  const handleAssignReviewer = async () => {
    if (!selectedReviewer || !session || !event) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await assignReviewerViaWebhook({
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
        event: {
          eventId: event.id,
          eventName: event.baslik,
          eventSlug: event.slug,
          eventType: event.tip,
          eventDates: {
            baslangicTarihi: event.baslangic_tarihi,
            bitisTarihi: event.bitis_tarihi,
            sonBasvuruTarihi: event.son_basvuru_tarihi,
          },
        },
        assignment: {
          assignmentId: uuidv4(),
          reviewerId: selectedReviewer.id,
          reviewerName: selectedReviewer.name,
          reviewerEmail: selectedReviewer.email,
          uzmanlikAlani: selectedReviewer.uzmanlik_alani,
          notlar: assignmentNotes || undefined,
        },
      });

      if (response.success) {
        // Refresh assigned reviewers list
        const updatedResponse = await listEventReviewersViaWebhook({
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
          event: {
            eventId: eventId,
          },
          filters: {},
        });

        if (updatedResponse.success && updatedResponse.data) {
          setAssignedReviewers(updatedResponse.data);
        }

        // Close modal and reset
        setShowAssignModal(false);
        setSelectedReviewer(null);
        setAssignmentNotes('');
      } else {
        setError(response.error || 'Hakem atama başarısız oldu');
      }
    } catch (err) {
      console.error('Assignment error:', err);
      setError('Hakem atama sırasında hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassignReviewer = async (assignmentId: string, reviewerId: string) => {
    if (!session || !event) return;
    if (!confirm('Bu hakemi etkinlikten çıkarmak istediğinizden emin misiniz?')) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await unassignReviewerViaWebhook({
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
        event: {
          eventId: event.id,
          eventName: event.baslik,
          eventSlug: event.slug,
          eventType: event.tip,
          eventDates: {
            baslangicTarihi: event.baslangic_tarihi,
            bitisTarihi: event.bitis_tarihi,
            sonBasvuruTarihi: event.son_basvuru_tarihi,
          },
        },
        assignment: {
          assignmentId,
          reviewerId,
        },
      });

      if (response.success) {
        // Refresh list
        setAssignedReviewers((prev) => prev.filter((r) => r.assignmentId !== assignmentId));
      } else {
        setError(response.error || 'Hakem çıkarma başarısız oldu');
      }
    } catch (err) {
      console.error('Unassignment error:', err);
      setError('Hakem çıkarma sırasında hata oluştu');
    } finally {
      setSubmitting(false);
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

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Etkinlik bulunamadı</p>
          <Link
            href="/admin/events"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Etkinliklere dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/admin/events/${eventId}/edit`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Etkinlik Düzenlemeye Dön
          </Link>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-600 rounded-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Hakem Yönetimi</h1>
                <p className="text-gray-600 mt-1">{event.baslik}</p>
              </div>
            </div>
            <button
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Hakem Ata
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Hata</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600">Toplam Hakem</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{assignedReviewers.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600">Kabul Edildi</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {assignedReviewers.filter((r) => r.durum === 'KABUL_EDILDI').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600">Beklemede</div>
            <div className="text-3xl font-bold text-yellow-600 mt-2">
              {assignedReviewers.filter((r) => r.durum === 'BEKLEMEDE').length}
            </div>
          </div>
        </div>

        {/* Assigned Reviewers List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Atanmış Hakemler</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hakem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-posta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uzmanlık Alanı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Atama Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Değerlendirmeler
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignedReviewers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">Henüz hakem atanmamış</p>
                      <button
                        onClick={() => setShowAssignModal(true)}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        İlk hakemi atayın
                      </button>
                    </td>
                  </tr>
                ) : (
                  assignedReviewers.map((reviewer) => (
                    <tr key={reviewer.assignmentId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                              {reviewer.reviewerName.split(' ').map(n => n[0]).join('')}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {reviewer.reviewerName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {reviewer.reviewerEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reviewer.uzmanlikAlani || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {reviewer.durum === 'KABUL_EDILDI' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3" />
                            Kabul Edildi
                          </span>
                        ) : reviewer.durum === 'REDDEDILDI' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3" />
                            Reddedildi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Calendar className="w-3 h-3" />
                            Beklemede
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(reviewer.atanmaTarihi).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 font-medium">
                            {reviewer.completedReviews} / {reviewer.reviewCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleUnassignReviewer(reviewer.assignmentId, reviewer.reviewerId)}
                          disabled={submitting}
                          className="text-red-600 hover:text-red-900 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Çıkar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assign Reviewer Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">Hakem Ata</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedReviewer(null);
                  setAssignmentNotes('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Hakem ara (isim, e-posta, uzmanlık alanı)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Reviewers List */}
              <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                {filteredReviewers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Hakem bulunamadı</p>
                ) : (
                  filteredReviewers.map((reviewer) => {
                    const isAlreadyAssigned = assignedReviewers.some(
                      (ar) => ar.reviewerId === reviewer.id
                    );
                    return (
                      <button
                        key={reviewer.id}
                        onClick={() => !isAlreadyAssigned && setSelectedReviewer(reviewer)}
                        disabled={isAlreadyAssigned}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedReviewer?.id === reviewer.id
                            ? 'border-purple-600 bg-purple-50'
                            : isAlreadyAssigned
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                              {reviewer.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{reviewer.name}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Mail className="w-3 h-3" />
                                {reviewer.email}
                              </div>
                              {reviewer.uzmanlik_alani && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                  <Building2 className="w-3 h-3" />
                                  {reviewer.uzmanlik_alani}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Değerlendirmeler</p>
                            <p className="text-sm font-medium text-gray-900">
                              {reviewer.completedReviews} / {reviewer.totalReviews}
                            </p>
                          </div>
                        </div>
                        {isAlreadyAssigned && (
                          <p className="text-xs text-gray-500 mt-2">Bu hakem zaten atanmış</p>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Notes */}
              {selectedReviewer && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Atama Notu (Opsiyonel)
                  </label>
                  <textarea
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    rows={3}
                    placeholder="Bu atama ile ilgili notlar..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedReviewer(null);
                    setAssignmentNotes('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleAssignReviewer}
                  disabled={!selectedReviewer || submitting}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Atanıyor...' : 'Hakemi Ata'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
