import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// GET - List all published timeline items for an event (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, durum: true },
    });

    if (!event || event.durum === 'TASLAK') {
      return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
    }

    const timeline = await prisma.eventTimeline.findMany({
      where: {
        event_id: eventId,
        yayinlandi: true,
      },
      select: {
        id: true,
        baslik: true,
        aciklama: true,
        tarih: true,
        tip: true,
        ikon: true,
        sira: true,
      },
      orderBy: [{ tarih: 'asc' }, { sira: 'asc' }],
    });

    return NextResponse.json({ timeline });
  } catch (error) {
    console.error('Timeline fetch error:', error);
    return NextResponse.json(
      { error: 'Timeline getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
