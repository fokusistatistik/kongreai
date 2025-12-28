'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [profileData, setProfileData] = useState({
    ad: '',
    soyad: '',
    email: '',
    unvan: '',
    kurum: '',
    telefon: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      setProfileData({
        ad: user.ad || '',
        soyad: user.soyad || '',
        email: user.email || '',
        unvan: user.unvan || '',
        kurum: user.kurum || '',
        telefon: user.telefon || '',
      });
    }
  }, [session]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profil bilgileriniz başarıyla güncellendi!' });
        // Update session and reload
        await update();
        // Reload page to reflect changes
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Profil güncellenirken bir hata oluştu.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor!' });
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır!' });
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordMessage({ type: 'success', text: 'Şifreniz başarıyla değiştirildi!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Şifre değiştirilirken bir hata oluştu.' });
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <User className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            Profil Bilgilerim
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            Hesap bilgilerinizi ve şifrenizi yönetin
          </p>
        </div>

        {/* Profile Information Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
            <User className="h-4 h-4 md:h-5 md:w-5 text-blue-600" />
            Kişisel Bilgiler
          </h2>

          {message && (
            <div className={`mb-4 md:mb-6 p-3 md:p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 h-4 md:h-5 md:w-5 shrink-0" />
              ) : (
                <AlertCircle className="h-4 h-4 md:h-5 md:w-5 shrink-0" />
              )}
              <span className="text-xs md:text-sm">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Ad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileData.ad}
                  onChange={(e) => setProfileData({ ...profileData, ad: e.target.value })}
                  className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Adınız"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Soyad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileData.soyad}
                  onChange={(e) => setProfileData({ ...profileData, soyad: e.target.value })}
                  className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Soyadınız"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  E-posta <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  placeholder="E-posta adresiniz"
                  disabled
                  title="E-posta adresi değiştirilemez"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={profileData.telefon}
                  onChange={(e) => setProfileData({ ...profileData, telefon: e.target.value })}
                  className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Ünvan
                </label>
                <input
                  type="text"
                  value={profileData.unvan}
                  onChange={(e) => setProfileData({ ...profileData, unvan: e.target.value })}
                  className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Örn: Dr., Prof. Dr., Araş. Gör."
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Kurum
                </label>
                <input
                  type="text"
                  value={profileData.kurum}
                  onChange={(e) => setProfileData({ ...profileData, kurum: e.target.value })}
                  className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Çalıştığınız kurum"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 h-4 md:h-5 md:w-5" />
                    Değişiklikleri Kaydet
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Password Change Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
            <Lock className="h-4 h-4 md:h-5 md:w-5 text-blue-600" />
            Şifre Değiştir
          </h2>

          {passwordMessage && (
            <div className={`mb-4 md:mb-6 p-3 md:p-4 rounded-lg flex items-center gap-3 ${
              passwordMessage.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {passwordMessage.type === 'success' ? (
                <CheckCircle className="h-4 h-4 md:h-5 md:w-5 shrink-0" />
              ) : (
                <AlertCircle className="h-4 h-4 md:h-5 md:w-5 shrink-0" />
              )}
              <span className="text-xs md:text-sm">{passwordMessage.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Mevcut Şifre <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mevcut şifrenizi girin"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Yeni Şifre <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Yeni şifre (en az 6 karakter)"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Yeni Şifre (Tekrar) <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Yeni şifreyi tekrar girin"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {passwordLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
                    Değiştiriliyor...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 h-4 md:h-5 md:w-5" />
                    Şifreyi Değiştir
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
