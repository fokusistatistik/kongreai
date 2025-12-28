'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  ArrowLeft,
  User,
  Calendar,
  Building,
  Mail,
  Phone,
  Download,
  UserCheck,
  Save,
  X,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  FileDown,
  Eye,
} from 'lucide-react';

interface Application {
  id: string;
  tip: string;
  baslik: string | null;
  ozet: string | null;
  anahtar_kelimeler: string | null;
  kategori: string | null;
  yazarlar: string | null;
  dosya_url: string | null;
  ek_dosya_url: string | null;
  poster_url: string | null;
  sunum_tercihi: string | null;
  durum: string;
  hakem_notu: string | null;
  revizyon_talep: string | null;
  yonetici_notu: string | null;
  sunum_tarihi: string | null;
  sunum_salonu: string | null;
  oturum: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    ad: string;
    soyad: string;
    email: string;
    telefon: string | null;
    unvan: string | null;
    kurum: string | null;
  };
  event: {
    id: string;
    baslik: string;
    baslangic_tarihi: string;
    bitis_tarihi: string;
  };
  reviews: Array<{
    id: string;
    puan: number | null;
    karar: string | null;
    yorum: string | null;
    tamamlandi: boolean;
    hakem: {
      ad: string;
      soyad: string;
      email: string;
      unvan: string | null;
    };
  }>;
  payment: {
    id: string;
    tutar: number;
    durum: string;
  } | null;
}

export default function ApplicationDetailPage({ params }: { params: { applicationId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    durum: '',
    yonetici_notu: '',
    sunum_tarihi: '',
    sunum_salonu: '',
    oturum: '',
  });

  const [showAssignReviewer, setShowAssignReviewer] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchApplication();
    fetchReviewers();
  }, []);

  useEffect(() => {
    if (application) {
      setFormData({
        durum: application.durum,
        yonetici_notu: application.yonetici_notu || '',
        sunum_tarihi: application.sunum_tarihi || '',
        sunum_salonu: application.sunum_salonu || '',
        oturum: application.oturum || '',
      });
    }
  }, [application]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/admin/applications/${params.applicationId}`);
      const data = await response.json();

      if (response.ok) {
        setApplication(data.application);
      } else {
        setError(data.error || 'Başvuru yüklenemedi');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewers = async () => {
    try {
      const response = await fetch('/api/admin/reviewers');
      const data = await response.json();

      if (response.ok) {
        setReviewers(data.reviewers || []);
      }
    } catch (err) {
      console.error('Error fetching reviewers:', err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/applications/${params.applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Başvuru başarıyla güncellendi!');
        fetchApplication();
      } else {
        setError(data.error || 'Güncelleme sırasında bir hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignReviewer = async () => {
    if (!selectedReviewer) {
      setError('Lütfen bir hakem seçin');
      return;
    }

    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/applications/${params.applicationId}/assign-reviewer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerId: selectedReviewer }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Hakem başarıyla atandı!');
        setShowAssignReviewer(false);
        setSelectedReviewer('');
        fetchApplication();
      } else {
        setError(data.error || 'Hakem ataması sırasında bir hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Başvuru yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-900 font-medium">Başvuru bulunamadı</p>
          <Link
            href="/admin/applications"
            className="text-purple-600 hover:text-purple-700 mt-2 inline-block"
          >
            Başvurular listesine dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Başvurular Listesine Dön
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-purple-600 rounded-lg">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {application.baslik || 'Başvuru Detayı'}
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                {application.event.baslik}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-3 md:p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Applicant Info */}
            <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Başvuran Bilgileri
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={User} label="Ad Soyad" value={`${application.user.ad} ${application.user.soyad}`} />
                <InfoItem icon={Mail} label="E-posta" value={application.user.email} />
                {application.user.telefon && (
                  <InfoItem icon={Phone} label="Telefon" value={application.user.telefon} />
                )}
                {application.user.unvan && (
                  <InfoItem icon={User} label="Ünvan" value={application.user.unvan} />
                )}
                {application.user.kurum && (
                  <InfoItem icon={Building} label="Kurum" value={application.user.kurum} />
                )}
              </div>
            </div>

            {/* Application Details */}
            {application.tip !== 'DINLEYICI' && application.baslik && (
              <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Bildiri Detayları
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Başlık</label>
                    <p className="mt-1 text-gray-900">{application.baslik}</p>
                  </div>

                  {application.ozet && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Özet</label>
                      <p className="mt-1 text-gray-600 whitespace-pre-wrap">{application.ozet}</p>
                    </div>
                  )}

                  {application.anahtar_kelimeler && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Anahtar Kelimeler</label>
                      <p className="mt-1 text-gray-600">{application.anahtar_kelimeler}</p>
                    </div>
                  )}

                  {application.kategori && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Kategori</label>
                      <p className="mt-1 text-gray-600">{application.kategori}</p>
                    </div>
                  )}

                  {application.dosya_url && (
                    <div>
                      <a
                        href={application.dosya_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
                      >
                        <FileDown className="w-4 h-4" />
                        Bildiri Dosyasını İndir
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Management Form */}
            <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Yönetim</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum
                  </label>
                  <select
                    value={formData.durum}
                    onChange={(e) => setFormData({ ...formData, durum: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="BEKLEMEDE">Beklemede</option>
                    <option value="HAKEMDE">Hakemde</option>
                    <option value="KABUL">Kabul</option>
                    <option value="RED">Red</option>
                    <option value="REVIZYON">Revizyon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yönetici Notu
                  </label>
                  <textarea
                    value={formData.yonetici_notu}
                    onChange={(e) => setFormData({ ...formData, yonetici_notu: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="İç not (kullanıcı görmez)"
                  />
                </div>

                {formData.durum === 'KABUL' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sunum Tarihi/Saati
                      </label>
                      <input
                        type="text"
                        value={formData.sunum_tarihi}
                        onChange={(e) => setFormData({ ...formData, sunum_tarihi: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Örn: 15 Mayıs 2024, 10:00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Salon
                      </label>
                      <input
                        type="text"
                        value={formData.sunum_salonu}
                        onChange={(e) => setFormData({ ...formData, sunum_salonu: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Örn: Salon A"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Oturum
                      </label>
                      <input
                        type="text"
                        value={formData.oturum}
                        onChange={(e) => setFormData({ ...formData, oturum: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Örn: Oturum 1"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Değişiklikleri Kaydet
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Durum</h3>
              <div className="space-y-3">
                <StatusBadge status={application.durum} />
                <div className="pt-3 border-t text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Başvuru: {new Date(application.created_at).toLocaleDateString('tr-TR')}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Reviewers */}
            <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Hakemler</h3>
                <button
                  onClick={() => setShowAssignReviewer(!showAssignReviewer)}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {showAssignReviewer ? 'İptal' : '+ Hakem Ata'}
                </button>
              </div>

              {showAssignReviewer && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <select
                    value={selectedReviewer}
                    onChange={(e) => setSelectedReviewer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
                  >
                    <option value="">Hakem Seçin</option>
                    {reviewers.map((reviewer) => (
                      <option key={reviewer.id} value={reviewer.id}>
                        {reviewer.unvan} {reviewer.ad} {reviewer.soyad}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignReviewer}
                    disabled={updating || !selectedReviewer}
                    className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm disabled:bg-purple-400"
                  >
                    Ata
                  </button>
                </div>
              )}

              {application.reviews.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Henüz hakem atanmamış
                </p>
              ) : (
                <div className="space-y-3">
                  {application.reviews.map((review) => (
                    <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">
                        {review.hakem.unvan} {review.hakem.ad} {review.hakem.soyad}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{review.hakem.email}</p>
                      {review.tamamlandi ? (
                        <div className="mt-2 text-xs">
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            Değerlendirme tamamlandı
                          </span>
                          {review.karar && (
                            <p className="mt-1 text-gray-700">Karar: {review.karar}</p>
                          )}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Değerlendirme bekleniyor
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Status */}
            {application.payment && (
              <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ödeme</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Tutar: <span className="font-medium text-gray-900">{application.payment.tutar} TRY</span>
                  </p>
                  <StatusBadge status={application.payment.durum} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <p className="text-gray-900 font-medium">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    BEKLEMEDE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    HAKEMDE: 'bg-blue-100 text-blue-800 border-blue-200',
    KABUL: 'bg-green-100 text-green-800 border-green-200',
    RED: 'bg-red-100 text-red-800 border-red-200',
    REVIZYON: 'bg-orange-100 text-orange-800 border-orange-200',
    ODENDI: 'bg-green-100 text-green-800 border-green-200',
    BEKLIYOR: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  const icons = {
    BEKLEMEDE: Clock,
    HAKEMDE: UserCheck,
    KABUL: CheckCircle,
    RED: XCircle,
    REVIZYON: AlertCircle,
    ODENDI: CheckCircle,
    BEKLIYOR: Clock,
  };

  const Icon = icons[status as keyof typeof icons] || Clock;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
        styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium text-sm">{status}</span>
    </div>
  );
}
