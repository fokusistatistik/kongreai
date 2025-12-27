import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// GET - List all published results for an event (public access)
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

    const where: any = {
      event_id: eventId,
      yayinlandi: true,
    };

    if (tip) {
      where.tip = tip;
    }

    const results = await prisma.congressResult.findMany({
      where,
      select: {
        id: true,
        baslik: true,
        icerik: true,
        tip: true,
        dosya_url: true,
        yayin_tarihi: true,
        sira: true,
        created_at: true,
      },
      orderBy: [{ sira: 'asc' }, { yayin_tarihi: 'desc' }],
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Results fetch error:', error);
    return NextResponse.json(
      { error: 'Sonuçlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
