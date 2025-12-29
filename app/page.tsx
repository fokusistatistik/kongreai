import Link from 'next/link';
import { Calendar, MapPin, Users, ChevronRight, GraduationCap, Bell, ExternalLink } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import { listEventsViaWebhook, listAnnouncementsViaWebhook } from '@/app/lib/n8n-webhook';
import AnnouncementsSection from '@/components/announcements-section';

async function getUpcomingEvents() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  try {
    // Get all YAYINDA events from webhook
    const response = await listEventsViaWebhook({
      metadata: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        source: 'homepage',
        environment: process.env.NODE_ENV || 'development',
      },
      requestedBy: {
        userId: 'system',
        userEmail: 'system@kongreai.com',
        userName: 'System',
        userRole: 'SYSTEM',
      },
      filters: {
        durum: 'YAYINDA',
      },
    });

    if (!response.success || !response.data) {
      console.warn('Failed to fetch events from webhook during build, returning empty array');
      return [];
    }

    // Filter for upcoming events (end date is today or in the future)
    const upcomingEvents = response.data.filter((event) => {
      const endDate = new Date(event.bitis_tarihi);
      endDate.setHours(0, 0, 0, 0);
      return endDate >= today;
    });

    // Sort by start date ascending
    const sortedEvents = upcomingEvents.sort((a, b) =>
      new Date(a.baslangic_tarihi).getTime() - new Date(b.baslangic_tarihi).getTime()
    );

    return sortedEvents.slice(0, 6);
  } catch (error) {
    console.warn('Error fetching upcoming events during build, returning empty array:', error);
    return [];
  }
}

async function getPastEvents() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  try {
    // Get all events from webhook
    const response = await listEventsViaWebhook({
      metadata: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        source: 'homepage',
        environment: process.env.NODE_ENV || 'development',
      },
      requestedBy: {
        userId: 'system',
        userEmail: 'system@kongreai.com',
        userName: 'System',
        userRole: 'SYSTEM',
      },
      filters: {},
    });

    if (!response.success || !response.data) {
      console.warn('Failed to fetch past events from webhook during build, returning empty array');
      return [];
    }

    // Filter for past events (end date is before today)
    const pastEvents = response.data.filter((event) => {
      const endDate = new Date(event.bitis_tarihi);
      endDate.setHours(0, 0, 0, 0);
      return endDate < today;
    });

    // Sort by end date descending
    const sortedEvents = pastEvents.sort((a, b) =>
      new Date(b.bitis_tarihi).getTime() - new Date(a.bitis_tarihi).getTime()
    );

    return sortedEvents.slice(0, 3);
  } catch (error) {
    console.warn('Error fetching past events during build, returning empty array:', error);
    return [];
  }
}

async function getRecentAnnouncements() {
  try {
    // Get all published announcements from webhook
    const response = await listAnnouncementsViaWebhook({
      metadata: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        source: 'homepage',
        environment: process.env.NODE_ENV || 'development',
      },
      requestedBy: {
        userId: 'system',
        userEmail: 'system@kongreai.com',
        userName: 'System',
        userRole: 'SYSTEM',
      },
      filters: {
        yayinlandi: true,
      },
    });

    if (!response.success || !response.data) {
      console.warn('Failed to fetch announcements from webhook during build, returning empty array');
      return [];
    }

    // Sort by priority and created date
    const sortedAnnouncements = response.data.sort((a, b) => {
      // First sort by priority (higher first)
      if (a.oncelik !== b.oncelik) {
        return (b.oncelik || 0) - (a.oncelik || 0);
      }
      // Then by creation date (newer first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Return top 5 announcements
    return sortedAnnouncements.slice(0, 5);
  } catch (error) {
    console.warn('Error fetching announcements during build, returning empty array:', error);
    return [];
  }
}

export default async function HomePage() {
  const upcomingEvents = await getUpcomingEvents();
  const pastEvents = await getPastEvents();
  const announcements = await getRecentAnnouncements();
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
              <GraduationCap className="w-4 h-4" />
              <span>Bilimsel Kongre ve Etkinlik Yönetim Platformu</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Bilime Katkı Sağlayın, <br />
              <span className="text-blue-200">Etkinliklere Katılın</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-blue-100 max-w-2xl mx-auto">
              Akademik kongreler, sempozyumlar ve panellere kolayca başvurun.
              Bildirinizi gönderin, süreci takip edin, sertifikanızı alın.
            </p>
            {!session && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                <Link
                  href="/auth/register"
                  className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-sm md:text-base bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Hemen Üye Ol
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-sm md:text-base bg-blue-500/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-blue-500/30 transition-all"
                >
                  Giriş Yap
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <AnnouncementsSection announcements={announcements} />
      )}

      {/* Upcoming Events Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Yaklaşan Etkinlikler</h2>
              <p className="text-gray-600 mt-2">Başvuruların açık olduğu kongre ve etkinlikler</p>
            </div>
            {upcomingEvents.length > 0 && (
              <Link
                href="/events"
                className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Tümünü Gör
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Şu anda aktif etkinlik bulunmuyor
              </h3>
              <p className="text-gray-500">
                Yeni etkinlikler eklendiğinde burada görüntülenecektir.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Past Events Section */}
      {pastEvents.length > 0 && (
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Geçmiş Etkinlikler</h2>
              <p className="text-gray-600 mt-2">Başarıyla tamamlanan kongre ve etkinlikler</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <PastEventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Neden Bu Platformu Kullanmalısınız?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Akademik etkinlik süreçlerinizi baştan sona yönetin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Calendar className="w-8 h-8 md:w-12 md:h-12" />}
              title="Kolay Başvuru"
              description="Online formlar ile dakikalar içinde bildiri gönderin ve başvurunuzu tamamlayın"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 md:w-12 md:h-12" />}
              title="Süreç Takibi"
              description="Başvurunuzun durumunu anlık olarak takip edin, hakem değerlendirmelerini görün"
            />
            <FeatureCard
              icon={<GraduationCap className="w-8 h-8 md:w-12 md:h-12" />}
              title="Dijital Sertifika"
              description="Etkinlik sonunda katılım sertifikanızı dijital olarak hemen alın"
            />
          </div>
        </div>
      </section>

      {/* CTA Section - Only show for non-logged in users */}
      {!session && (
        <section className="py-12 md:py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              Akademik Yolculuğunuza Bugün Başlayın
            </h2>
            <p className="text-blue-100 text-base md:text-lg mb-8 max-w-2xl mx-auto">
              Ücretsiz üye olun ve bilimsel kongreler, sempozyumlar ve panellere kolayca başvurun.
            </p>
            <Link
              href="/auth/register"
              className="inline-block px-6 md:px-8 py-3 md:py-4 text-sm md:text-base bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Ücretsiz Üye Ol
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

// Event Card Component
function EventCard({ event }: { event: any }) {
  const baslangic = new Date(event.baslangic_tarihi);
  const bitis = new Date(event.bitis_tarihi);
  const sonBasvuru = new Date(event.son_basvuru_tarihi);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="block group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
    >
      {/* Event Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden">
        {event.gorsel_url ? (
          <img
            src={event.gorsel_url}
            alt={event.baslik}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <GraduationCap className="w-16 h-16 text-white/50" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-600 text-xs font-semibold rounded-full">
            {event.tip}
          </span>
        </div>
      </div>

      {/* Event Content */}
      <div className="p-6 space-y-4">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {event.baslik}
        </h3>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              {baslangic.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              {' - '}
              {bitis.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{event.yer}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Son Başvuru</p>
              <p className="text-sm font-semibold text-gray-900">
                {sonBasvuru.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <div className="text-right">
              {event.ucretsiz ? (
                <span className="text-sm font-semibold text-green-600">Ücretsiz</span>
              ) : (
                <>
                  <p className="text-xs text-gray-500">Başlangıç</p>
                  <p className="text-sm font-semibold text-gray-900">{event.ucret} ₺</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Past Event Card Component
function PastEventCard({ event }: { event: any }) {
  const bitis = new Date(event.bitis_tarihi);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-6 space-y-3"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 flex-1">
          {event.baslik}
        </h3>
        <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
          Tamamlandı
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Calendar className="w-4 h-4" />
        <span>{bitis.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPin className="w-4 h-4" />
        <span className="line-clamp-1">{event.yer}</span>
      </div>
    </Link>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm md:text-base text-gray-600">{description}</p>
    </div>
  );
}
