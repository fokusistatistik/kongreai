'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function SetupDemoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetupDemo = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/setup-demo-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        // Redirect to homepage after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setError(data.error || 'Failed to setup demo event');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
            <Database className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demo Etkinlik Kurulumu
          </h1>
          <p className="text-gray-600">
            Sistemde demo etkinlik oluşturun ve test edin
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {!result && !error && (
            <div className="text-center">
              <p className="text-gray-700 mb-6">
                Bu işlem database'de demo bir etkinlik oluşturacak:
              </p>
              <ul className="text-left space-y-2 mb-8 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span><strong>1. Uluslararası Tıp Kongresi 2026</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Tarih: 15-17 Haziran 2026</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>6 adet timeline öğesi (önemli tarihler)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Durum: YAYINDA</span>
                </li>
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Not:</strong> Eğer sistemde zaten etkinlik varsa, hiçbir değişiklik yapılmaz.
                </p>
              </div>

              <button
                onClick={handleSetupDemo}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5" />
                    Demo Etkinlik Oluştur
                  </>
                )}
              </button>
            </div>
          )}

          {/* Success Message */}
          {result && result.success && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {result.message}
              </h2>

              {result.event && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-left">
                  <h3 className="font-semibold text-green-900 mb-3">Oluşturulan Etkinlik:</h3>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li><strong>Başlık:</strong> {result.event.baslik}</li>
                    <li><strong>Slug:</strong> {result.event.slug}</li>
                    <li><strong>Tarih:</strong> {result.event.dates}</li>
                    <li><strong>Durum:</strong> {result.event.durum}</li>
                    <li><strong>Timeline Öğeleri:</strong> {result.event.timelineItems} adet</li>
                  </ul>
                </div>
              )}

              {result.existingEvents && result.existingEvents.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
                  <h3 className="font-semibold text-blue-900 mb-3">Mevcut Etkinlikler:</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    {result.existingEvents.map((event: any) => (
                      <li key={event.id}>{event.baslik}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-gray-600 mb-6">
                Anasayfaya yönlendiriliyorsunuz...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Hata Oluştu
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
              <button
                onClick={() => {
                  setError(null);
                  setResult(null);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/admin')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Admin Paneline Dön
          </button>
        </div>
      </div>
    </div>
  );
}
