'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Activity,
  Server,
  Package,
  Clock,
  User,
  FileText,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { TableSkeleton } from '@/components/loading-skeleton';

interface SistemBilgi {
  sistem: {
    versiyon: string;
    ortam: string;
    database: string;
    nodeVersion: string;
    platform: string;
  };
  istatistikler: {
    toplamKullanici: number;
    toplamBirim: number;
    toplamRol: number;
    toplamYetki: number;
  };
  sonAktiviteler: {
    id: string;
    islem: string;
    tablo: string;
    personel_email: string | null;
    aciklama: string | null;
    created_at: string;
  }[];
}

export default function AyarlarPage() {
  const [sistemBilgi, setSistemBilgi] = useState<SistemBilgi | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSistemBilgi();
  }, []);

  const loadSistemBilgi = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/sistem-bilgi');
      const data = await res.json();

      if (data.success) {
        setSistemBilgi(data.data);
      } else {
        toast.error('Sistem bilgileri yüklenemedi');
      }
    } catch (error) {
      console.error('Sistem bilgi error:', error);
      toast.error('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSistemBilgi();
    setRefreshing(false);
    toast.success('Bilgiler yenilendi');
  };

  const formatTarih = (tarih: string) => {
    return new Date(tarih).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
              <Settings className="w-8 h-8 text-green-600" />
              Sistem Ayarları
            </h1>
            <p className="text-gray-600 mt-1">Sistem yapılandırması ve bilgileri</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>

        {/* Sistem Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Versiyon</h3>
                <p className="text-sm text-gray-600">Sistem versiyonu</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {sistemBilgi?.sistem.versiyon}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Database</h3>
                <p className="text-sm text-gray-600">Veritabanı sistemi</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {sistemBilgi?.sistem.database}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ortam</h3>
                <p className="text-sm text-gray-600">Çalışma ortamı</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600 capitalize">
              {sistemBilgi?.sistem.ortam}
            </p>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-orange-600" />
            Database İstatistikleri
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <User className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="text-sm text-gray-600">Kullanıcılar</p>
              <p className="text-2xl font-bold text-blue-600">
                {sistemBilgi?.istatistikler.toplamKullanici}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Database className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <p className="text-sm text-gray-600">Birimler</p>
              <p className="text-2xl font-bold text-purple-600">
                {sistemBilgi?.istatistikler.toplamBirim}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Settings className="w-8 h-8 mx-auto text-orange-600 mb-2" />
              <p className="text-sm text-gray-600">Roller</p>
              <p className="text-2xl font-bold text-orange-600">
                {sistemBilgi?.istatistikler.toplamRol}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <FileText className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <p className="text-sm text-gray-600">Yetkiler</p>
              <p className="text-2xl font-bold text-green-600">
                {sistemBilgi?.istatistikler.toplamYetki}
              </p>
            </div>
          </div>
        </div>

        {/* Teknik Bilgiler */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Teknik Bilgiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Node.js Versiyonu:</span>
              <span className="text-sm text-gray-900 font-mono">
                {sistemBilgi?.sistem.nodeVersion}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Platform:</span>
              <span className="text-sm text-gray-900 font-mono">
                {sistemBilgi?.sistem.platform}
              </span>
            </div>
          </div>
        </div>

        {/* Son Aktiviteler */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Son Aktiviteler
          </h2>
          {sistemBilgi?.sonAktiviteler && sistemBilgi.sonAktiviteler.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tarih
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      İşlem
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tablo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kullanıcı
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Açıklama
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sistemBilgi.sonAktiviteler.map((aktivite) => (
                    <tr key={aktivite.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {formatTarih(aktivite.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {aktivite.islem}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {aktivite.tablo}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {aktivite.personel_email || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {aktivite.aciklama || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Henüz aktivite kaydı bulunmuyor</p>
          )}
        </div>
      </div>
    </div>
  );
}
