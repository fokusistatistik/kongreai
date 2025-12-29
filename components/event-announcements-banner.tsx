'use client';

import { useState, useEffect } from 'react';
import { Bell, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { sanitizeHTML } from '@/app/lib/sanitize';

interface EventAnnouncementsBannerProps {
  eventId: string;
}

export default function EventAnnouncementsBanner({ eventId }: EventAnnouncementsBannerProps) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/announcements`);
        if (res.ok) {
          const data = await res.json();
          // Only show high priority announcements in banner (priority >= 5)
          const highPriority = (data.announcements || []).filter((a: any) => a.oncelik >= 5);
          setAnnouncements(highPriority);
        }
      } catch (error) {
        console.error('Announcements fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchAnnouncements();
      // Load dismissed IDs from localStorage
      const dismissed = localStorage.getItem(`dismissed-announcements-${eventId}`);
      if (dismissed) {
        setDismissedIds(JSON.parse(dismissed));
      }
    }
  }, [eventId]);

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem(`dismissed-announcements-${eventId}`, JSON.stringify(newDismissed));
  };

  const getIcon = (tip: string) => {
    switch (tip) {
      case 'ACIL':
        return <AlertCircle className="w-5 h-5 flex-shrink-0" />;
      case 'UYARI':
        return <AlertTriangle className="w-5 h-5 flex-shrink-0" />;
      case 'ONEMLI':
        return <Bell className="w-5 h-5 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 flex-shrink-0" />;
    }
  };

  const getStyles = (tip: string) => {
    switch (tip) {
      case 'ACIL':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-900',
          icon: 'text-red-600',
        };
      case 'UYARI':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-900',
          icon: 'text-yellow-600',
        };
      case 'ONEMLI':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
          icon: 'text-blue-600',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-900',
          icon: 'text-gray-600',
        };
    }
  };

  if (loading || announcements.length === 0) {
    return null;
  }

  const visibleAnnouncements = announcements.filter((a) => !dismissedIds.includes(a.id));

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {visibleAnnouncements.map((announcement) => {
        const styles = getStyles(announcement.tip);
        return (
          <div
            key={announcement.id}
            className={`${styles.bg} ${styles.border} border rounded-lg p-4 relative`}
          >
            <button
              onClick={() => handleDismiss(announcement.id)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3 pr-8">
              <div className={styles.icon}>{getIcon(announcement.tip)}</div>
              <div className="flex-1">
                <h3 className={`font-bold ${styles.text} mb-1`}>{announcement.baslik}</h3>
                <div
                  className={`text-sm ${styles.text} prose prose-sm max-w-none`}
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(announcement.icerik) }}
                />
                {announcement.yayin_baslangic && (
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(announcement.yayin_baslangic).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
