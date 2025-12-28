'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Loader2, CheckCircle, AlertCircle, Clock, Mail } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [step, setStep] = useState<'waiting' | 'verified' | 'error'>('waiting');
  const [timeLeft, setTimeLeft] = useState(180); // 180 saniye = 3 dakika
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (step !== 'waiting' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStep('error');
          setError('Doğrulama süresi doldu. Lütfen tekrar deneyin.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Poll n8n webhook status
  useEffect(() => {
    if (!token || step !== 'waiting') return;

    const pollStatus = async () => {
      try {
        const res = await fetch('/api/auth/check-reset-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok && data.verified) {
          setStep('verified');
        } else if (!res.ok && data.error) {
          setStep('error');
          setError(data.error);
        }
      } catch (err) {
        // Silently continue polling
      }
    };

    // Poll every 3 seconds
    const interval = setInterval(pollStatus, 3000);
    // Initial poll
    pollStatus();

    return () => clearInterval(interval);
  }, [token, step]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      return;
    }

    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Şifre sıfırlanamadı');
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

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8 text-center">
          <AlertCircle className="h-12 w-12 md:h-16 md:w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Geçersiz Link
          </h3>
          <p className="text-gray-600 mb-6">
            Şifre sıfırlama linki geçersiz veya süresi dolmuş.
          </p>
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-6 md:py-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-full mb-4">
            {step === 'verified' ? (
              <Lock className="h-6 w-6 md:h-8 md:w-8 text-white" />
            ) : step === 'error' ? (
              <AlertCircle className="h-6 w-6 md:h-8 md:w-8 text-white" />
            ) : (
              <Mail className="h-6 w-6 md:h-8 md:w-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {step === 'verified' ? 'Yeni Şifre Belirleyin' :
             step === 'error' ? 'Hata Oluştu' :
             'E-posta Onayı Bekleniyor'}
          </h1>
          <p className="text-gray-600">
            {step === 'verified' ? 'Hesabınız için yeni bir şifre oluşturun' :
             step === 'error' ? 'Şifre sıfırlama işlemi başarısız oldu' :
             'Lütfen e-postanızdaki onay linkine tıklayın'}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
          {step === 'waiting' && (
            <div className="text-center py-8">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                E-posta Doğrulaması Bekleniyor
              </h3>

              <p className="text-gray-600 mb-6">
                Size gönderilen e-postadaki doğrulama linkine tıklayın.<br />
                Link tıklandığında otomatik olarak devam edilecektir.
              </p>

              {/* Countdown */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-blue-900">
                  <Clock className="h-5 w-5 md:h-6 md:w-6" />
                  <span className="text-2xl font-bold font-mono">{formatTime(timeLeft)}</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">Kalan süre</p>
              </div>

              <div className="text-sm text-gray-500">
                <p className="mb-2">E-postayı almadınız mı?</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-blue-600 hover:underline"
                >
                  Sayfayı yenileyin ve tekrar deneyin
                </button>
              </div>
            </div>
          )}

          {step === 'verified' && !success && (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 mb-6">
                <CheckCircle className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />
                <span className="text-sm">E-posta doğrulandı! Şimdi yeni şifrenizi belirleyin.</span>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  <AlertCircle className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="En az 6 karakter"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Şifrenizi tekrar girin"
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
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    Şifreyi Kaydet
                  </>
                )}
              </button>
            </form>
          )}

          {success && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 md:h-16 md:w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Şifreniz Değiştirildi!
              </h3>
              <p className="text-gray-600 mb-4">
                Yeni şifrenizle giriş yapabilirsiniz.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Giriş sayfasına yönlendiriliyorsunuz...</span>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 md:h-16 md:w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                İşlem Başarısız
              </h3>
              <p className="text-gray-600 mb-6">
                {error || 'Doğrulama süresi doldu veya link geçersiz.'}
              </p>
              <Link
                href="/auth/forgot-password"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tekrar Dene
              </Link>
            </div>
          )}
        </div>

        {/* Help Link */}
        {!success && (
          <div className="mt-6 text-center text-sm text-gray-600">
            <Link href="/login" className="text-blue-600 hover:underline">
              Giriş sayfasına dön
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
