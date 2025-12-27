import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// GET - List all published schedule items for an event (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;
    const { searchParams } = new URL(request.url);
    const gun = searchParams.get('gun');
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

    if (gun) {
      where.gun = gun;
    }

    if (tip) {
      where.tip = tip;
    }

    const scheduleItems = await prisma.congressSchedule.findMany({
      where,
      select: {
        id: true,
        gun: true,
        baslik: true,
        aciklama: true,
        baslangic_saati: true,
        bitis_saati: true,
        salon: true,
        tip: true,
        konusmacilar: true,
        oturum_baskani: true,
        sira: true,
      },
      orderBy: [{ gun: 'asc' }, { baslangic_saati: 'asc' }, { sira: 'asc' }],
    });

    return NextResponse.json({ scheduleItems });
  } catch (error) {
    console.error('Schedule fetch error:', error);
    return NextResponse.json(
      { error: 'Program öğeleri getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
