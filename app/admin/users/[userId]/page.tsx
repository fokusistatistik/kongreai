'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, ArrowLeft, Save, Mail, User, Building, Phone, Briefcase, Shield, Loader2, AlertCircle, Trash2 } from 'lucide-react';

export default function EditUserPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    email: '',
    telefon: '',
    unvan: '',
    kurum: '',
    role: 'KATILIMCI' as 'ADMIN' | 'HAKEM' | 'ORGANIZATOR' | 'KATILIMCI',
    password: '',
    aktif: true,
    email_verified: false,
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.userId}`);
      const data = await response.json();

      if (response.ok) {
        setFormData({
          ad: data.user.ad || '',
          soyad: data.user.soyad || '',
          email: data.user.email || '',
          telefon: data.user.telefon || '',
          unvan: data.user.unvan || '',
          kurum: data.user.kurum || '',
          role: data.user.role || 'KATILIMCI',
          password: '',
          aktif: data.user.aktif !== undefined ? data.user.aktif : true,
          email_verified: data.user.email_verified !== undefined ? data.user.email_verified : false,
        });
      } else {
        setError(data.error || 'Kullanıcı yüklenemedi');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${params.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin/users');
      } else {
        setError(data.error || 'Kullanıcı güncellenirken bir hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${params.userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin/users');
      } else {
        setError(data.error || 'Kullanıcı silinirken bir hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Kullanıcı yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              Kullanıcı Listesine Dön
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-blue-600 rounded-lg">
                <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kullanıcıyı Düzenle</h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base">Kullanıcı bilgilerini güncelleyin</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-4 md:space-y-6">
            {/* Personal Info */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                Kişisel Bilgiler
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Ad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ad"
                    value={formData.ad}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="soyad"
                    value={formData.soyad}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-600" />
                İletişim Bilgileri
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    E-posta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="telefon"
                    value={formData.telefon}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-600" />
                Mesleki Bilgiler
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Ünvan
                  </label>
                  <input
                    type="text"
                    name="unvan"
                    value={formData.unvan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                    placeholder="Dr., Prof. Dr., vb."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Kurum
                  </label>
                  <input
                    type="text"
                    name="kurum"
                    value={formData.kurum}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-600" />
                Hesap Ayarları
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Rol <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  >
                    <option value="KATILIMCI">Katılımcı</option>
                    <option value="HAKEM">Hakem</option>
                    <option value="ORGANIZATOR">Organizatör</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Yeni Şifre
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm md:text-base"
                      placeholder="Şifre değiştirmek için girin"
                    />
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="w-full sm:w-auto px-4 py-2.5 md:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap text-sm md:text-base"
                    >
                      Oluştur
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Boş bırakırsanız şifre değiştirilmez. En az 6 karakter.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="aktif"
                      checked={formData.aktif}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Hesap aktif</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="email_verified"
                      checked={formData.email_verified}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">E-posta doğrulanmış</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 md:gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed text-sm md:text-base"
              >
                <Trash2 className="w-4 h-4" />
                Sil
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
          </form>
        </div>
      </div>
    </div>
  );
}
