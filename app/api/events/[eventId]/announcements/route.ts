import { NextRequest, NextResponse } from 'next/server';
import { listAnnouncementsViaWebhook } from '@/app/lib/n8n-webhook';

// GET - List all published announcements for an event (WEBHOOK ONLY - NO DATABASE READ)
// Public access - only returns published announcements
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;
    const { searchParams } = new URL(request.url);
    const tip = searchParams.get('tip');

    // Fetch only published announcements from webhook
    const webhookResponse = await listAnnouncementsViaWebhook({
      metadata: {
        requestId: `announcement-list-public-${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: 'web-app',
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
      },
      requestedBy: {
        userId: 'public',
        userEmail: 'public@system',
        userName: 'Public User',
        userRole: 'USER',
      },
      filters: {
        eventId,
        tip: tip || undefined,
        aktif: true, // Only published/active announcements for public
      },
    });

    if (!webhookResponse.success) {
      return NextResponse.json(
        { error: 'Duyurular webhook sisteminden alınamadı', details: webhookResponse.error },
        { status: 500 }
      );
    }

    // Filter announcements based on publish dates (webhook should handle this, but double check)
    const now = new Date();
    const filteredAnnouncements = (webhookResponse.data || []).filter((announcement: any) => {
      const publishStart = announcement.yayin_baslangic || announcement.yayinTarihi;
      const publishEnd = announcement.yayin_bitis || announcement.bitisTarihi;

      // Check if announcement is within publish date range
      const isPublishStartValid = !publishStart || new Date(publishStart) <= now;
      const isPublishEndValid = !publishEnd || new Date(publishEnd) >= now;

      return isPublishStartValid && isPublishEndValid;
    });

    return NextResponse.json({ announcements: filteredAnnouncements });
  } catch (error) {
    console.error('Announcements fetch error:', error);
    return NextResponse.json(
      { error: 'Duyurular getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
