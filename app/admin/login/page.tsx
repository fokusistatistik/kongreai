'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, AlertCircle, Mail, Lock, ArrowLeft } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Login form component that uses useSearchParams
function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    // Redirect if already logged in
    if (session) {
      const role = (session.user as any)?.role;

      // Sadece ADMIN ve HAKEM'leri admin paneline al
      if (role === 'ADMIN' || role === 'HAKEM') {
        router.push('/admin');
      } else {
        // Normal kullanıcıları dashboard'a yönlendir
        setError('Bu sayfaya erişim yetkiniz yok. Normal kullanıcı girişi için ana sayfa giriş butonunu kullanın.');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    }
  }, [session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        // Başarılı giriş - session update bekle
        window.location.href = '/admin';
      } else {
        setError(result?.error || 'Giriş başarısız. E-posta ve şifrenizi kontrol edin.');
        setLoading(false);
      }
    } catch (err: any) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Ana Sayfaya Dön</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full mb-4 shadow-lg">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Paneli Girişi
          </h1>
          <p className="text-blue-200">Yönetici ve Hakem Girişi</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-100">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                E-posta
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg
                           text-white placeholder-blue-300/50
                           focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                           transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg
                           text-white placeholder-blue-300/50
                           focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                           transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold
                       hover:from-blue-700 hover:to-indigo-700
                       focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all
                       shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Giriş yapılıyor...
                </span>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
            <p className="text-xs text-blue-100 text-center">
              <strong>Önemli:</strong> Bu giriş sadece yönetici ve hakem hesapları içindir.
              Normal kullanıcı girişi için ana sayfa giriş butonunu kullanın.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-blue-200/60">
            © 2025 Kongre Yönetim Sistemi
          </p>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function AdminLoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white">Yükleniyor...</p>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginLoading />}>
      <AdminLoginForm />
    </Suspense>
  );
}
