import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Plus, ArrowLeft, Eye, Edit, MapPin, Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';

async function getEvents() {
  return await prisma.event.findMany({
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      slug: true,
      baslik: true,
      aciklama: true,
      baslangic_tarihi: true,
      bitis_tarihi: true,
      konum: true,
      sehir: true,
      durum: true,
      max_katilimci: true,
      created_at: true,
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });
}

export default async function EventsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/admin/login');
  }

  const user = session.user as any;

  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const events = await getEvents();

  const stats = {
    total: events.length,
    active: events.filter(e => e.durum === 'YAYINDA').length,
    draft: events.filter(e => e.durum === 'TASLAK').length,
    completed: events.filter(e => e.durum === 'TAMAMLANDI').length,
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
              <div className="p-2 md:p-3 bg-blue-600 rounded-lg">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Etkinlik Yönetimi</h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">Tüm etkinlikleri görüntüleyin ve yönetin</p>
              </div>
            </div>
            <Link
              href="/admin/events/create"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg text-sm md:text-base w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Yeni Etkinlik
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Toplam Etkinlik</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Yayında</div>
            <div className="text-xl md:text-2xl font-bold text-green-600 mt-1">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Taslak</div>
            <div className="text-xl md:text-2xl font-bold text-yellow-600 mt-1">{stats.draft}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Tamamlandı</div>
            <div className="text-xl md:text-2xl font-bold text-gray-600 mt-1">{stats.completed}</div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {events.length === 0 ? (
            <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 text-center">
              <Calendar className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Henüz etkinlik yok</h3>
              <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6">İlk etkinliğinizi oluşturarak başlayın</p>
              <Link
                href="/admin/events/create"
                className="inline-flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                Yeni Etkinlik Oluştur
              </Link>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 md:p-6">
                  <div className="flex items-start justify-between mb-3 md:mb-4 gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2 truncate">{event.baslik}</h3>
                      <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{event.aciklama}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {event.durum === 'YAYINDA' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" />
                          <span className="hidden sm:inline">Yayında</span>
                        </span>
                      )}
                      {event.durum === 'TASLAK' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3" />
                          <span className="hidden sm:inline">Taslak</span>
                        </span>
                      )}
                      {event.durum === 'TAMAMLANDI' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <CheckCircle className="w-3 h-3" />
                          <span className="hidden sm:inline">Tamamlandı</span>
                        </span>
                      )}
                      {event.durum === 'IPTAL' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3" />
                          <span className="hidden sm:inline">İptal</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-3 md:mb-4">
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-600">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="truncate">{new Date(event.baslangic_tarihi).toLocaleDateString('tr-TR')} - {new Date(event.bitis_tarihi).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-600">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="truncate">{event.konum}, {event.sehir}</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-600">
                      <Users className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                      <span>{event._count.applications} başvuru{event.max_katilimci && ` / ${event.max_katilimci} kontenjan`}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 md:pt-4 border-t">
                    <Link
                      href={`/admin/events/${event.id}/manage`}
                      className="flex-1 inline-flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm font-medium"
                    >
                      <Edit className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Yönet</span>
                    </Link>
                    <Link
                      href={`/events/${event.slug}`}
                      target="_blank"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs md:text-sm font-medium"
                    >
                      <Eye className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Görüntüle</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
