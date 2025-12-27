import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Users,
  FileText,
  DollarSign,
  Eye,
  Settings,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  UserCheck,
  User,
  Plus
} from 'lucide-react';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';

async function getAdminStats() {
  const [
    totalEvents,
    activeEvents,
    totalApplications,
    pendingApplications,
    totalUsers,
    totalPayments,
    pendingPayments,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { durum: 'YAYINDA' } }),
    prisma.application.count(),
    prisma.application.count({ where: { durum: 'BEKLEMEDE' } }),
    prisma.user.count(),
    prisma.payment.count(),
    prisma.payment.count({ where: { durum: 'BEKLIYOR' } }),
  ]);

  return {
    totalEvents,
    activeEvents,
    totalApplications,
    pendingApplications,
    totalUsers,
    totalPayments,
    pendingPayments,
  };
}

async function getRecentApplications() {
  return await prisma.application.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
    include: {
      user: true,
      event: true,
    },
  });
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/admin/login');
  }

  const user = session.user as any;

  // Check if user has admin or reviewer role
  if (user.role !== 'ADMIN' && user.role !== 'HAKEM' && user.role !== 'SUPER_ADMIN' && user.role !== 'ORGANIZATOR') {
    redirect('/dashboard');
  }

  const stats = await getAdminStats();
  const recentApplications = await getRecentApplications();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-1">
              Hoş geldiniz, {user.name}
              {user.role === 'HAKEM' && ' (Hakem)'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/events/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              Yeni Etkinlik
            </Link>
            <Link
              href="/admin/profile"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <User className="w-4 h-4" />
              Profil Ayarları
            </Link>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Ana Siteye Dön
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Toplam Etkinlik"
            value={stats.totalEvents}
            subtitle={`${stats.activeEvents} aktif`}
            icon={<Calendar className="w-6 h-6" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Toplam Başvuru"
            value={stats.totalApplications}
            subtitle={`${stats.pendingApplications} beklemede`}
            icon={<FileText className="w-6 h-6" />}
            color="bg-green-500"
          />
          <StatCard
            title="Toplam Kullanıcı"
            value={stats.totalUsers}
            subtitle="Kayıtlı kullanıcı"
            icon={<Users className="w-6 h-6" />}
            color="bg-purple-500"
          />
          <StatCard
            title="Toplam Ödeme"
            value={stats.totalPayments}
            subtitle={`${stats.pendingPayments} bekliyor`}
            icon={<DollarSign className="w-6 h-6" />}
            color="bg-orange-500"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Hızlı Erişim</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'ORGANIZATOR') && (
              <>
                <QuickActionCard
                  title="Etkinlik Yönetimi"
                  description="Etkinlik oluştur, düzenle, yönet"
                  href="/admin/events"
                  icon={<Calendar className="w-8 h-8" />}
                  color="bg-blue-500"
                />
                <QuickActionCard
                  title="Kullanıcı Yönetimi"
                  description="Kullanıcıları görüntüle ve yönet"
                  href="/admin/users"
                  icon={<Users className="w-8 h-8" />}
                  color="bg-green-500"
                />
              </>
            )}
            <QuickActionCard
              title="Başvuru Yönetimi"
              description="Başvuruları incele ve değerlendir"
              href="/admin/applications"
              icon={<FileText className="w-8 h-8" />}
              color="bg-purple-500"
            />
            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'ORGANIZATOR') && (
              <>
                <QuickActionCard
                  title="Ödeme Yönetimi"
                  description="Ödemeleri görüntüle ve onayla"
                  href="/admin/payments"
                  icon={<DollarSign className="w-8 h-8" />}
                  color="bg-orange-500"
                />
                <QuickActionCard
                  title="Hakem Atama"
                  description="Başvurulara hakem ata"
                  href="/admin/reviewers"
                  icon={<UserCheck className="w-8 h-8" />}
                  color="bg-indigo-500"
                />
                <QuickActionCard
                  title="Sistem Ayarları"
                  description="Genel ayarları düzenle"
                  href="/admin/settings"
                  icon={<Settings className="w-8 h-8" />}
                  color="bg-gray-600"
                />
              </>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Son Başvurular</h2>
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Başvuran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Etkinlik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tip
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentApplications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Henüz başvuru bulunmuyor
                      </td>
                    </tr>
                  ) : (
                    recentApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {app.user.ad} {app.user.soyad}
                            </div>
                            <div className="text-sm text-gray-500">{app.user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{app.event.baslik}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{app.tip}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={app.durum} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(app.created_at).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/admin/applications/${app.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            İncele
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
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon,
  color,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
    >
      <div className={`${color} text-white p-3 rounded-lg inline-flex mb-4`}>{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    BEKLEMEDE: 'bg-yellow-100 text-yellow-800',
    HAKEMDE: 'bg-blue-100 text-blue-800',
    KABUL: 'bg-green-100 text-green-800',
    RED: 'bg-red-100 text-red-800',
    REVIZYON: 'bg-orange-100 text-orange-800',
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {status}
    </span>
  );
}
