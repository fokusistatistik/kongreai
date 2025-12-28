import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import { getEventViaWebhook, updateEventViaWebhook, deleteEventViaWebhook } from '@/app/lib/n8n-webhook';

// GET - Get event details (WEBHOOK ONLY - NO DATABASE READ)
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

    // Fetch from webhook only
    const webhookResponse = await getEventViaWebhook({
      metadata: {
        requestId: `event-get-${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: 'web-app',
        version: '1.0',
      },
      requestedBy: {
        userId: session.user.id || '',
        userEmail: session.user.email || '',
        userName: `${session.user.ad || ''} ${session.user.soyad || ''}`.trim() || session.user.name || '',
        userRole: session.user.role || 'ADMIN',
      },
      event: {
        eventId,
      },
    });

    if (!webhookResponse.success) {
      return NextResponse.json(
        { error: 'Etkinlik webhook sisteminden alınamadı', details: webhookResponse.error },
        { status: 404 }
      );
    }

    return NextResponse.json({ event: webhookResponse.data });
  } catch (error: any) {
    console.error('Event fetch error:', error);
    return NextResponse.json(
      { error: 'Etkinlik getirilirken bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update event (WEBHOOK ONLY - NO DATABASE WRITE)
export async function PUT(
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

    // Send all update data to webhook
    const webhookResponse = await updateEventViaWebhook({
      metadata: {
        requestId: `event-update-${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: 'web-app',
        version: '1.0',
      },
      requestedBy: {
        userId: session.user.id || '',
        userEmail: session.user.email || '',
        userName: `${session.user.ad || ''} ${session.user.soyad || ''}`.trim() || session.user.name || '',
        userRole: session.user.role || 'ADMIN',
      },
      event: {
        eventId,
        ...body, // Send all fields from request body
      },
      operationType: 'update' as const,
    });

    if (!webhookResponse.success) {
      return NextResponse.json(
        { error: 'Etkinlik webhook sistemi yanıt vermedi', details: webhookResponse.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      event: webhookResponse.data,
      message: 'Etkinlik başarıyla güncellendi (webhook üzerinden)'
    });
  } catch (error: any) {
    console.error('Event update error:', error);
    return NextResponse.json(
      { error: 'Etkinlik güncellenirken bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete/Cancel event (WEBHOOK ONLY - NO DATABASE WRITE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { eventId } = params;

    // Send delete request to webhook
    const webhookResponse = await deleteEventViaWebhook({
      metadata: {
        requestId: `event-delete-${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: 'web-app',
        version: '1.0',
      },
      requestedBy: {
        userId: session.user.id || '',
        userEmail: session.user.email || '',
        userName: `${session.user.ad || ''} ${session.user.soyad || ''}`.trim() || session.user.name || '',
        userRole: session.user.role || 'ADMIN',
      },
      event: {
        eventId,
      },
    });

    if (!webhookResponse.success) {
      return NextResponse.json(
        { error: 'Etkinlik silinirken webhook sistemi yanıt vermedi', details: webhookResponse.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Etkinlik başarıyla silindi (webhook üzerinden)',
      deleted: true
    });
  } catch (error: any) {
    console.error('Event delete error:', error);
    return NextResponse.json(
      { error: 'Etkinlik silinirken bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
}
