'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  ArrowLeft,
  Save,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Globe,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    // Basic Info
    baslik: '',
    slug: '',
    tip: 'KONGRE',
    aciklama: '',

    // Location & Dates
    baslangic_tarihi: '',
    bitis_tarihi: '',
    son_basvuru_tarihi: '',
    yer: '',
    adres: '',
    online: false,

    // Settings
    durum: 'TASLAK' as 'TASLAK' | 'YAYINDA' | 'TAMAMLANDI' | 'IPTAL',
    max_katilimci: 500,

    // Fees
    ucret: 0,
    erken_kayit_ucret: 0,
    ogrenci_ucret: 0,
    erken_kayit_tarihi: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const generateSlug = () => {
    const slug = formData.baslik
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/admin/events/${data.event.id}/manage`);
      } else {
        setError(data.error || 'Etkinlik oluşturulurken bir hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin Paneline Dön
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-blue-600 rounded-lg">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Yeni Etkinlik Oluştur</h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">Kongre veya etkinlik bilgilerini girin</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center gap-2 w-full sm:w-auto ${step < 3 ? 'sm:flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-sm md:text-base ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
                <span className={`text-xs md:text-sm font-medium ${currentStep >= step ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step === 1 ? 'Temel Bilgiler' : step === 2 ? 'Konum & Tarih' : 'Ücretler'}
                </span>
                {step < 3 && (
                  <div
                    className={`hidden sm:block flex-1 h-1 mx-2 md:mx-4 rounded ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs md:text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-4 md:space-y-6">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Temel Bilgiler</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                  Etkinlik Başlığı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="baslik"
                  value={formData.baslik}
                  onChange={handleInputChange}
                  onBlur={generateSlug}
                  required
                  className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  placeholder="Örn: 1. Uluslararası Tıp Kongresi 2026"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <span className="text-xs md:text-sm text-gray-500">https://site.com/events/</span>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="w-full sm:flex-1 px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                    placeholder="1-uluslararasi-tip-kongresi-2026"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Otomatik oluşturulur, gerekirse düzenleyebilirsiniz
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                  Kısa Açıklama <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="aciklama"
                  value={formData.aciklama}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  placeholder="Etkinlik hakkında kısa bir açıklama (1-2 cümle)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                  Durum <span className="text-red-500">*</span>
                </label>
                <select
                  name="durum"
                  value={formData.durum}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                >
                  <option value="TASLAK">Taslak (Yayınlanmamış)</option>
                  <option value="YAYINDA">Yayında (Görünür)</option>
                  <option value="TAMAMLANDI">Tamamlandı</option>
                  <option value="IPTAL">İptal Edildi</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                >
                  Devam →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Location & Dates */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-4 md:space-y-6">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <MapPin className="w-5 h-5 text-green-600" />
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Konum ve Tarihler</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Başlangıç Tarihi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="baslangic_tarihi"
                    value={formData.baslangic_tarihi}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Bitiş Tarihi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="bitis_tarihi"
                    value={formData.bitis_tarihi}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                  Yer/Mekan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="yer"
                  value={formData.yer}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  placeholder="Örn: İstanbul Kongre Merkezi, İstanbul"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                  Detaylı Adres
                </label>
                <input
                  type="text"
                  name="adres"
                  value={formData.adres}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  placeholder="Tam adres (isteğe bağlı)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                  Son Başvuru Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="son_basvuru_tarihi"
                  value={formData.son_basvuru_tarihi}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                  Maksimum Katılımcı Sayısı
                </label>
                <input
                  type="number"
                  name="max_katilimci"
                  value={formData.max_katilimci}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  placeholder="Sınırsız için boş bırakın"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 md:gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                >
                  ← Geri
                </button>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                  >
                    Devam →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Fees */}
          {currentStep === 3 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-4 md:space-y-6">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Kayıt Ücretleri</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Erken Kayıt Ücreti (₺)
                  </label>
                  <input
                    type="number"
                    name="erken_kayit_ucret"
                    value={formData.erken_kayit_ucret}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Standart Kayıt Ücreti (₺)
                  </label>
                  <input
                    type="number"
                    name="ucret"
                    value={formData.ucret}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Öğrenci Kayıt Ücreti (₺)
                  </label>
                  <input
                    type="number"
                    name="ogrenci_ucret"
                    value={formData.ogrenci_ucret}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                  Erken Kayıt Bitiş Tarihi
                </label>
                <input
                  type="datetime-local"
                  name="erken_kayit_tarihi"
                  value={formData.erken_kayit_tarihi}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 md:gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                >
                  ← Geri
                </button>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Etkinliği Oluştur
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
