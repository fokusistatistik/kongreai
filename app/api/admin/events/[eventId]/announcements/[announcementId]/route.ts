import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import { updateAnnouncementViaWebhook, deleteAnnouncementViaWebhook } from '@/app/lib/n8n-webhook';

// PUT - Update announcement (WEBHOOK ONLY - NO DATABASE WRITE)
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string; announcementId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'ORGANIZATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { eventId, announcementId } = params;
    const body = await request.json();

    const { baslik, icerik, tip, oncelik, aktif, yayinTarihi, bitisTarihi } = body;

    if (!baslik || !icerik) {
      return NextResponse.json(
        { error: 'Başlık ve içerik zorunludur' },
        { status: 400 }
      );
    }

    // Send to webhook for update
    const webhookResponse = await updateAnnouncementViaWebhook({
      metadata: {
        requestId: `announcement-update-${Date.now()}`,
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
        announcementId,
        baslik,
        icerik,
        tip: tip || 'BILGI',
        oncelik: oncelik !== undefined ? parseInt(oncelik) : 0,
        aktif: aktif !== undefined ? aktif : true,
        yayinTarihi: yayinTarihi || undefined,
        bitisTarihi: bitisTarihi || undefined,
      },
      operationType: 'update',
    });

    if (!webhookResponse.success) {
      return NextResponse.json(
        { error: 'Duyuru webhook sistemi yanıt vermedi', details: webhookResponse.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      announcement: webhookResponse.data,
      message: 'Duyuru başarıyla güncellendi (webhook üzerinden)',
    });
  } catch (error) {
    console.error('Announcement update error:', error);
    return NextResponse.json(
      { error: 'Duyuru güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Delete announcement (WEBHOOK ONLY - NO DATABASE WRITE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string; announcementId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'ORGANIZATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { eventId, announcementId } = params;

    // Send to webhook for deletion
    const webhookResponse = await deleteAnnouncementViaWebhook({
      metadata: {
        requestId: `announcement-delete-${Date.now()}`,
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
      announcement: {
        announcementId,
        eventId,
      },
    });

    if (!webhookResponse.success) {
      return NextResponse.json(
        { error: 'Duyuru silinirken webhook sistemi yanıt vermedi', details: webhookResponse.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Duyuru başarıyla silindi (webhook üzerinden)',
      deleted: true,
    });
  } catch (error) {
    console.error('Announcement delete error:', error);
    return NextResponse.json(
      { error: 'Duyuru silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
