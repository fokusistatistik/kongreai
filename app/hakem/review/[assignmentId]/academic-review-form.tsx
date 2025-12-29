'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Send, AlertCircle, Check, Info } from 'lucide-react';
import type { ReviewerAssignmentDetail } from '@/app/lib/n8n-webhook';

interface ReviewFormProps {
  assignment: ReviewerAssignmentDetail;
  existingReview: any;
  reviewer: {
    id: string;
    name: string;
    email: string;
  };
}

// Academic evaluation criteria for medical/disaster science
const EVALUATION_CRITERIA = [
  {
    id: 'originality',
    label: 'Bilimsel Özgünlük ve Katkı',
    description: 'Araştırmanın özgünlüğü, bilime katkısı ve yenilikçiliği',
    maxScore: 20,
  },
  {
    id: 'methodology',
    label: 'Yöntem ve Araştırma Tasarımı',
    description: 'Araştırma yöntemi, örneklem seçimi, veri toplama teknikleri',
    maxScore: 20,
  },
  {
    id: 'results',
    label: 'Bulgular ve Veri Kalitesi',
    description: 'Sonuçların sunumu, veri analizinin kalitesi ve geçerliliği',
    maxScore: 20,
  },
  {
    id: 'discussion',
    label: 'Tartışma ve Yorum',
    description: 'Bulguların yorumlanması, literatürle karşılaştırma, sınırlılıklar',
    maxScore: 15,
  },
  {
    id: 'literature',
    label: 'Literatür Taraması',
    description: 'Güncel literatürün kullanımı, kaynak zenginliği ve uygunluğu',
    maxScore: 10,
  },
  {
    id: 'writing',
    label: 'Yazım Kalitesi ve Netlik',
    description: 'Dilin anlaşılırlığı, gramer, akademik yazım standartları',
    maxScore: 10,
  },
  {
    id: 'relevance',
    label: 'Pratik Uygulanabilirlik',
    description: 'Çalışmanın pratiğe katkısı, uygulanabilirliği',
    maxScore: 5,
  },
];

export default function AcademicReviewForm({ assignment, existingReview, reviewer }: ReviewFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Initialize form data from existing review
  const initializeFormData = () => {
    const criteria: any = {};
    EVALUATION_CRITERIA.forEach(c => {
      criteria[c.id] = existingReview?.criteria?.[c.id]?.toString() || '';
    });

    return {
      // Individual criteria scores
      ...criteria,

      // Overall assessment
      karar: existingReview?.karar || '',
      strengths: existingReview?.strengths || '',
      weaknesses: existingReview?.weaknesses || '',
      improvements: existingReview?.improvements || '',
      yorum: existingReview?.yorum || '',
      gizli_yorum: existingReview?.gizli_yorum || '',
      ethics_concern: existingReview?.ethics_concern || false,
      plagiarism_concern: existingReview?.plagiarism_concern || false,
      confidenceLevel: existingReview?.confidenceLevel || '',
    };
  };

  const [formData, setFormData] = useState(initializeFormData());
  const isCompleted = existingReview?.tamamlandi || false;

  // Calculate total score
  const calculateTotalScore = () => {
    let total = 0;
    EVALUATION_CRITERIA.forEach(criterion => {
      const score = parseInt(formData[criterion.id]) || 0;
      total += score;
    });
    return total;
  };

  // Check if form is complete
  const isFormComplete = () => {
    // All criteria must have scores
    for (const criterion of EVALUATION_CRITERIA) {
      if (!formData[criterion.id] || parseInt(formData[criterion.id]) < 0) {
        return false;
      }
    }

    // Decision must be selected
    if (!formData.karar) return false;

    // Strengths, weaknesses, and improvements must be filled
    if (!formData.strengths?.trim()) return false;
    if (!formData.weaknesses?.trim()) return false;
    if (!formData.improvements?.trim()) return false;

    // Confidence level must be selected
    if (!formData.confidenceLevel) return false;

    return true;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Auto-save draft every 2 minutes
  useEffect(() => {
    if (isCompleted) return;

    const interval = setInterval(() => {
      handleSubmit(new Event('auto-save') as any, true, true);
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [formData, isCompleted]);

  const handleSubmit = async (e: React.FormEvent, isDraft = false, isAutoSave = false) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isDraft && !isFormComplete()) {
      setError('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    setLoading(true);

    try {
      // Prepare criteria scores
      const criteriaScores: any = {};
      EVALUATION_CRITERIA.forEach(c => {
        const score = parseInt(formData[c.id]) || 0;
        criteriaScores[c.id] = score;
      });

      const response = await fetch('/api/hakem/review/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId: assignment.assignmentId,
          applicationId: assignment.applicationId,
          eventId: assignment.eventId,
          eventName: assignment.eventName,
          applicationBaslik: assignment.applicationBaslik,
          applicantName: assignment.applicantName,
          applicantEmail: assignment.applicantEmail,
          reviewData: {
            // Criteria scores
            criteria: criteriaScores,

            // Overall score
            puan: calculateTotalScore(),

            // Decision and comments
            karar: formData.karar || undefined,
            strengths: formData.strengths || undefined,
            weaknesses: formData.weaknesses || undefined,
            improvements: formData.improvements || undefined,
            yorum: formData.yorum || undefined,
            gizli_yorum: formData.gizli_yorum || undefined,

            // Concerns
            ethics_concern: formData.ethics_concern,
            plagiarism_concern: formData.plagiarism_concern,

            // Confidence level
            confidenceLevel: formData.confidenceLevel || undefined,
          },
          tamamlandi: !isDraft,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Değerlendirme gönderilirken bir hata oluştu');
      }

      setLastSaved(new Date());

      if (!isAutoSave) {
        setSuccess(
          isDraft
            ? 'Değerlendirme taslak olarak kaydedildi'
            : 'Değerlendirme başarıyla gönderildi'
        );

        // Redirect after final submission
        if (!isDraft) {
          setTimeout(() => {
            router.push('/hakem/panel');
            router.refresh();
          }, 2000);
        }
      }
    } catch (err: any) {
      if (!isAutoSave) {
        setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const totalScore = calculateTotalScore();
  const maxTotalScore = EVALUATION_CRITERIA.reduce((sum, c) => sum + c.maxScore, 0);
  const formComplete = isFormComplete();

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="border-b p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isCompleted ? 'Değerlendirme Detayı' : 'Akademik Değerlendirme Formu'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Tıp ve Afet Bilimi Akademik Standartları
            </p>
          </div>
          {isCompleted && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <Check className="w-4 h-4" />
              Tamamlandı
            </span>
          )}
        </div>

        {/* Score Summary */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">Toplam Puan</span>
            <span className="text-2xl font-bold text-blue-600">
              {totalScore} / {maxTotalScore}
            </span>
          </div>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(totalScore / maxTotalScore) * 100}%` }}
            />
          </div>
        </div>

        {lastSaved && !isCompleted && (
          <p className="text-xs text-gray-500 mt-2">
            Son kaydedilme: {lastSaved.toLocaleTimeString('tr-TR')}
          </p>
        )}
      </div>

      <form className="p-6 space-y-8">
        {/* Error/Success Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Evaluation Criteria */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Değerlendirme Kriterleri
          </h3>

          {EVALUATION_CRITERIA.map((criterion) => (
            <div key={criterion.id} className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label htmlFor={criterion.id} className="block text-sm font-medium text-gray-900">
                    {criterion.label} <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">{criterion.description}</p>
                </div>
                <div className="text-right ml-4">
                  <input
                    type="number"
                    id={criterion.id}
                    name={criterion.id}
                    min="0"
                    max={criterion.maxScore}
                    value={formData[criterion.id]}
                    onChange={handleChange}
                    disabled={isCompleted || loading}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">/ {criterion.maxScore}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Qualitative Assessment */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Niteliksel Değerlendirme
          </h3>

          <div>
            <label htmlFor="strengths" className="block text-sm font-medium text-gray-700 mb-2">
              Güçlü Yönler <span className="text-red-500">*</span>
            </label>
            <textarea
              id="strengths"
              name="strengths"
              rows={4}
              value={formData.strengths}
              onChange={handleChange}
              disabled={isCompleted || loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Çalışmanın güçlü yanlarını detaylı olarak açıklayın..."
            />
          </div>

          <div>
            <label htmlFor="weaknesses" className="block text-sm font-medium text-gray-700 mb-2">
              Zayıf Yönler ve Eksiklikler <span className="text-red-500">*</span>
            </label>
            <textarea
              id="weaknesses"
              name="weaknesses"
              rows={4}
              value={formData.weaknesses}
              onChange={handleChange}
              disabled={isCompleted || loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Çalışmanın zayıf yönlerini ve eksikliklerini belirtin..."
            />
          </div>

          <div>
            <label htmlFor="improvements" className="block text-sm font-medium text-gray-700 mb-2">
              Önerilen İyileştirmeler <span className="text-red-500">*</span>
            </label>
            <textarea
              id="improvements"
              name="improvements"
              rows={4}
              value={formData.improvements}
              onChange={handleChange}
              disabled={isCompleted || loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Çalışmayı geliştirmek için önerileriniz..."
            />
          </div>
        </div>

        {/* Concerns */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Etik ve İntihal Değerlendirmesi
          </h3>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="ethics_concern"
                checked={formData.ethics_concern}
                onChange={handleChange}
                disabled={isCompleted || loading}
                className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">Etik Sorun Var</span>
                <p className="text-xs text-gray-500">Araştırmada etik kurul onayı veya etik sorunlar tespit ettim</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="plagiarism_concern"
                checked={formData.plagiarism_concern}
                onChange={handleChange}
                disabled={isCompleted || loading}
                className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">İntihal Şüphesi Var</span>
                <p className="text-xs text-gray-500">Metinde intihal veya benzerlik sorunları tespit ettim</p>
              </div>
            </label>
          </div>
        </div>

        {/* Confidence Level */}
        <div>
          <label htmlFor="confidenceLevel" className="block text-sm font-medium text-gray-700 mb-2">
            Değerlendirme Güven Düzeyi <span className="text-red-500">*</span>
          </label>
          <select
            id="confidenceLevel"
            name="confidenceLevel"
            value={formData.confidenceLevel}
            onChange={handleChange}
            disabled={isCompleted || loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Seçiniz...</option>
            <option value="EXPERT">Uzman - Bu konuda geniş deneyimim var</option>
            <option value="KNOWLEDGEABLE">Bilgili - Konuya hakimim</option>
            <option value="FAMILIAR">Aşina - Genel bilgim var</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Bu alanda ne kadar uzman olduğunuzu belirtin
          </p>
        </div>

        {/* Final Decision */}
        <div>
          <label htmlFor="karar" className="block text-sm font-medium text-gray-700 mb-2">
            Nihai Karar <span className="text-red-500">*</span>
          </label>
          <select
            id="karar"
            name="karar"
            value={formData.karar}
            onChange={handleChange}
            disabled={isCompleted || loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Karar seçin...</option>
            <option value="KABUL">Kabul - Yayınlanabilir</option>
            <option value="MINOR_REVISION">Küçük Revizyonla Kabul</option>
            <option value="MAJOR_REVISION">Büyük Revizyonla Kabul</option>
            <option value="RED">Reddet - Yayınlanamaz</option>
          </select>
        </div>

        {/* Public Comment */}
        <div>
          <label htmlFor="yorum" className="block text-sm font-medium text-gray-700 mb-2">
            Yazara İletilecek Yorum
          </label>
          <textarea
            id="yorum"
            name="yorum"
            rows={5}
            value={formData.yorum}
            onChange={handleChange}
            disabled={isCompleted || loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Yazara iletilecek genel yorumlarınız..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Bu yorum başvuran kişi tarafından görülebilir
          </p>
        </div>

        {/* Private Comment */}
        <div>
          <label htmlFor="gizli_yorum" className="block text-sm font-medium text-gray-700 mb-2">
            Editöre Özel Notlar
          </label>
          <textarea
            id="gizli_yorum"
            name="gizli_yorum"
            rows={4}
            value={formData.gizli_yorum}
            onChange={handleChange}
            disabled={isCompleted || loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Sadece editörlerin görebileceği notlarınız..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Bu yorum sadece etkinlik editörleri tarafından görülebilir
          </p>
        </div>

        {/* Action Buttons */}
        {!isCompleted && (
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Kaydediliyor...' : 'Ara Kayıt (Taslak)'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={loading || !formComplete}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Gönderiliyor...' : 'Değerlendirmeyi Tamamla'}
            </button>
          </div>
        )}

        {/* Completion Status */}
        {!isCompleted && !formComplete && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Eksik Alanlar Var</p>
              <p>Tüm değerlendirme kriterlerini, güçlü/zayıf yönleri, önerileri ve nihai kararı doldurun.</p>
            </div>
          </div>
        )}

        {!isCompleted && formComplete && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800 font-medium">
              Form eksiksiz dolduruldu. Değerlendirmeyi tamamlayabilirsiniz.
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800">
            <strong>Otomatik Kayıt:</strong> Formunuz her 2 dakikada bir otomatik olarak taslak olarak kaydedilir.
            "Ara Kayıt" butonuyla istediğiniz zaman manuel olarak da kaydedebilirsiniz.
            "Değerlendirmeyi Tamamla" butonuna bastığınızda değerlendirme kesinleşir ve geri alınamaz.
          </p>
        </div>
      </form>
    </div>
  );
}
