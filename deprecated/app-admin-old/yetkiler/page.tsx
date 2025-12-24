'use client';

import { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, X, Check, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '@/lib/toast';
import { confirmDialog } from '@/lib/confirm-dialog';
import { TableSkeleton } from '@/components/loading-skeleton';

interface Yetki {
  id: string;
  kod: string;
  ad: string;
  kategori: string;
  aciklama?: string;
}

interface Rol {
  id: string;
  kod: string;
  ad: string;
  aciklama?: string;
  seviye: number;
  renk: string;
  icon?: string;
  aktif: boolean;
  yetkiler: {
    yetki: Yetki;
  }[];
  _count: {
    personeller: number;
  };
}

export default function YetkilerPage() {
  const [roller, setRoller] = useState<Rol[]>([]);
  const [tumYetkiler, setTumYetkiler] = useState<Yetki[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [expandedRol, setExpandedRol] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    kod: '',
    ad: '',
    aciklama: '',
    seviye: 1,
    renk: '#64748b',
    aktif: true,
    yetkiIds: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rollerRes, yetkilerRes] = await Promise.all([
        fetch('/api/rol'),
        fetch('/api/yetki')
      ]);

      const [rollerData, yetkilerData] = await Promise.all([
        rollerRes.json(),
        yetkilerRes.json()
      ]);

      if (rollerData.success) setRoller(rollerData.data);
      if (yetkilerData.success) setTumYetkiler(yetkilerData.data);
    } catch (err) {
      toast.error('Veriler yüklenemedi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.kod.trim().length < 2) {
      toast.error('Rol kodu en az 2 karakter olmalıdır');
      return;
    }

    if (formData.ad.trim().length < 3) {
      toast.error('Rol adı en az 3 karakter olmalıdır');
      return;
    }

    if (formData.seviye < 1 || formData.seviye > 10) {
      toast.error('Seviye 1-10 arası olmalıdır');
      return;
    }

    try {
      const url = editingRol ? `/api/rol/${editingRol.id}` : '/api/rol';
      const method = editingRol ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kod: formData.kod.trim().toUpperCase(),
          ad: formData.ad.trim(),
          aciklama: formData.aciklama.trim() || null,
          seviye: formData.seviye,
          renk: formData.renk,
          aktif: formData.aktif,
          yetkiIds: formData.yetkiIds
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'İşlem başarısız');
      }

      toast.success(editingRol ? 'Rol güncellendi' : 'Rol oluşturuldu');
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
    }
  };

  const handleDelete = async (rol: Rol) => {
    if (rol._count.personeller > 0) {
      toast.error(`Bu rol ${rol._count.personeller} kullanıcı tarafından kullanılıyor, silinemez`);
      return;
    }

    const confirmed = await confirmDialog.danger(
      `"${rol.ad}" rolünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      'Rol Sil'
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/rol/${rol.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        toast.success('Rol başarıyla silindi');
        loadData();
      } else {
        toast.error(data.error || 'Silme başarısız');
      }
    } catch (err) {
      toast.error('Bir hata oluştu');
    }
  };

  const handleEdit = (rol: Rol) => {
    setEditingRol(rol);
    setFormData({
      kod: rol.kod,
      ad: rol.ad,
      aciklama: rol.aciklama || '',
      seviye: rol.seviye,
      renk: rol.renk,
      aktif: rol.aktif,
      yetkiIds: rol.yetkiler.map(y => y.yetki.id)
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingRol(null);
    setFormData({
      kod: '',
      ad: '',
      aciklama: '',
      seviye: 1,
      renk: '#64748b',
      aktif: true,
      yetkiIds: []
    });
  };

  const toggleYetki = (yetkiId: string) => {
    setFormData(prev => ({
      ...prev,
      yetkiIds: prev.yetkiIds.includes(yetkiId)
        ? prev.yetkiIds.filter(id => id !== yetkiId)
        : [...prev.yetkiIds, yetkiId]
    }));
  };

  // Yetkileri kategorilere göre grupla
  const yetkilerByKategori = tumYetkiler.reduce((acc, yetki) => {
    if (!acc[yetki.kategori]) {
      acc[yetki.kategori] = [];
    }
    acc[yetki.kategori].push(yetki);
    return acc;
  }, {} as Record<string, Yetki[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mb-6" />
          <TableSkeleton rows={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-8 h-8 text-orange-600" />
              Yetki Yönetimi
            </h1>
            <p className="text-gray-600 mt-1">Roller ve yetkileri tanımlayın</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Yeni Rol
          </button>
        </div>

        {/* Rol Listesi */}
        <div className="space-y-4">
          {roller.map((rol) => (
            <div
              key={rol.id}
              className={`rounded-lg shadow-sm border transition-all ${
                !rol.aktif ? 'bg-gray-100 border-red-200 opacity-70' : 'bg-white border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: rol.renk }}
                      />
                      <h3 className="text-xl font-semibold text-gray-900">{rol.ad}</h3>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {rol.kod}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        Seviye {rol.seviye}
                      </span>
                      {!rol.aktif && (
                        <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full border border-red-300 flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          Pasif
                        </span>
                      )}
                    </div>
                    {rol.aciklama && (
                      <p className="text-sm text-gray-600 mb-3">{rol.aciklama}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {rol._count.personeller} Kullanıcı
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        {rol.yetkiler.length} Yetki
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExpandedRol(expandedRol === rol.id ? null : rol.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Yetkileri Göster/Gizle"
                    >
                      {expandedRol === rol.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(rol)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Düzenle"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(rol)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Sil"
                      disabled={rol._count.personeller > 0}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Yetki Listesi */}
                {expandedRol === rol.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Yetkiler:</h4>
                    {rol.yetkiler.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Bu role henüz yetki atanmamış</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {rol.yetkiler.map(({ yetki }) => (
                          <div
                            key={yetki.id}
                            className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">{yetki.ad}</p>
                              <p className="text-xs text-gray-500 truncate">{yetki.kod}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingRol ? 'Rol Düzenle' : 'Yeni Rol Oluştur'}
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

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Temel Bilgiler */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol Kodu *
                    </label>
                    <input
                      type="text"
                      value={formData.kod}
                      onChange={(e) => setFormData({ ...formData, kod: e.target.value.toUpperCase() })}
                      required
                      placeholder="ADMIN, OPERATOR, vb."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol Adı *
                    </label>
                    <input
                      type="text"
                      value={formData.ad}
                      onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                      required
                      placeholder="Sistem Yöneticisi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seviye (1-10) *
                    </label>
                    <input
                      type="number"
                      value={formData.seviye}
                      onChange={(e) => setFormData({ ...formData, seviye: parseInt(e.target.value) })}
                      required
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Renk
                    </label>
                    <input
                      type="color"
                      value={formData.renk}
                      onChange={(e) => setFormData({ ...formData, renk: e.target.value })}
                      className="w-full h-10 px-1 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Açıklama
                    </label>
                    <textarea
                      value={formData.aciklama}
                      onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                      rows={2}
                      placeholder="Rol açıklaması..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.aktif}
                        onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Aktif</span>
                    </label>
                  </div>
                </div>

                {/* Yetki Seçimi */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Yetkiler</h3>
                  <div className="space-y-4">
                    {Object.entries(yetkilerByKategori).map(([kategori, yetkiler]) => (
                      <div key={kategori} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">{kategori}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {yetkiler.map((yetki) => (
                            <label
                              key={yetki.id}
                              className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={formData.yetkiIds.includes(yetki.id)}
                                onChange={() => toggleYetki(yetki.id)}
                                className="mt-0.5 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{yetki.ad}</p>
                                <p className="text-xs text-gray-500">{yetki.kod}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    {editingRol ? 'Güncelle' : 'Oluştur'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
