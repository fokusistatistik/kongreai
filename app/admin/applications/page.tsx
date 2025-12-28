'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Search,
  Filter,
  Eye,
  UserCheck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Calendar,
  User,
  Loader2,
} from 'lucide-react';

interface Application {
  id: string;
  tip: string;
  baslik: string | null;
  durum: string;
  created_at: string;
  user: {
    ad: string;
    soyad: string;
    email: string;
    kurum: string | null;
  };
  event: {
    baslik: string;
  };
  reviews: any[];
}

export default function ApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [stats, setStats] = useState({
    total: 0,
    beklemede: 0,
    hakemde: 0,
    kabul: 0,
    red: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [searchTerm, statusFilter, typeFilter, applications]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/applications');
      const data = await response.json();

      if (response.ok) {
        setApplications(data.applications);
        calculateStats(data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (apps: Application[]) => {
    setStats({
      total: apps.length,
      beklemede: apps.filter(a => a.durum === 'BEKLEMEDE').length,
      hakemde: apps.filter(a => a.durum === 'HAKEMDE').length,
      kabul: apps.filter(a => a.durum === 'KABUL').length,
      red: apps.filter(a => a.durum === 'RED').length,
    });
  };

  const filterApplications = () => {
    let filtered = [...applications];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.user.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user.soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.baslik && app.baslik.toLowerCase().includes(searchTerm.toLowerCase())) ||
        app.event.baslik.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(app => app.durum === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(app => app.tip === typeFilter);
    }

    setFilteredApplications(filtered);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Başvurular yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 md:p-3 bg-purple-600 rounded-lg">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Başvuru Yönetimi</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Tüm başvuruları inceleyin ve yönetin
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
          <StatCard title="Toplam" value={stats.total} color="bg-gray-600" />
          <StatCard title="Beklemede" value={stats.beklemede} color="bg-yellow-500" />
          <StatCard title="Hakemde" value={stats.hakemde} color="bg-blue-500" />
          <StatCard title="Kabul" value={stats.kabul} color="bg-green-500" />
          <StatCard title="Red" value={stats.red} color="bg-red-500" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ara
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="İsim, email, başlık..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durum
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="ALL">Tümü</option>
                <option value="BEKLEMEDE">Beklemede</option>
                <option value="HAKEMDE">Hakemde</option>
                <option value="KABUL">Kabul</option>
                <option value="RED">Red</option>
                <option value="REVIZYON">Revizyon</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tip
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="ALL">Tümü</option>
                <option value="SOZLU_BILDIRI">Sözlü Bildiri</option>
                <option value="POSTER">Poster</option>
                <option value="DINLEYICI">Dinleyici</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>{filteredApplications.length} başvuru gösteriliyor</span>
            {(searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setTypeFilter('ALL');
                }}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Başvuran
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Etkinlik
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tip
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Tarih
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Başvuru bulunamadı</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                          ? 'Farklı filtreler deneyin'
                          : 'Henüz başvuru yapılmamış'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-3 md:px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {app.user.ad} {app.user.soyad}
                          </div>
                          <div className="text-xs text-gray-500">{app.user.email}</div>
                          {app.user.kurum && (
                            <div className="text-xs text-gray-400 mt-0.5">{app.user.kurum}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 hidden lg:table-cell">
                        <div className="text-sm text-gray-900">{app.event.baslik}</div>
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        <TypeBadge type={app.tip} />
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        <StatusBadge status={app.durum} reviewCount={app.reviews.length} />
                      </td>
                      <td className="px-3 md:px-6 py-4 text-sm text-gray-500 hidden md:table-cell whitespace-nowrap">
                        {new Date(app.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        <Link
                          href={`/admin/applications/${app.id}`}
                          className="inline-flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-medium text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">İncele</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
      <div className={`${color} text-white w-8 h-8 rounded-lg flex items-center justify-center mb-2`}>
        <FileText className="w-4 h-4" />
      </div>
      <p className="text-xl md:text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs md:text-sm text-gray-600 mt-0.5">{title}</p>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const styles = {
    SOZLU_BILDIRI: 'bg-blue-100 text-blue-800',
    POSTER: 'bg-purple-100 text-purple-800',
    DINLEYICI: 'bg-gray-100 text-gray-800',
  };

  const labels = {
    SOZLU_BILDIRI: 'Sözlü',
    POSTER: 'Poster',
    DINLEYICI: 'Dinleyici',
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
        styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {labels[type as keyof typeof labels] || type}
    </span>
  );
}

function StatusBadge({ status, reviewCount }: { status: string; reviewCount: number }) {
  const styles = {
    BEKLEMEDE: 'bg-yellow-100 text-yellow-800',
    HAKEMDE: 'bg-blue-100 text-blue-800',
    KABUL: 'bg-green-100 text-green-800',
    RED: 'bg-red-100 text-red-800',
    REVIZYON: 'bg-orange-100 text-orange-800',
  };

  const icons = {
    BEKLEMEDE: Clock,
    HAKEMDE: UserCheck,
    KABUL: CheckCircle,
    RED: XCircle,
    REVIZYON: AlertCircle,
  };

  const Icon = icons[status as keyof typeof icons] || Clock;

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ${
          styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
        }`}
      >
        <Icon className="w-3 h-3" />
        {status}
      </span>
      {reviewCount > 0 && (
        <span className="text-xs text-gray-500">({reviewCount})</span>
      )}
    </div>
  );
}
