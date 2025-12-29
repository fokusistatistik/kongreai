'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Send, AlertCircle, Check } from 'lucide-react';
import type { ReviewerAssignmentDetail } from '@/app/lib/n8n-webhook';

interface ReviewFormProps {
  assignment: ReviewerAssignmentDetail;
  existingReview: any; // Prisma Review type
  reviewer: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ReviewForm({ assignment, existingReview, reviewer }: ReviewFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    puan: existingReview?.puan?.toString() || '',
    karar: existingReview?.karar || '',
    yorum: existingReview?.yorum || '',
    gizli_yorum: existingReview?.gizli_yorum || '',
  });

  const isCompleted = existingReview?.tamamlandi || false;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isDraft) {
      // Validation for final submission
      if (!formData.karar) {
        setError('Lütfen bir karar seçin (Kabul, Red veya Revizyon)');
        return;
      }
      if (!formData.puan || parseInt(formData.puan) < 1 || parseInt(formData.puan) > 10) {
        setError('Lütfen 1-10 arası bir puan verin');
        return;
      }
    }

    setLoading(true);

    try {
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
            puan: formData.puan ? parseInt(formData.puan) : undefined,
            karar: formData.karar || undefined,
            yorum: formData.yorum || undefined,
            gizli_yorum: formData.gizli_yorum || undefined,
          },
          tamamlandi: !isDraft,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Değerlendirme gönderilirken bir hata oluştu');
      }

      setSuccess(
        isDraft
          ? 'Değerlendirme taslak olarak kaydedildi'
          : 'Değerlendirme başarıyla gönderildi'
      );

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/hakem/panel');
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="border-b p-6">
        <h2 className="text-xl font-bold text-gray-900">
          {isCompleted ? 'Değerlendirme Detayı' : 'Değerlendirme Formu'}
        </h2>
        {isCompleted && (
          <p className="text-sm text-green-600 mt-1 flex items-center gap-2">
            <Check className="w-4 h-4" />
            Bu değerlendirme tamamlanmıştır
          </p>
        )}
      </div>

      <form className="p-6 space-y-6">
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

        {/* Puan (Score) */}
        <div>
          <label htmlFor="puan" className="block text-sm font-medium text-gray-700 mb-2">
            Puan (1-10) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="puan"
            name="puan"
            min="1"
            max="10"
            value={formData.puan}
            onChange={handleChange}
            disabled={isCompleted || loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="1-10 arası bir puan verin"
          />
          <p className="text-xs text-gray-500 mt-1">
            1 = Çok zayıf, 10 = Mükemmel
          </p>
        </div>

        {/* Karar (Decision) */}
        <div>
          <label htmlFor="karar" className="block text-sm font-medium text-gray-700 mb-2">
            Karar <span className="text-red-500">*</span>
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
            <option value="KABUL">Kabul</option>
            <option value="REVIZYON">Revizyon</option>
            <option value="RED">Red</option>
          </select>
        </div>

        {/* Yorum (Public Comment) */}
        <div>
          <label htmlFor="yorum" className="block text-sm font-medium text-gray-700 mb-2">
            Yorum
          </label>
          <textarea
            id="yorum"
            name="yorum"
            rows={6}
            value={formData.yorum}
            onChange={handleChange}
            disabled={isCompleted || loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Başvuran ile paylaşılacak yorumlarınız..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Bu yorum başvuran kişi tarafından görülebilir
          </p>
        </div>

        {/* Gizli Yorum (Private Comment for Admin) */}
        <div>
          <label htmlFor="gizli_yorum" className="block text-sm font-medium text-gray-700 mb-2">
            Gizli Yorum (Sadece Organizatörler İçin)
          </label>
          <textarea
            id="gizli_yorum"
            name="gizli_yorum"
            rows={4}
            value={formData.gizli_yorum}
            onChange={handleChange}
            disabled={isCompleted || loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Sadece organizatörlerin görebileceği notlarınız..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Bu yorum sadece etkinlik organizatörleri tarafından görülebilir
          </p>
        </div>

        {/* Revizyon Talebi (if REVIZYON selected) */}
        {formData.karar === 'REVIZYON' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm font-medium text-orange-900 mb-2">Revizyon Talebi</p>
            <p className="text-xs text-orange-700">
              Revizyon seçtiğiniz için lütfen "Yorum" alanında başvuran kişiye yapması gereken
              düzeltmeleri detaylı bir şekilde açıklayın.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {!isCompleted && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Kaydediliyor...' : 'Taslak Olarak Kaydet'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
            </button>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800">
            <strong>Bilgi:</strong> Değerlendirmenizi taslak olarak kaydedebilir ve daha sonra
            geri dönüp tamamlayabilirsiniz. "Değerlendirmeyi Gönder" butonuna bastığınızda
            değerlendirme kesinleşir ve organizatörlere iletilir.
          </p>
        </div>
      </form>
    </div>
  );
}
