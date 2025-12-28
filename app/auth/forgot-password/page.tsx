'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setCountdown(180); // Start 180 second countdown
      } else {
        setError(data.error || 'Bir hata oluştu');
      }
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-6 md:py-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-full mb-4">
            <Mail className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Şifremi Unuttum
          </h1>
          <p className="text-gray-600">
            E-posta adresinizi girin, şifre sıfırlama talimatları gönderelim
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
          {success ? (
            <div className="space-y-6">
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 md:h-16 md:w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  E-posta Gönderildi!
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
                </p>
              </div>

              {countdown > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 md:h-6 md:w-6 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm md:text-base text-blue-900 font-semibold">
                        Bağlantı <span className="text-lg">{formatTime(countdown)}</span> sonra geçersiz olacak
                      </p>
                      <p className="text-xs md:text-sm text-blue-700 mt-1">
                        Lütfen e-postanızı kontrol edin ve bağlantıya tıklayın
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  E-posta gelmedi mi?{' '}
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setError('');
                      setCountdown(0);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    Tekrar gönder
                  </button>
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Giriş sayfasına dön
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  <AlertCircle className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ornek@email.com"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-2.5 md:py-3 text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5 md:h-6 md:w-6" />
                    Doğrulama Gönder
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Giriş sayfasına dön
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            E-posta adresinizi hatırlamıyor musunuz?{' '}
            <a href="mailto:destek@kongreai.com" className="text-blue-600 hover:underline">
              Destek ekibiyle iletişime geçin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
