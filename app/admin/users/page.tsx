import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, ArrowLeft, Search, UserPlus, Mail, Shield, CheckCircle, XCircle, Edit } from 'lucide-react';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';

async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      email: true,
      ad: true,
      soyad: true,
      role: true,
      kurum: true,
      aktif: true,
      email_verified: true,
      created_at: true,
      son_giris_tarihi: true,
    },
  });
}

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/admin/login');
  }

  const user = session.user as any;

  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const users = await getUsers();

  const stats = {
    total: users.length,
    active: users.filter(u => u.aktif).length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    reviewers: users.filter(u => u.role === 'HAKEM').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm md:text-base text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin Paneline Dön
          </Link>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-green-600 rounded-lg">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">Tüm sistem kullanıcılarını yönetin</p>
              </div>
            </div>
            <Link
              href="/admin/users/create"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base w-full sm:w-auto"
            >
              <UserPlus className="w-4 h-4" />
              Yeni Kullanıcı
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Toplam Kullanıcı</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Aktif</div>
            <div className="text-xl md:text-2xl font-bold text-green-600 mt-1">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Yöneticiler</div>
            <div className="text-xl md:text-2xl font-bold text-blue-600 mt-1">{stats.admins}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Hakemler</div>
            <div className="text-xl md:text-2xl font-bold text-purple-600 mt-1">{stats.reviewers}</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4 mb-6">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Kullanıcı ara..."
                className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select className="px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Tüm Roller</option>
                <option value="ADMIN">Admin</option>
                <option value="HAKEM">Hakem</option>
                <option value="ORGANIZATOR">Organizatör</option>
                <option value="KATILIMCI">Katılımcı</option>
              </select>
              <select className="px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-posta
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Kurum
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Son Giriş
                  </th>
                  <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                          <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs md:text-sm font-semibold">
                            {user.ad?.charAt(0)}{user.soyad?.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-2 md:ml-4">
                          <div className="text-xs md:text-sm font-medium text-gray-900">
                            {user.ad} {user.soyad}
                          </div>
                          <div className="text-xs md:text-sm text-gray-500">
                            {user.email_verified ? (
                              <span className="inline-flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                <span className="hidden sm:inline">Doğrulanmış</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-yellow-600">
                                <XCircle className="w-3 h-3" />
                                <span className="hidden sm:inline">Doğrulanmamış</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-900">
                        <Mail className="w-3 h-3 md:w-4 md:h-4 text-gray-400 hidden sm:block" />
                        <span className="truncate max-w-[120px] md:max-w-none">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'HAKEM' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'ORGANIZATOR' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        <Shield className="w-3 h-3" />
                        <span className="hidden sm:inline">
                          {user.role === 'ADMIN' ? 'Admin' :
                           user.role === 'HAKEM' ? 'Hakem' :
                           user.role === 'ORGANIZATOR' ? 'Organizatör' :
                           'Katılımcı'}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 hidden lg:table-cell">
                      {user.kurum || '-'}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      {user.aktif ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" />
                          <span className="hidden sm:inline">Aktif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3" />
                          <span className="hidden sm:inline">Pasif</span>
                        </span>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 hidden md:table-cell">
                      {user.son_giris_tarihi
                        ? new Date(user.son_giris_tarihi).toLocaleDateString('tr-TR')
                        : '-'}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-right text-xs md:text-sm font-medium">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-blue-600 hover:text-blue-900 transition-colors inline-flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Düzenle</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
