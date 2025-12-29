'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  User,
  CreditCard,
  Building2,
  Calendar,
  FileText,
  AlertCircle,
  Loader2,
  Download,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';

interface PaymentDetail {
  id: string;
  tutar: number;
  para_birimi: string;
  odeme_tipi: string;
  durum: string;
  aciklama: string | null;
  red_nedeni: string | null;
  created_at: string;
  updated_at: string;
  islem_kodu: string | null;
  iyzico_payment_id: string | null;
  iyzico_payment_status: string | null;
  havale_dekont_url: string | null;
  banka_adi: string | null;
  gonderici_adi: string | null;
  havale_tarihi: string | null;
  odeme_tarihi: string | null;
  islem_tarihi: string | null;
  onay_tarihi: string | null;
  transaction_data: string | null;
  application: {
    id: string;
    tip: string;
    baslik: string;
    user: {
      ad: string;
      soyad: string;
      email: string;
      telefon: string | null;
      kurum: string | null;
    };
    event: {
      baslik: string;
      slug: string;
    };
  };
  onaylayan_admin?: {
    ad: string;
    soyad: string;
    email: string;
  };
}

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/admin/login');
      return;
    }
    const user = session.user as any;
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  // Fetch payment details
  useEffect(() => {
    if (!session) return;

    const fetchPayment = async () => {
      try {
        const response = await fetch(`/api/admin/payments/${params.id}`);
        if (!response.ok) {
          throw new Error('Ödeme bulunamadı');
        }
        const data = await response.json();
        setPayment(data.payment);
      } catch (err: any) {
        setError(err.message || 'Ödeme yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [session, params.id]);

  const handleApprove = async () => {
    if (!confirm('Bu ödemeyi onaylamak istediğinizden emin misiniz?')) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/payments/${params.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Onaylama başarısız');
      }

      // Refresh payment data
      const refreshResponse = await fetch(`/api/admin/payments/${params.id}`);
      const refreshData = await refreshResponse.json();
      setPayment(refreshData.payment);

      alert('Ödeme başarıyla onaylandı!');
    } catch (err: any) {
      setError(err.message || 'Onaylama işlemi başarısız');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Lütfen red nedeni giriniz');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/payments/${params.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Reddetme başarısız');
      }

      // Refresh payment data
      const refreshResponse = await fetch(`/api/admin/payments/${params.id}`);
      const refreshData = await refreshResponse.json();
      setPayment(refreshData.payment);

      setShowRejectModal(false);
      setRejectReason('');
      alert('Ödeme reddedildi');
    } catch (err: any) {
      setError(err.message || 'Reddetme işlemi başarısız');
    } finally {
      setProcessing(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && !payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-sm border p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Hata</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Ödemelere Dön
          </Link>
        </div>
      </div>
    );
  }

  if (!payment) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TAMAMLANDI':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4" />
            Tamamlandı
          </span>
        );
      case 'BEKLIYOR':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4" />
            Bekliyor
          </span>
        );
      case 'RED':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4" />
            Reddedildi
          </span>
        );
      case 'IPTAL':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <XCircle className="w-4 h-4" />
            İptal
          </span>
        );
      default:
        return null;
    }
  };

  const isPending = payment.durum === 'BEKLIYOR';
  const isCompleted = payment.durum === 'TAMAMLANDI';
  const isRejected = payment.durum === 'RED';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/admin/payments"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Ödemelere Dön
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Ödeme Detayı</h1>
                <p className="text-gray-600 mt-2">Ödeme ID: {payment.id}</p>
              </div>
              {getStatusBadge(payment.durum)}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Amount */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Ödeme Tutarı</p>
                    <p className="text-4xl font-bold">
                      {payment.tutar.toLocaleString('tr-TR')} {payment.para_birimi}
                    </p>
                  </div>
                  <DollarSign className="w-16 h-16 text-blue-400" />
                </div>
              </div>

              {/* User Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Kullanıcı Bilgileri
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ad Soyad</p>
                    <p className="font-medium text-gray-900">
                      {payment.application.user.ad} {payment.application.user.soyad}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">E-posta</p>
                    <p className="font-medium text-gray-900">{payment.application.user.email}</p>
                  </div>
                  {payment.application.user.telefon && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Telefon</p>
                      <p className="font-medium text-gray-900">{payment.application.user.telefon}</p>
                    </div>
                  )}
                  {payment.application.user.kurum && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Kurum</p>
                      <p className="font-medium text-gray-900">{payment.application.user.kurum}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Application Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Başvuru Bilgileri
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Etkinlik</p>
                    <p className="font-medium text-gray-900">{payment.application.event.baslik}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Başvuru Türü</p>
                    <p className="font-medium text-gray-900">{payment.application.tip}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Başvuru Başlığı</p>
                    <p className="font-medium text-gray-900">{payment.application.baslik}</p>
                  </div>
                  <Link
                    href={`/admin/applications/${payment.application.id}`}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Başvuruyu Görüntüle →
                  </Link>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Ödeme Detayları
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ödeme Yöntemi</p>
                    <p className="font-medium text-gray-900">
                      {payment.odeme_tipi === 'HAVALE_EFT' ? 'Havale/EFT' :
                       payment.odeme_tipi === 'KREDI_KARTI' ? 'Kredi Kartı' :
                       payment.odeme_tipi}
                    </p>
                  </div>
                  {payment.islem_kodu && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">İşlem Kodu</p>
                      <p className="font-mono text-sm text-gray-900">{payment.islem_kodu}</p>
                    </div>
                  )}
                  {payment.odeme_tipi === 'HAVALE_EFT' && (
                    <>
                      {payment.banka_adi && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Banka</p>
                          <p className="font-medium text-gray-900">{payment.banka_adi}</p>
                        </div>
                      )}
                      {payment.gonderici_adi && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Gönderen</p>
                          <p className="font-medium text-gray-900">{payment.gonderici_adi}</p>
                        </div>
                      )}
                      {payment.havale_tarihi && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Havale Tarihi</p>
                          <p className="font-medium text-gray-900">
                            {new Date(payment.havale_tarihi).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      )}
                      {payment.havale_dekont_url && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500 mb-2">Dekont</p>
                          <a
                            href={payment.havale_dekont_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Dekontu Görüntüle
                          </a>
                        </div>
                      )}
                    </>
                  )}
                  {payment.odeme_tipi === 'KREDI_KARTI' && (
                    <>
                      {payment.iyzico_payment_id && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">iyzico Payment ID</p>
                          <p className="font-mono text-sm text-gray-900">{payment.iyzico_payment_id}</p>
                        </div>
                      )}
                      {payment.iyzico_payment_status && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">iyzico Durum</p>
                          <p className="font-medium text-gray-900">{payment.iyzico_payment_status}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {payment.aciklama && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-1">Açıklama</p>
                    <p className="text-gray-900">{payment.aciklama}</p>
                  </div>
                )}
              </div>

              {/* Rejection Reason */}
              {isRejected && payment.red_nedeni && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Red Nedeni
                  </h2>
                  <p className="text-red-800">{payment.red_nedeni}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6 space-y-6">
                {/* Dates */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Tarihler
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-500">Oluşturulma</p>
                      <p className="font-medium text-gray-900">
                        {new Date(payment.created_at).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    {payment.odeme_tarihi && (
                      <div>
                        <p className="text-gray-500">Ödeme</p>
                        <p className="font-medium text-gray-900">
                          {new Date(payment.odeme_tarihi).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    )}
                    {payment.onay_tarihi && (
                      <div>
                        <p className="text-gray-500">Onay</p>
                        <p className="font-medium text-gray-900">
                          {new Date(payment.onay_tarihi).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Info */}
                {payment.onaylayan_admin && (
                  <div className="pt-4 border-t space-y-2">
                    <h3 className="font-semibold text-gray-900 text-sm">Onaylayan Admin</h3>
                    <p className="text-sm text-gray-900">
                      {payment.onaylayan_admin.ad} {payment.onaylayan_admin.soyad}
                    </p>
                    <p className="text-xs text-gray-500">{payment.onaylayan_admin.email}</p>
                  </div>
                )}

                {/* Actions */}
                {isPending && (
                  <div className="pt-4 border-t space-y-3">
                    <h3 className="font-semibold text-gray-900">İşlemler</h3>
                    <button
                      onClick={handleApprove}
                      disabled={processing}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          İşleniyor...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Onayla
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={processing}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-5 h-5" />
                      Reddet
                    </button>
                  </div>
                )}

                {isCompleted && (
                  <div className="pt-4 border-t">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Ödeme onaylandı
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ödemeyi Reddet</h2>
            <p className="text-sm text-gray-600 mb-4">
              Lütfen red nedenini açıklayınız. Bu bilgi kullanıcıya iletilecektir.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Red nedeni..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'İşleniyor...' : 'Reddet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
