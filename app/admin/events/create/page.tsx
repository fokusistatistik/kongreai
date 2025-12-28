'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  ArrowLeft,
  Save,
  MapPin,
  DollarSign,
  FileText,
  AlertCircle,
  Loader2,
  Upload,
  X,
} from 'lucide-react';

interface DocumentUpload {
  id: string;
  file: File;
  aciklama: string;
  uploading: boolean;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);

  const [formData, setFormData] = useState({
    // Basic Info
    baslik: '',
    tip: 'KONGRE' as 'KONGRE' | 'SEMPOZYUM' | 'KONFERANS' | 'CALISHTAY' | 'DIGER',
    kapsam: 'ULUSAL' as 'ULUSAL' | 'ULUSLARARASI',
    aciklama: '',

    // Dates (Date only, no time)
    erken_basvuru_son_tarihi: '',
    son_basvuru_tarihi: '',
    sonuc_aciklama_tarihi: '',
    kongre_baslangic_tarihi: '',
    kongre_bitis_tarihi: '',

    // Location
    yer: '',
    adres: '',
    online: false,

    // Settings
    durum: 'TASLAK' as 'TASLAK' | 'YAYINDA',
    max_katilimci: 500,

    // Fees
    ucret: 0,
    erken_kayit_ucret: 0,
    ogrenci_ucret: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const generateSlug = (title: string): string => {
    return title
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
  };

  const validateFile = (file: File): string | null => {
    // Max 9MB
    const maxSize = 9 * 1024 * 1024; // 9MB in bytes
    if (file.size > maxSize) {
      return 'Dosya boyutu 9MB\'ı geçemez';
    }

    // Allowed types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];

    if (!allowedTypes.includes(file.type)) {
      return 'Sadece PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG dosyaları yüklenebilir';
    }

    return null;
  };

  const handleFileAdd = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const error = validateFile(file);
        if (error) {
          setError(error);
          return;
        }

        const newDoc: DocumentUpload = {
          id: Date.now().toString(),
          file,
          aciklama: '',
          uploading: false,
        };
        setDocuments(prev => [...prev, newDoc]);
      }
    };
    input.click();
  };

  const handleDocumentDescriptionChange = (id: string, aciklama: string) => {
    setDocuments(prev =>
      prev.map(doc => (doc.id === id ? { ...doc, aciklama } : doc))
    );
  };

  const handleDocumentRemove = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const convertDateToEndOfDay = (dateString: string): string => {
    if (!dateString) return '';
    // Convert YYYY-MM-DD to YYYY-MM-DDT23:59:59Z
    const date = new Date(dateString);
    date.setHours(23, 59, 59, 999);
    return date.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Date validations
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const baslangicDate = formData.kongre_baslangic_tarihi ? new Date(formData.kongre_baslangic_tarihi) : null;
    const bitisDate = formData.kongre_bitis_tarihi ? new Date(formData.kongre_bitis_tarihi) : null;
    const sonBasvuruDate = formData.son_basvuru_tarihi ? new Date(formData.son_basvuru_tarihi) : null;
    const erkenBasvuruDate = formData.erken_basvuru_son_tarihi ? new Date(formData.erken_basvuru_son_tarihi) : null;
    const sonucDate = formData.sonuc_aciklama_tarihi ? new Date(formData.sonuc_aciklama_tarihi) : null;

    // Bitiş tarihi başlangıçtan önce olamaz
    if (baslangicDate && bitisDate && bitisDate < baslangicDate) {
      setError('Kongre bitiş tarihi, başlangıç tarihinden önce olamaz');
      return;
    }

    // Geçmiş tarih kontrolleri (başlangıç tarihi hariç)
    if (sonBasvuruDate && sonBasvuruDate < today) {
      setError('Son başvuru tarihi geçmişte olamaz');
      return;
    }

    if (erkenBasvuruDate && erkenBasvuruDate < today) {
      setError('Erken başvuru son tarihi geçmişte olamaz');
      return;
    }

    if (sonucDate && sonucDate < today) {
      setError('Sonuç açıklama tarihi geçmişte olamaz');
      return;
    }

    if (bitisDate && bitisDate < today) {
      setError('Kongre bitiş tarihi geçmişte olamaz');
      return;
    }

    // Mantıksal kontroller
    if (erkenBasvuruDate && sonBasvuruDate && erkenBasvuruDate > sonBasvuruDate) {
      setError('Erken başvuru son tarihi, normal başvuru tarihinden sonra olamaz');
      return;
    }

    if (sonBasvuruDate && baslangicDate && sonBasvuruDate > baslangicDate) {
      setError('Son başvuru tarihi, kongre başlangıç tarihinden sonra olamaz');
      return;
    }

    setLoading(true);

    try {
      // Generate slug from baslik
      const slug = generateSlug(formData.baslik);

      // Convert dates to end of day
      const eventData = {
        baslik: formData.baslik,
        slug,
        tip: formData.tip,
        aciklama: formData.aciklama,
        erken_basvuru_son_tarihi: formData.erken_basvuru_son_tarihi
          ? convertDateToEndOfDay(formData.erken_basvuru_son_tarihi)
          : null,
        son_basvuru_tarihi: convertDateToEndOfDay(formData.son_basvuru_tarihi),
        sonuc_aciklama_tarihi: formData.sonuc_aciklama_tarihi
          ? convertDateToEndOfDay(formData.sonuc_aciklama_tarihi)
          : null,
        baslangic_tarihi: convertDateToEndOfDay(formData.kongre_baslangic_tarihi),
        bitis_tarihi: convertDateToEndOfDay(formData.kongre_bitis_tarihi),
        yer: formData.yer,
        adres: formData.adres,
        online: formData.online,
        ucret: formData.ucret,
        erken_kayit_ucret: formData.erken_kayit_ucret,
        ogrenci_ucret: formData.ogrenci_ucret,
        max_katilimci: formData.max_katilimci,
        durum: formData.durum,
      };

      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (response.ok) {
        // If there are documents, upload them
        if (documents.length > 0) {
          // TODO: Upload documents to the event
          // This will be handled in a separate API call
        }

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
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center gap-2 w-full sm:w-auto ${step < 4 ? 'sm:flex-1' : ''}`}
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
                  {step === 1 ? 'Temel Bilgiler' : step === 2 ? 'Tarihler' : step === 3 ? 'Ücretler' : 'Dokümanlar'}
                </span>
                {step < 4 && (
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
                  required
                  className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  placeholder="Örn: 1. Uluslararası Tıp Kongresi 2026"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL otomatik oluşturulacaktır
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                  Etkinlik Tipi <span className="text-red-500">*</span>
                </label>
                <select
                  name="tip"
                  value={formData.tip}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                >
                  <option value="KONGRE">Kongre</option>
                  <option value="SEMPOZYUM">Sempozyum</option>
                  <option value="KONFERANS">Konferans</option>
                  <option value="CALISHTAY">Çalıştay</option>
                  <option value="DIGER">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                  Kapsam <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="kapsam"
                      value="ULUSAL"
                      checked={formData.kapsam === 'ULUSAL'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Ulusal</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="kapsam"
                      value="ULUSLARARASI"
                      checked={formData.kapsam === 'ULUSLARARASI'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Uluslararası</span>
                  </label>
                </div>
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
                  maxLength={1000}
                  rows={4}
                  className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  placeholder="Etkinlik hakkında kısa bir açıklama (max 1000 karakter)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.aciklama.length}/1000 karakter
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                  Mekan/Yer <span className="text-red-500">*</span>
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="online"
                  name="online"
                  checked={formData.online}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="online" className="text-sm text-gray-700">
                  Online etkinlik
                </label>
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
                  <option value="TASLAK">Taslak</option>
                  <option value="YAYINDA">Yayınla</option>
                </select>
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

          {/* Step 2: Dates */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-4 md:space-y-6">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <Calendar className="w-5 h-5 text-green-600" />
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Önemli Tarihler</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Erken Başvuru Son Tarihi
                  </label>
                  <input
                    type="date"
                    name="erken_basvuru_son_tarihi"
                    value={formData.erken_basvuru_son_tarihi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Gün sonu (23:59) olarak kaydedilir</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Son Başvuru Tarihi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="son_basvuru_tarihi"
                    value={formData.son_basvuru_tarihi}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Gün sonu (23:59) olarak kaydedilir</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Sonuç Açıklama Tarihi
                  </label>
                  <input
                    type="date"
                    name="sonuc_aciklama_tarihi"
                    value={formData.sonuc_aciklama_tarihi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Gün sonu (23:59) olarak kaydedilir</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Kongre Başlangıç Tarihi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="kongre_baslangic_tarihi"
                    value={formData.kongre_baslangic_tarihi}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Gün sonu (23:59) olarak kaydedilir</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Kongre Bitiş Tarihi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="kongre_bitis_tarihi"
                    value={formData.kongre_bitis_tarihi}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Gün sonu (23:59) olarak kaydedilir</p>
                </div>
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
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                  >
                    Devam →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-4 md:space-y-6">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <Upload className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Dokümanlar (İsteğe Bağlı)</h2>
              </div>

              <p className="text-sm text-gray-600">
                Kongre ile ilgili dökümanları yükleyebilirsiniz (Kurallar, Örnek Bildiri Formatı, vb.)
              </p>

              {/* Documents List */}
              {documents.length > 0 && (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <input
                          type="text"
                          placeholder="Doküman açıklaması (örn: Kongre Kuralları)"
                          value={doc.aciklama}
                          onChange={(e) => handleDocumentDescriptionChange(doc.id, e.target.value)}
                          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDocumentRemove(doc.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Document Button */}
              <button
                type="button"
                onClick={handleFileAdd}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
              >
                <Upload className="w-5 h-5" />
                <span className="text-sm font-medium">Doküman Ekle</span>
              </button>

              <p className="text-xs text-gray-500">
                • Maksimum dosya boyutu: 9MB<br />
                • Desteklenen formatlar: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG
              </p>

              <div className="flex flex-col sm:flex-row justify-between gap-3 md:gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
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
