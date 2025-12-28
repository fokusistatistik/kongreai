import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import { listAnnouncementsViaWebhook, createAnnouncementViaWebhook } from '@/app/lib/n8n-webhook';
import { randomUUID } from 'crypto';

// GET - List all announcements for an event (WEBHOOK ONLY - NO DATABASE READ)
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'ORGANIZATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { eventId } = params;
    const { searchParams } = new URL(request.url);
    const tip = searchParams.get('tip');
    const aktif = searchParams.get('aktif');

    // Fetch from webhook only
    const webhookResponse = await listAnnouncementsViaWebhook({
      metadata: {
        requestId: `announcement-list-${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: 'web-app',
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
      },
      requestedBy: {
        userId: session.user.id || '',
        userEmail: session.user.email || '',
        userName: `${session.user.ad || ''} ${session.user.soyad || ''}`.trim() || session.user.name || '',
        userRole: session.user.role || 'ADMIN',
      },
      filters: {
        eventId,
        tip: tip || undefined,
        aktif: aktif !== null ? aktif === 'true' : undefined,
      },
    });

    if (!webhookResponse.success) {
      return NextResponse.json(
        { error: 'Duyurular webhook sisteminden alınamadı', details: webhookResponse.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ announcements: webhookResponse.data || [] });
  } catch (error) {
    console.error('Announcements fetch error:', error);
    return NextResponse.json(
      { error: 'Duyurular getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Create a new announcement (WEBHOOK ONLY - NO DATABASE WRITE)
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'ORGANIZATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { eventId } = params;
    const body = await request.json();

    const { baslik, icerik, tip, oncelik, aktif, yayinTarihi, bitisTarihi } = body;

    if (!baslik || !icerik) {
      return NextResponse.json(
        { error: 'Başlık ve içerik zorunludur' },
        { status: 400 }
      );
    }

    // Send to webhook for creation
    const webhookResponse = await createAnnouncementViaWebhook({
      metadata: {
        requestId: `announcement-create-${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: 'web-app',
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
      },
      requestedBy: {
        userId: session.user.id || '',
        userEmail: session.user.email || '',
        userName: `${session.user.ad || ''} ${session.user.soyad || ''}`.trim() || session.user.name || '',
        userRole: session.user.role || 'ADMIN',
      },
      event: {
        eventId,
        eventName: '', // Webhook will fetch this
        eventSlug: '',
        eventType: '',
        eventDates: {
          baslangicTarihi: '',
          bitisTarihi: '',
          sonBasvuruTarihi: '',
        },
      },
      announcement: {
        announcementId: randomUUID(),
        baslik,
        icerik,
        tip: tip || 'BILGI',
        oncelik: oncelik !== undefined ? parseInt(oncelik) : 0,
        aktif: aktif !== undefined ? aktif : true,
        yayinTarihi: yayinTarihi || undefined,
        bitisTarihi: bitisTarihi || undefined,
      },
    });

    if (!webhookResponse.success) {
      return NextResponse.json(
        { error: 'Duyuru webhook sistemi yanıt vermedi', details: webhookResponse.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      announcement: webhookResponse.data,
      message: 'Duyuru başarıyla oluşturuldu (webhook üzerinden)',
    }, { status: 201 });
  } catch (error) {
    console.error('Announcement creation error:', error);
    return NextResponse.json(
      { error: 'Duyuru oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
