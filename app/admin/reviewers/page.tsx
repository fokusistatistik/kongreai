import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserCheck, ArrowLeft, UserPlus, Mail, Calendar, Eye, FileText, CheckCircle, XCircle } from 'lucide-react';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';

async function getReviewers() {
  const reviewers = await prisma.user.findMany({
    where: { role: 'HAKEM' },
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      email: true,
      ad: true,
      soyad: true,
      unvan: true,
      kurum: true,
      aktif: true,
      ilk_giris: true,
      created_at: true,
      son_giris_tarihi: true,
    },
  });

  // Get assignments count for each reviewer
  const reviewersWithStats = await Promise.all(
    reviewers.map(async (reviewer) => {
      const assignmentCount = await prisma.review.count({
        where: { hakem_id: reviewer.id },
      });

      const completedCount = await prisma.review.count({
        where: {
          hakem_id: reviewer.id,
          tamamlandi: true,
        },
      });

      return {
        ...reviewer,
        assignmentCount,
        completedCount,
      };
    })
  );

  return reviewersWithStats;
}

export default async function ReviewersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/admin/login');
  }

  const user = session.user as any;

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const reviewers = await getReviewers();

  const stats = {
    total: reviewers.length,
    active: reviewers.filter(r => r.aktif).length,
    firstLogin: reviewers.filter(r => r.ilk_giris).length,
    totalAssignments: reviewers.reduce((sum, r) => sum + r.assignmentCount, 0),
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
              <div className="p-2 md:p-3 bg-purple-600 rounded-lg">
                <UserCheck className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Hakem Yönetimi</h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">Bildiri hakem atamalarını yönetin</p>
              </div>
            </div>
            <Link
              href="/admin/reviewers/create"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm md:text-base w-full sm:w-auto"
            >
              <UserPlus className="w-4 h-4" />
              Yeni Hakem Ekle
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Toplam Hakem</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Aktif Hakem</div>
            <div className="text-xl md:text-2xl font-bold text-green-600 mt-1">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Şifre Değiştirmedi</div>
            <div className="text-xl md:text-2xl font-bold text-yellow-600 mt-1">{stats.firstLogin}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Toplam Atama</div>
            <div className="text-xl md:text-2xl font-bold text-purple-600 mt-1">{stats.totalAssignments}</div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Not:</strong> Yeni eklenen hakemler ilk girişlerinde şifre değiştirmeye yönlendirilecektir.
            Hakemlere otomatik olarak e-posta ve geçici şifre gönderilir.
          </p>
        </div>

        {/* Reviewers List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hakem
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-posta
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Kurum
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Atamalar
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Kayıt Tarihi
                  </th>
                  <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviewers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">Henüz hakem eklenmemiş</p>
                      <Link
                        href="/admin/reviewers/create"
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        İlk hakemi ekleyin
                      </Link>
                    </td>
                  </tr>
                ) : (
                  reviewers.map((reviewer) => (
                    <tr key={reviewer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs md:text-sm font-semibold">
                              {reviewer.ad?.charAt(0)}{reviewer.soyad?.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-2 md:ml-4">
                            <div className="text-xs md:text-sm font-medium text-gray-900">
                              {reviewer.unvan && `${reviewer.unvan} `}
                              {reviewer.ad} {reviewer.soyad}
                            </div>
                            {reviewer.ilk_giris && (
                              <div className="text-xs text-yellow-600 font-medium">
                                ⚠️ <span className="hidden sm:inline">Şifre değiştirmedi</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-900">
                          <Mail className="w-3 h-3 md:w-4 md:h-4 text-gray-400 hidden sm:block" />
                          <span className="truncate max-w-[120px] md:max-w-none">{reviewer.email}</span>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 hidden lg:table-cell">
                        {reviewer.kurum || '-'}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 md:gap-2">
                          <FileText className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                          <span className="text-xs md:text-sm text-gray-900 font-medium">
                            {reviewer.assignmentCount}
                          </span>
                          <span className="text-xs text-gray-500 hidden sm:inline">
                            ({reviewer.completedCount} tamamlandı)
                          </span>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        {reviewer.aktif ? (
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
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(reviewer.created_at).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-right text-xs md:text-sm font-medium">
                        <Link
                          href={`/admin/reviewers/${reviewer.id}`}
                          className="text-purple-600 hover:text-purple-900 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="hidden sm:inline">Detay</span>
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
