import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';

// PUT - Update an announcement
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

    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!existingAnnouncement || existingAnnouncement.event_id !== eventId) {
      return NextResponse.json({ error: 'Duyuru bulunamadı' }, { status: 404 });
    }

    const announcement = await prisma.announcement.update({
      where: { id: announcementId },
      data: {
        baslik: body.baslik,
        icerik: body.icerik,
        tip: body.tip,
        oncelik: body.oncelik,
        yayinlandi: body.yayinlandi,
        yayin_baslangic: body.yayin_baslangic ? new Date(body.yayin_baslangic) : null,
        yayin_bitis: body.yayin_bitis ? new Date(body.yayin_bitis) : null,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error('Announcement update error:', error);
    return NextResponse.json(
      { error: 'Duyuru güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an announcement
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

    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!existingAnnouncement || existingAnnouncement.event_id !== eventId) {
      return NextResponse.json({ error: 'Duyuru bulunamadı' }, { status: 404 });
    }

    await prisma.announcement.delete({
      where: { id: announcementId },
    });

    return NextResponse.json({ message: 'Duyuru başarıyla silindi' });
  } catch (error) {
    console.error('Announcement deletion error:', error);
    return NextResponse.json(
      { error: 'Duyuru silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
