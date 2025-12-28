'use client';

import { useState, useEffect } from 'react';
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
  Upload,
  X,
  File,
} from 'lucide-react';

interface EventEditPageProps {
  params: {
    eventId: string;
  };
}

interface DocumentFile {
  id: string;
  file?: File;
  fileName: string;
  fileSize?: number;
  aciklama: string;
  existingUrl?: string; // For documents already uploaded
}

export default function EventEditPage({ params }: EventEditPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  const [formData, setFormData] = useState({
    // Basic Info
    baslik: '',
    slug: '',
    tip: 'KONGRE' as 'KONGRE' | 'SEMPOZYUM' | 'KONFERANS' | 'CALISHTAY' | 'DIGER',
    kapsam: 'ULUSAL' as 'ULUSAL' | 'ULUSLARARASI',
    aciklama: '',

    // New Date Structure (date-only, stored as 23:59:59)
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
    durum: 'TASLAK' as 'TASLAK' | 'YAYINDA' | 'IPTAL',
    max_katilimci: 500,

    // Fees
    ucret: 0,
    erken_kayit_ucret: 0,
    ogrenci_ucret: 0,
  });

  // Fetch event data on mount
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/admin/events/${params.eventId}`);
        const data = await response.json();

        if (response.ok && data.event) {
          const event = data.event;

          // Format dates for date inputs (YYYY-MM-DD)
          const formatDateForInput = (dateString: string | null) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };

          setFormData({
            baslik: event.baslik || '',
            slug: event.slug || '',
            tip: event.tip || 'KONGRE',
            kapsam: event.kapsam || 'ULUSAL',
            aciklama: event.aciklama || '',
            erken_basvuru_son_tarihi: formatDateForInput(event.erken_basvuru_son_tarihi),
            son_basvuru_tarihi: formatDateForInput(event.son_basvuru_tarihi),
            sonuc_aciklama_tarihi: formatDateForInput(event.sonuc_aciklama_tarihi),
            kongre_baslangic_tarihi: formatDateForInput(event.kongre_baslangic_tarihi || event.baslangic_tarihi),
            kongre_bitis_tarihi: formatDateForInput(event.kongre_bitis_tarihi || event.bitis_tarihi),
            yer: event.yer || '',
            adres: event.adres || '',
            online: event.online || false,
            durum: event.durum || 'TASLAK',
            max_katilimci: event.max_katilimci || 500,
            ucret: event.ucret || 0,
            erken_kayit_ucret: event.erken_kayit_ucret || 0,
            ogrenci_ucret: event.ogrenci_ucret || 0,
          });
        } else {
          setError(data.error || 'Etkinlik yüklenemedi');
        }
      } catch (err: any) {
        setError(err.message || 'Bir hata oluştu');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchEvent();
  }, [params.eventId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  // Convert date (YYYY-MM-DD) to end of day ISO string
  const convertDateToEndOfDay = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setHours(23, 59, 59, 999);
    return date.toISOString();
  };

  // File validation
  const validateFile = (file: File): string | null => {
    const maxSize = 9 * 1024 * 1024; // 9MB
    if (file.size > maxSize) {
      return 'Dosya boyutu 9MB\'ı geçemez';
    }

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

  // Handle file selection
  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      e.target.value = '';
      return;
    }

    const newDoc: DocumentFile = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      fileName: file.name,
      fileSize: file.size,
      aciklama: '',
    };

    setDocuments(prev => [...prev, newDoc]);
    e.target.value = '';
    setError(null);
  };

  // Remove document
  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  // Update document description
  const handleDocumentDescriptionChange = (id: string, aciklama: string) => {
    setDocuments(prev =>
      prev.map(doc => (doc.id === id ? { ...doc, aciklama } : doc))
    );
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
      // Prepare data with date conversion
      const submitData = {
        ...formData,
        erken_basvuru_son_tarihi: formData.erken_basvuru_son_tarihi
          ? convertDateToEndOfDay(formData.erken_basvuru_son_tarihi)
          : undefined,
        son_basvuru_tarihi: convertDateToEndOfDay(formData.son_basvuru_tarihi),
        sonuc_aciklama_tarihi: formData.sonuc_aciklama_tarihi
          ? convertDateToEndOfDay(formData.sonuc_aciklama_tarihi)
          : undefined,
        kongre_baslangic_tarihi: convertDateToEndOfDay(formData.kongre_baslangic_tarihi),
        kongre_bitis_tarihi: convertDateToEndOfDay(formData.kongre_bitis_tarihi),
      };

      const response = await fetch(`/api/admin/events/${params.eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        // If documents were added, upload them
        // TODO: Implement document upload via webhook
        // For now, just redirect to manage page
        router.push(`/admin/events/${params.eventId}/manage`);
      } else {
        setError(data.error || 'Etkinlik güncellenirken bir hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Etkinlik yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Link
            href={`/admin/events/${params.eventId}/manage`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Etkinlik Yönetimine Dön
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-blue-600 rounded-lg">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Etkinliği Düzenle</h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base">Etkinlik bilgilerini güncelleyin</p>
              </div>
            </div>
            <Link
              href={`/admin/events/${params.eventId}/reviewers`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm md:text-base w-full md:w-auto"
            >
              <Users className="w-4 h-4" />
              Hakem Yönetimi
            </Link>
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
                  {step === 1 ? 'Temel Bilgiler' : step === 2 ? 'Tarihler' : step === 3 ? 'Ücretler' : 'Dökümanlar'}
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                  URL Slug
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <span className="text-xs md:text-sm text-gray-500">https://site.com/events/</span>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    readOnly
                    disabled
                    className="w-full sm:flex-1 px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm md:text-base"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  URL slug değiştirilemez
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
                  rows={3}
                  className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  placeholder="Etkinlik hakkında kısa bir açıklama (max 1000 karakter)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.aciklama.length}/1000 karakter
                </p>
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
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Kongre Dökümanları</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Döküman Yükle
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      id="document-upload"
                      onChange={handleFileAdd}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <label
                      htmlFor="document-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Dosya seçmek için tıklayın
                      </span>
                      <span className="text-xs text-gray-500">
                        PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG (Max 9MB)
                      </span>
                    </label>
                  </div>
                </div>

                {documents.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700">Yüklenen Dökümanlar</h3>
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="border border-gray-200 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <File className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {doc.fileName}
                              </p>
                              {doc.fileSize && (
                                <p className="text-xs text-gray-500">
                                  {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(doc.id)}
                            className="text-red-600 hover:text-red-700 flex-shrink-0"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Döküman Açıklaması
                          </label>
                          <input
                            type="text"
                            value={doc.aciklama}
                            onChange={(e) =>
                              handleDocumentDescriptionChange(doc.id, e.target.value)
                            }
                            placeholder="Örn: Kongre Kuralları, Bildiri Formatı, vb."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
                        Güncelleniyor...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Değişiklikleri Kaydet
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
