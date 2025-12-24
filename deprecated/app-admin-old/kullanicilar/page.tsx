'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserCheck, UserX, Search, X } from 'lucide-react';
import { TableSkeleton } from '@/components/loading-skeleton';
import { NoDataFound } from '@/components/empty-state';
import { toast } from '@/lib/toast';
import { confirmDialog } from '@/lib/confirm-dialog';

interface Kullanici {
  id: string;
  tc_kimlik_no: string;
  ad: string;
  soyad: string;
  email: string;
  telefon?: string;
  aktif: boolean;
  rol: {
    id: string;
    ad: string;
    kod: string;
  };
  birim: {
    id: string;
    ad: string;
    kod: string;
  };
  ilk_giris: boolean;
  created_at: string;
}

interface Rol {
  id: string;
  ad: string;
  kod: string;
}

interface Birim {
  id: string;
  ad: string;
  kod: string;
}

export default function KullanicilarPage() {
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>([]);
  const [roller, setRoller] = useState<Rol[]>([]);
  const [birimler, setBirimler] = useState<Birim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingKullanici, setEditingKullanici] = useState<Kullanici | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    tc_kimlik_no: '',
    ad: '',
    soyad: '',
    email: '',
    telefon: '',
    rol_id: '',
    birim_id: '',
    aktif: true,
    password: '' // Sadece yeni kullanıcı için
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [kullanicilarRes, rollerRes, birimlerRes] = await Promise.all([
        fetch('/api/personel'),
        fetch('/api/rol'),
        fetch('/api/birim')
      ]);

      const [kullanicilarData, rollerData, birimlerData] = await Promise.all([
        kullanicilarRes.json(),
        rollerRes.json(),
        birimlerRes.json()
      ]);

      if (kullanicilarData.success) setKullanicilar(kullanicilarData.data);
      if (rollerData.success) setRoller(rollerData.data);
      if (birimlerData.success) setBirimler(birimlerData.data);
    } catch (err) {
      toast.error('Veriler yüklenemedi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateTC = (tc: string): boolean => {
    if (tc.length !== 11) return false;
    if (!/^\d+$/.test(tc)) return false;
    if (tc[0] === '0') return false;
    return true;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TC Kimlik validasyonu
    if (!validateTC(formData.tc_kimlik_no)) {
      toast.error('Geçerli bir TC Kimlik No giriniz (11 hane, rakamlardan oluşmalı)');
      return;
    }

    // Email validasyonu
    if (!validateEmail(formData.email)) {
      toast.error('Geçerli bir e-posta adresi giriniz');
      return;
    }

    // Şifre validasyonu (yeni kullanıcı için)
    if (!editingKullanici && formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      const url = editingKullanici
        ? `/api/personel/${editingKullanici.id}`
        : '/api/personel';

      const method = editingKullanici ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'İşlem başarısız');
      }

      toast.success(editingKullanici ? 'Kullanıcı güncellendi' : 'Kullanıcı oluşturuldu');
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDialog.danger(
      'Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      'Kullanıcı Sil'
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/personel/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('Kullanıcı başarıyla silindi');
        loadData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Silme başarısız');
      }
    } catch (_err) {
      toast.error('Bir hata oluştu');
    }
  };

  const toggleAktif = async (kullanici: Kullanici) => {
    try {
      const res = await fetch(`/api/personel/${kullanici.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aktif: !kullanici.aktif })
      });

      if (res.ok) {
        toast.success(`Kullanıcı ${!kullanici.aktif ? 'aktif' : 'pasif'} edildi`);
        loadData();
      }
    } catch (_err) {
      toast.error('İşlem başarısız');
    }
  };

  const openEditModal = (kullanici: Kullanici) => {
    setEditingKullanici(kullanici);
    setFormData({
      tc_kimlik_no: kullanici.tc_kimlik_no,
      ad: kullanici.ad,
      soyad: kullanici.soyad,
      email: kullanici.email,
      telefon: kullanici.telefon || '',
      rol_id: kullanici.rol.id,
      birim_id: kullanici.birim.id,
      aktif: kullanici.aktif,
      password: ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      tc_kimlik_no: '',
      ad: '',
      soyad: '',
      email: '',
      telefon: '',
      rol_id: '',
      birim_id: '',
      aktif: true,
      password: ''
    });
    setEditingKullanici(null);
  };

  const filteredKullanicilar = kullanicilar.filter(k =>
    k.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.tc_kimlik_no.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
          </div>
          <TableSkeleton rows={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
              <p className="text-gray-600 mt-1">
                Toplam {kullanicilar.length} kullanıcı
              </p>
            </div>

            <div className="flex gap-3">
              <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary w-full md:w-64"
                />
              </div>

              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Yeni Kullanıcı
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredKullanicilar.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm">
            <NoDataFound />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ad Soyad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Birim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredKullanicilar.map((kullanici) => (
                    <tr
                      key={kullanici.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        !kullanici.aktif ? 'bg-gray-100 opacity-60' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div>{kullanici.ad} {kullanici.soyad}</div>
                        <div className="text-xs text-gray-500">{kullanici.tc_kimlik_no}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {kullanici.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {kullanici.rol.ad}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>{kullanici.birim.ad}</div>
                        <div className="text-xs text-gray-500">{kullanici.birim.kod}</div>
                      </td>
                      <td className="px-6 py-4">
                        {kullanici.aktif ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            Aktif
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 flex items-center gap-1 w-fit border border-red-200">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            Pasif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleAktif(kullanici)}
                            className={`p-2 hover:bg-gray-100 rounded ${kullanici.aktif ? 'text-orange-600' : 'text-green-600'
                              }`}
                            title={kullanici.aktif ? 'Pasif Et' : 'Aktif Et'}
                          >
                            {kullanici.aktif ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openEditModal(kullanici)}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(kullanici.id)}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-gray-100 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingKullanici ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Oluştur'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TC Kimlik No *
                  </label>
                  <input
                    type="text"
                    value={formData.tc_kimlik_no}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, tc_kimlik_no: value });
                    }}
                    required
                    maxLength={11}
                    autoComplete="off"
                    placeholder="11 haneli TC"
                    pattern="\d{11}"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    autoComplete="off"
                    placeholder="ornek@saglik.gov.tr"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad *
                  </label>
                  <input
                    type="text"
                    value={formData.ad}
                    onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soyad *
                  </label>
                  <input
                    type="text"
                    value={formData.soyad}
                    onChange={(e) => setFormData({ ...formData, soyad: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                    placeholder="0262 XXX XX XX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol *
                  </label>
                  <select
                    value={formData.rol_id}
                    onChange={(e) => setFormData({ ...formData, rol_id: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Rol seçiniz</option>
                    {roller.map(rol => (
                      <option key={rol.id} value={rol.id}>{rol.ad}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birim *
                  </label>
                  <select
                    value={formData.birim_id}
                    onChange={(e) => setFormData({ ...formData, birim_id: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Birim seçiniz</option>
                    {birimler.map(birim => (
                      <option key={birim.id} value={birim.id}>{birim.ad}</option>
                    ))}
                  </select>
                </div>

                {!editingKullanici && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Geçici Şifre *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingKullanici}
                      placeholder="Geçici şifre"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.aktif}
                      onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">Aktif</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:opacity-90"
                >
                  {editingKullanici ? 'Güncelle' : 'Oluştur'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
