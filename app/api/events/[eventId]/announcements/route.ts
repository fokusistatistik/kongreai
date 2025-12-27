import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// GET - List all published announcements for an event (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;
    const { searchParams } = new URL(request.url);
    const tip = searchParams.get('tip');

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, durum: true },
    });

    if (!event || event.durum === 'TASLAK') {
      return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
    }

    const now = new Date();

    const where: any = {
      event_id: eventId,
      yayinlandi: true,
      OR: [
        { yayin_baslangic: null },
        { yayin_baslangic: { lte: now } },
      ],
    };

    // Check if announcement is still valid (not expired)
    where.AND = [
      {
        OR: [
          { yayin_bitis: null },
          { yayin_bitis: { gte: now } },
        ],
      },
    ];

    if (tip) {
      where.tip = tip;
    }

    const announcements = await prisma.announcement.findMany({
      where,
      select: {
        id: true,
        baslik: true,
        icerik: true,
        tip: true,
        oncelik: true,
        created_at: true,
        yayin_baslangic: true,
      },
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
