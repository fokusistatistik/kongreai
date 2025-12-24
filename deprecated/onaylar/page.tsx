'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { TableSkeleton } from '@/components/loading-skeleton';
import { NoDataFound } from '@/components/empty-state';
import { toast } from '@/lib/toast';

interface OnayBekleyen {
  id: string;
  tarih: string;
  poliklinik_islem_sayisi: number;
  poliklinik_kontrol_sayisi: number;
  onay_durumu: 'BEKLEMEDE' | 'ONAYLANDI' | 'REDDEDILDI';
  shm_alt_birim: {
    ad: string;
    kod: string;
  };
  personel: {
    ad: string;
    soyad: string;
  };
  created_at: string;
}

export default function OnaylarPage() {
  const [kayitlar, setKayitlar] = useState<OnayBekleyen[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [redGerekce, setRedGerekce] = useState('');
  const [showRedModal, setShowRedModal] = useState(false);
  const [redKayitId, setRedKayitId] = useState<string | null>(null);

  useEffect(() => {
    loadBekleyenKayitlar();
  }, []);

  const loadBekleyenKayitlar = async () => {
    try {
      const res = await fetch('/api/shm/veri-giris?onay_durumu=BEKLEMEDE');
      const data = await res.json();

      if (data.success) {
        setKayitlar(data.data);
      }
    } catch (err) {
      toast.error('Veriler yüklenemedi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOnayla = async (id: string) => {
    try {
      const res = await fetch('/api/shm/veri-giris/onay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, onay: true })
      });

      if (res.ok) {
        toast.success('Kayıt onaylandı');
        loadBekleyenKayitlar();
      } else {
        toast.error('Onaylama başarısız');
      }
    } catch (err) {
      toast.error('Bir hata oluştu');
    }
  };

  const handleReddet = async () => {
    if (!redKayitId || !redGerekce.trim()) {
      toast.warning('Lütfen red gerekçesi giriniz');
      return;
    }

    try {
      const res = await fetch('/api/shm/veri-giris/onay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: redKayitId,
          onay: false,
          gerekce: redGerekce
        })
      });

      if (res.ok) {
        toast.success('Kayıt reddedildi');
        setShowRedModal(false);
        setRedGerekce('');
        setRedKayitId(null);
        loadBekleyenKayitlar();
      } else {
        toast.error('Reddetme başarısız');
      }
    } catch (err) {
      toast.error('Bir hata oluştu');
    }
  };

  const handleTopluOnayla = async () => {
    if (selectedIds.length === 0) {
      toast.warning('Lütfen kayıt seçiniz');
      return;
    }

    try {
      const results = await Promise.all(
        selectedIds.map(id =>
          fetch('/api/shm/veri-giris/onay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, onay: true })
          })
        )
      );

      const basarililar = results.filter(r => r.ok).length;

      if (basarililar === selectedIds.length) {
        toast.success(`${basarililar} kayıt onaylandı`);
      } else {
        toast.warning(`${basarililar}/${selectedIds.length} kayıt onaylandı`);
      }

      setSelectedIds([]);
      loadBekleyenKayitlar();
    } catch (err) {
      toast.error('Toplu onaylama başarısız');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === kayitlar.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(kayitlar.map(k => k.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mb-2" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-64" />
          </div>
          <TableSkeleton rows={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Onay Bekleyen Kayıtlar</h1>
              <p className="text-gray-600 mt-1">
                Toplam {kayitlar.length} kayıt onay bekliyor
              </p>
            </div>

            {selectedIds.length > 0 && (
              <div className="flex gap-2">
                <span className="text-sm text-gray-600 self-center">
                  {selectedIds.length} kayıt seçili
                </span>
                <button
                  onClick={handleTopluOnayla}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Toplu Onayla
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        {kayitlar.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm">
            <NoDataFound />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === kayitlar.length && kayitlar.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Alt Birim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Personel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      İşlem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kontrol
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kayitlar.map((kayit) => (
                    <tr key={kayit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(kayit.id)}
                          onChange={() => toggleSelect(kayit.id)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(kayit.tarih).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{kayit.shm_alt_birim.ad}</div>
                        <div className="text-xs text-gray-500">{kayit.shm_alt_birim.kod}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {kayit.personel.ad} {kayit.personel.soyad}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {kayit.poliklinik_islem_sayisi}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {kayit.poliklinik_kontrol_sayisi}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOnayla(kayit.id)}
                            className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded"
                            title="Onayla"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setRedKayitId(kayit.id);
                              setShowRedModal(true);
                            }}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                            title="Reddet"
                          >
                            <XCircle className="w-5 h-5" />
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

      {/* Red Gerekçesi Modal */}
      {showRedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Red Gerekçesi</h3>

            <textarea
              value={redGerekce}
              onChange={(e) => setRedGerekce(e.target.value)}
              placeholder="Reddetme gerekçenizi giriniz..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary min-h-[120px]"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleReddet}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Reddet
              </button>
              <button
                onClick={() => {
                  setShowRedModal(false);
                  setRedGerekce('');
                  setRedKayitId(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
