'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, X, ExternalLink, Calendar, AlertCircle } from 'lucide-react';

interface Announcement {
  id: string;
  event_id: string;
  event?: {
    id: string;
    baslik: string;
    slug: string;
  };
  baslik: string;
  icerik: string;
  tip: string; // BILGI, UYARI, ONEMLI, ACIL
  oncelik: number;
  yayinlandi: boolean;
  yayin_baslangic?: string;
  yayin_bitis?: string;
  created_at: string;
  updated_at: string;
}

interface AnnouncementsSectionProps {
  announcements: Announcement[];
}

export default function AnnouncementsSection({ announcements }: AnnouncementsSectionProps) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const getAnnouncementIcon = (tip: string) => {
    switch (tip) {
      case 'ACIL':
        return <AlertCircle className="w-5 h-5" />;
      case 'UYARI':
        return <AlertCircle className="w-5 h-5" />;
      case 'ONEMLI':
        return <Bell className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getAnnouncementColor = (tip: string) => {
    switch (tip) {
      case 'ACIL':
        return 'from-red-500 to-red-600';
      case 'UYARI':
        return 'from-orange-500 to-orange-600';
      case 'ONEMLI':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getAnnouncementBadgeColor = (tip: string) => {
    switch (tip) {
      case 'ACIL':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'UYARI':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ONEMLI':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      <section className="py-8 md:py-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Duyurular</h2>
              <p className="text-sm text-gray-600">Etkinliklerle ilgili önemli güncellemeler</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {announcements.map((announcement) => (
              <button
                key={announcement.id}
                onClick={() => setSelectedAnnouncement(announcement)}
                className="group bg-gradient-to-br from-gray-50 to-white hover:from-blue-50 hover:to-white border border-gray-200 hover:border-blue-300 rounded-xl p-4 text-left transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`flex items-center justify-center w-10 h-10 bg-gradient-to-br ${getAnnouncementColor(announcement.tip)} text-white rounded-lg flex-shrink-0`}>
                    {getAnnouncementIcon(announcement.tip)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded border ${getAnnouncementBadgeColor(announcement.tip)}`}>
                        {announcement.tip}
                      </span>
                      {announcement.oncelik > 5 && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded border border-yellow-200">
                          Yüksek Öncelik
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm md:text-base">
                      {announcement.baslik}
                    </h3>
                  </div>
                </div>

                <div
                  className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-3"
                  dangerouslySetInnerHTML={{ __html: announcement.icerik }}
                />

                {announcement.event && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span className="truncate">{announcement.event.baslik}</span>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(announcement.created_at).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <span className="text-xs text-blue-600 group-hover:text-blue-700 font-medium flex items-center gap-1">
                    Detaylar
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Announcement Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className={`bg-gradient-to-r ${getAnnouncementColor(selectedAnnouncement.tip)} text-white p-6`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex-shrink-0">
                    {getAnnouncementIcon(selectedAnnouncement.tip)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/30">
                        {selectedAnnouncement.tip}
                      </span>
                      {selectedAnnouncement.oncelik > 5 && (
                        <span className="px-3 py-1 bg-yellow-400/90 text-yellow-900 text-xs font-semibold rounded-full">
                          Yüksek Öncelik
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold">{selectedAnnouncement.baslik}</h2>
                    <p className="text-white/90 text-sm mt-2">
                      {new Date(selectedAnnouncement.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  aria-label="Kapat"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div
                className="prose prose-sm md:prose-base max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: selectedAnnouncement.icerik }}
              />

              {selectedAnnouncement.event && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        İlgili Etkinlik
                      </p>
                      <p className="text-sm text-blue-700 mb-3">
                        {selectedAnnouncement.event.baslik}
                      </p>
                      <Link
                        href={`/events/${selectedAnnouncement.event.slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => setSelectedAnnouncement(null)}
                      >
                        Etkinliğe Git
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
