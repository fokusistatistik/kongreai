'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Save, AlertCircle, CheckCircle, User } from 'lucide-react';

export default function AdminProfilePage() {
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
    role: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      const user = session?.user as any;
      const role = user?.role;

      if (role !== 'ADMIN' && role !== 'HAKEM' && role !== 'SUPER_ADMIN' && role !== 'ORGANIZATOR') {
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

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
        role: user.role || '',
      });
    }
  }, [session]);

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      'SUPER_ADMIN': 'Süper Yönetici',
      'ADMIN': 'Yönetici',
      'ORGANIZATOR': 'Organizatör',
      'HAKEM': 'Hakem',
      'KATILIMCI': 'Katılımcı',
    };
    return roles[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'SUPER_ADMIN': 'bg-purple-100 text-purple-800 border-purple-300',
      'ADMIN': 'bg-blue-100 text-blue-800 border-blue-300',
      'ORGANIZATOR': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'HAKEM': 'bg-green-100 text-green-800 border-green-300',
      'KATILIMCI': 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad: profileData.ad,
          soyad: profileData.soyad,
          unvan: profileData.unvan,
          kurum: profileData.kurum,
          telefon: profileData.telefon,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profil bilgileriniz başarıyla güncellendi!' });
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
      const res = await fetch('/api/admin/change-password', {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-400" />
            Admin Profil Bilgileri
          </h1>
          <p className="text-blue-200 mt-2">
            Yönetici hesap bilgilerinizi ve şifrenizi yönetin
          </p>
        </div>

        {/* Profile Information Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-400" />
            Kişisel Bilgiler
          </h2>

          {/* Role Badge */}
          <div className="mb-6">
            <span className="text-sm text-blue-200 block mb-2">Yetki Seviyesi</span>
            <span className={`inline-flex items-center px-4 py-2 rounded-lg border font-medium ${getRoleBadgeColor(profileData.role)}`}>
              <Shield className="h-4 w-4 mr-2" />
              {getRoleName(profileData.role)}
            </span>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-500/20 text-green-100 border border-green-500/50'
                : 'bg-red-500/20 text-red-100 border border-red-500/50'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Ad <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileData.ad}
                  onChange={(e) => setProfileData({ ...profileData, ad: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Adınız"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Soyad <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileData.soyad}
                  onChange={(e) => setProfileData({ ...profileData, soyad: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Soyadınız"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  E-posta <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={profileData.email}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-gray-400 cursor-not-allowed"
                  disabled
                  title="E-posta adresi değiştirilemez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={profileData.telefon}
                  onChange={(e) => setProfileData({ ...profileData, telefon: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Ünvan
                </label>
                <input
                  type="text"
                  value={profileData.unvan}
                  onChange={(e) => setProfileData({ ...profileData, unvan: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Örn: Dr., Prof. Dr., Araş. Gör."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Kurum
                </label>
                <input
                  type="text"
                  value={profileData.kurum}
                  onChange={(e) => setProfileData({ ...profileData, kurum: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Çalıştığınız kurum"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Değişiklikleri Kaydet
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Password Change Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-400" />
            Şifre Değiştir
          </h2>

          {passwordMessage && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              passwordMessage.type === 'success'
                ? 'bg-green-500/20 text-green-100 border border-green-500/50'
                : 'bg-red-500/20 text-red-100 border border-red-500/50'
            }`}>
              {passwordMessage.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Mevcut Şifre <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mevcut şifrenizi girin"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Yeni Şifre <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Yeni şifre (en az 6 karakter)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Yeni Şifre (Tekrar) <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Yeni şifreyi tekrar girin"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {passwordLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Değiştiriliyor...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
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
