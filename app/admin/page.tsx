import { Calendar, Users, FileText, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-2 text-gray-600">Kongre Yönetim Sistemi - Yönetici Paneli</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Etkinlik</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
              <Users className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Başvuru</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <FileText className="w-10 h-10 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bekleyen İnceleme</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <Settings className="w-10 h-10 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Admin Menus */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/events"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <Calendar className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Etkinlik Yönetimi
            </h3>
            <p className="text-sm text-gray-600">
              Kongre ve etkinlikleri oluştur, düzenle, yönet
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <Users className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Kullanıcı Yönetimi
            </h3>
            <p className="text-sm text-gray-600">
              Kullanıcıları görüntüle ve yönet
            </p>
          </Link>

          <Link
            href="/admin/applications"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <FileText className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Başvuru Yönetimi
            </h3>
            <p className="text-sm text-gray-600">
              Başvuruları incele ve değerlendir
            </p>
          </Link>

          <Link
            href="/admin/payments"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <Settings className="w-12 h-12 text-yellow-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ödeme Yönetimi
            </h3>
            <p className="text-sm text-gray-600">
              Ödemeleri görüntüle ve yönet
            </p>
          </Link>

          <Link
            href="/admin/reviews"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <FileText className="w-12 h-12 text-indigo-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Hakem Yönetimi
            </h3>
            <p className="text-sm text-gray-600">
              Hakem atama ve değerlendirmeleri
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <Settings className="w-12 h-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sistem Ayarları
            </h3>
            <p className="text-sm text-gray-600">
              Genel sistem yapılandırması
            </p>
          </Link>
        </div>

        {/* Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Not:</strong> Admin panel sayfaları henüz geliştirilme aşamasındadır.
            Tüm yönetim özellikleri yakında eklenecektir.
          </p>
        </div>
      </div>
    </div>
  );
}
