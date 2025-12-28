import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';
import { randomUUID } from 'crypto';

// GET - List all announcements for an event (admin view - includes unpublished)
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

    const announcements = await prisma.announcement.findMany({
      where: { event_id: eventId },
      orderBy: [{ oncelik: 'desc' }, { created_at: 'desc' }],
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Announcements fetch error:', error);
    return NextResponse.json(
      { error: 'Duyurular getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Create a new announcement
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

    const { baslik, icerik, tip, oncelik, yayinlandi, yayin_baslangic, yayin_bitis } = body;

    if (!baslik || !icerik) {
      return NextResponse.json(
        { error: 'Başlık ve içerik zorunludur' },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        id: randomUUID(),
        event_id: eventId,
        baslik,
        icerik,
        tip: tip || 'BILGI',
        oncelik: oncelik !== undefined ? oncelik : 0,
        yayinlandi: yayinlandi !== undefined ? yayinlandi : false,
        yayin_baslangic: yayin_baslangic ? new Date(yayin_baslangic) : null,
        yayin_bitis: yayin_bitis ? new Date(yayin_bitis) : null,
        created_by_email: session.user.email,
      },
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    console.error('Announcement creation error:', error);
    return NextResponse.json(
      { error: 'Duyuru oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
