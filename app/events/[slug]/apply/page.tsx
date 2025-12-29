'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  Save,
  FileText,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import Link from 'next/link';
import {
  submitApplicationViaWebhook,
  getEventViaWebhook,
} from '@/app/lib/n8n-webhook';
import { v4 as uuidv4 } from 'uuid';
import FileUpload, { type UploadedFile } from '@/components/file-upload';

export default function EventApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const eventSlug = params?.slug as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    tip: 'SOZLU_BILDIRI' as 'SOZLU_BILDIRI' | 'POSTER' | 'DINLEYICI',
    baslik: '',
    ozet: '',
    anahtar_kelimeler: '',
    kategori: '',
    yazarlar: [
      {
        ad: '',
        soyad: '',
        email: '',
        kurum: '',
        sira: 1,
      },
    ],
  });

  // File upload states
  const [abstractFile, setAbstractFile] = useState<File | null>(null);
  const [fullPaperFile, setFullPaperFile] = useState<File | null>(null);
  const [supplementaryFiles, setSupplementaryFiles] = useState<File[]>([]);
  const [createdApplicationId, setCreatedApplicationId] = useState<string | null>(null);

  // Check auth
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(`/login?redirect=/events/${eventSlug}/apply`);
    }
  }, [session, status, eventSlug, router]);

  // Fetch event
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
            eventSlug: eventSlug,
          },
        });

        if (response.success && response.data) {
          setEvent(response.data);

          // Check if application deadline passed
          const deadline = new Date(response.data.son_basvuru_tarihi);
          if (deadline < new Date()) {
            setError('Bu etkinliğin başvuru süresi dolmuştur');
          }
        } else {
          setError('Etkinlik bulunamadı');
        }
      } catch (err) {
        console.error('Event fetch error:', err);
        setError('Etkinlik yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (session && eventSlug) {
      fetchEvent();
    }
  }, [session, eventSlug]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthorChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newAuthors = [...prev.yazarlar];
      newAuthors[index] = { ...newAuthors[index], [field]: value };
      return { ...prev, yazarlar: newAuthors };
    });
  };

  const addAuthor = () => {
    setFormData((prev) => ({
      ...prev,
      yazarlar: [
        ...prev.yazarlar,
        { ad: '', soyad: '', email: '', kurum: '', sira: prev.yazarlar.length + 1 },
      ],
    }));
  };

  const removeAuthor = (index: number) => {
    if (formData.yazarlar.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      yazarlar: prev.yazarlar.filter((_, i) => i !== index).map((author, i) => ({
        ...author,
        sira: i + 1,
      })),
    }));
  };

  const uploadFile = async (file: File, applicationId: string, fileType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('applicationId', applicationId);
    formData.append('fileType', fileType);

    const response = await fetch('/api/applications/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'File upload failed');
    }

    return await response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !event) return;

    setSubmitting(true);
    setError(null);

    // Validations
    if (formData.tip !== 'DINLEYICI') {
      if (!formData.baslik.trim()) {
        setError('Bildiri başlığı gereklidir');
        setSubmitting(false);
        return;
      }
      if (!formData.ozet.trim()) {
        setError('Bildiri özeti gereklidir');
        setSubmitting(false);
        return;
      }
      if (formData.ozet.split(' ').length > 300) {
        setError('Özet maksimum 300 kelime olabilir');
        setSubmitting(false);
        return;
      }
    }

    // Check authors
    for (let i = 0; i < formData.yazarlar.length; i++) {
      const author = formData.yazarlar[i];
      if (!author.ad.trim() || !author.soyad.trim() || !author.email.trim()) {
        setError(`${i + 1}. yazar için ad, soyad ve e-posta gereklidir`);
        setSubmitting(false);
        return;
      }
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(author.email)) {
        setError(`${i + 1}. yazar e-posta adresi geçersiz`);
        setSubmitting(false);
        return;
      }
    }

    try {
      // 1. Create application via API
      const submitResponse = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          tip: formData.tip,
          baslik: formData.tip !== 'DINLEYICI' ? formData.baslik : undefined,
          ozet: formData.tip !== 'DINLEYICI' ? formData.ozet : undefined,
          anahtarKelimeler: formData.tip !== 'DINLEYICI' ? formData.anahtar_kelimeler : undefined,
          kategori: formData.tip !== 'DINLEYICI' ? formData.kategori : undefined,
          yazarlar: formData.yazarlar,
        }),
      });

      const submitResult = await submitResponse.json();

      if (!submitResponse.ok) {
        throw new Error(submitResult.error || 'Başvuru oluşturulamadı');
      }

      const applicationId = submitResult.application.id;
      setCreatedApplicationId(applicationId);

      // 2. Upload files if any
      const uploadedFiles = [];

      if (abstractFile && formData.tip !== 'DINLEYICI') {
        try {
          const result = await uploadFile(abstractFile, applicationId, 'abstract');
          uploadedFiles.push(result.file);
        } catch (uploadError: any) {
          console.error('Abstract upload failed:', uploadError);
          // Continue even if file upload fails
        }
      }

      if (fullPaperFile && formData.tip !== 'DINLEYICI') {
        try {
          const result = await uploadFile(fullPaperFile, applicationId, 'full_paper');
          uploadedFiles.push(result.file);
        } catch (uploadError: any) {
          console.error('Full paper upload failed:', uploadError);
        }
      }

      for (const suppFile of supplementaryFiles) {
        try {
          const result = await uploadFile(suppFile, applicationId, 'supplementary');
          uploadedFiles.push(result.file);
        } catch (uploadError: any) {
          console.error('Supplementary file upload failed:', uploadError);
        }
      }

      // 3. Send webhook notification with complete data
      try {
        await submitApplicationViaWebhook({
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
          application: {
            applicationId,
            tip: formData.tip,
            baslik: formData.tip !== 'DINLEYICI' ? formData.baslik : undefined,
            ozet: formData.tip !== 'DINLEYICI' ? formData.ozet : undefined,
            anahtarKelimeler: formData.tip !== 'DINLEYICI' ? formData.anahtar_kelimeler : undefined,
            kategori: formData.tip !== 'DINLEYICI' ? formData.kategori : undefined,
            status: 'GONDERILDI',
          },
          applicant: {
            userId: session.user.id,
            userName: session.user.name,
            userEmail: session.user.email,
          },
          operationType: 'create',
        });
      } catch (webhookError) {
        console.error('Webhook notification failed (continuing):', webhookError);
        // Don't fail submission if webhook fails
      }

      // 4. Success
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/applications');
      }, 2000);
    } catch (err: any) {
      console.error('Application submit error:', err);
      setError(err.message || 'Başvuru gönderilirken hata oluştu');
    } finally {
      setSubmitting(false);
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

  if (!event || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Hata</p>
          <p className="text-gray-600 mb-6">{error || 'Bir hata oluştu'}</p>
          <Link
            href={`/events/${eventSlug}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Etkinliğe Dön
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Başvuru Gönderildi!</p>
          <p className="text-gray-600 mb-6">
            Başvurunuz başarıyla kaydedildi. Dashboard sayfasına yönlendiriliyorsunuz...
          </p>
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
            href={`/events/${eventSlug}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Etkinliğe Dön
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Başvuru Yap</h1>
              <p className="text-gray-600 mt-1">{event.baslik}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          {/* Application Type */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Başvuru Tipi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['SOZLU_BILDIRI', 'POSTER', 'DINLEYICI'].map((tip) => (
                <label
                  key={tip}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.tip === tip
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="tip"
                    value={tip}
                    checked={formData.tip === tip}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="font-medium text-gray-900">
                    {tip === 'SOZLU_BILDIRI'
                      ? 'Sözlü Bildiri'
                      : tip === 'POSTER'
                      ? 'Poster'
                      : 'Dinleyici'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Paper Details (if not DINLEYICI) */}
          {formData.tip !== 'DINLEYICI' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Bildiri Bilgileri</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="baslik" className="block text-sm font-medium text-gray-700 mb-2">
                    Bildiri Başlığı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="baslik"
                    name="baslik"
                    value={formData.baslik}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Bildiri başlığını girin"
                  />
                </div>

                <div>
                  <label htmlFor="ozet" className="block text-sm font-medium text-gray-700 mb-2">
                    Özet (Max 300 kelime) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="ozet"
                    name="ozet"
                    value={formData.ozet}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Bildiri özetini girin (max 300 kelime)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.ozet.split(' ').filter((w) => w).length} / 300 kelime
                  </p>
                </div>

                <div>
                  <label htmlFor="anahtar_kelimeler" className="block text-sm font-medium text-gray-700 mb-2">
                    Anahtar Kelimeler
                  </label>
                  <input
                    type="text"
                    id="anahtar_kelimeler"
                    name="anahtar_kelimeler"
                    value={formData.anahtar_kelimeler}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Virgülle ayrılmış (örn: eğitim, teknoloji, inovasyon)"
                  />
                </div>

                <div>
                  <label htmlFor="kategori" className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <input
                    type="text"
                    id="kategori"
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Bildiri kategorisi"
                  />
                </div>
              </div>
            </div>
          )}

          {/* File Uploads (if not DINLEYICI) */}
          {formData.tip !== 'DINLEYICI' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Dosya Yüklemeleri
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Bildiri özetiniz ve tam metninizi yükleyebilirsiniz (PDF, DOC, DOCX formatında, max 10MB)
              </p>

              <div className="space-y-4">
                {/* Abstract File */}
                <div>
                  <label htmlFor="abstract-file" className="block text-sm font-medium text-gray-700 mb-2">
                    Özet Dosyası (Abstract)
                  </label>
                  <input
                    type="file"
                    id="abstract-file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setAbstractFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {abstractFile && (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {abstractFile.name} ({(abstractFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {/* Full Paper File */}
                <div>
                  <label htmlFor="full-paper-file" className="block text-sm font-medium text-gray-700 mb-2">
                    Tam Metin Dosyası (Full Paper)
                  </label>
                  <input
                    type="file"
                    id="full-paper-file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFullPaperFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {fullPaperFile && (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {fullPaperFile.name} ({(fullPaperFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {/* Supplementary Files */}
                <div>
                  <label htmlFor="supplementary-files" className="block text-sm font-medium text-gray-700 mb-2">
                    Ek Dosyalar (Supplementary Materials)
                  </label>
                  <input
                    type="file"
                    id="supplementary-files"
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                    onChange={(e) => setSupplementaryFiles(Array.from(e.target.files || []))}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {supplementaryFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {supplementaryFiles.map((file, index) => (
                        <p key={index} className="text-sm text-green-600 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Not:</strong> Dosyalar başvurunuzu gönderdikten sonra yüklenecektir.
                  Desteklenen formatlar: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG (Max 10MB)
                </p>
              </div>
            </div>
          )}

          {/* Authors */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Yazarlar</h2>
              <button
                type="button"
                onClick={addAuthor}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                <Users className="w-4 h-4" />
                Yazar Ekle
              </button>
            </div>

            <div className="space-y-4">
              {formData.yazarlar.map((author, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg relative"
                >
                  {formData.yazarlar.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAuthor(index)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    {index + 1}. Yazar
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`author-${index}-ad`} className="block text-xs text-gray-600 mb-1">
                        Ad <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id={`author-${index}-ad`}
                        value={author.ad}
                        onChange={(e) => handleAuthorChange(index, 'ad', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor={`author-${index}-soyad`} className="block text-xs text-gray-600 mb-1">
                        Soyad <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id={`author-${index}-soyad`}
                        value={author.soyad}
                        onChange={(e) => handleAuthorChange(index, 'soyad', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor={`author-${index}-email`} className="block text-xs text-gray-600 mb-1">
                        E-posta <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id={`author-${index}-email`}
                        value={author.email}
                        onChange={(e) => handleAuthorChange(index, 'email', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor={`author-${index}-kurum`} className="block text-xs text-gray-600 mb-1">Kurum</label>
                      <input
                        type="text"
                        id={`author-${index}-kurum`}
                        value={author.kurum}
                        onChange={(e) => handleAuthorChange(index, 'kurum', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <Link
              href={`/events/${eventSlug}`}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Başvuruyu Gönder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
