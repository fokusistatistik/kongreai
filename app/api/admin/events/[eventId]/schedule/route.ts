import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';
import { randomUUID } from 'crypto';

// GET - List all schedule items for an event
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

    const scheduleItems = await prisma.congressSchedule.findMany({
      where: { event_id: eventId },
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

// POST - Create a new schedule item
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

    const {
      gun,
      baslik,
      aciklama,
      baslangic_saati,
      bitis_saati,
      salon,
      tip,
      konusmacilar,
      oturum_baskani,
      yayinlandi,
      sira,
    } = body;

    if (!gun || !baslik || !baslangic_saati || !bitis_saati) {
      return NextResponse.json(
        { error: 'Gün, başlık, başlangıç ve bitiş saati zorunludur' },
        { status: 400 }
      );
    }

    const scheduleItem = await prisma.congressSchedule.create({
      data: {
        id: randomUUID(),
        event_id: eventId,
        gun,
        baslik,
        aciklama: aciklama || null,
        baslangic_saati,
        bitis_saati,
        salon: salon || null,
        tip: tip || 'OTURUM',
        konusmacilar: konusmacilar || null,
        oturum_baskani: oturum_baskani || null,
        yayinlandi: yayinlandi !== undefined ? yayinlandi : true,
        sira: sira || 0,
        created_by_email: session.user.email,
      },
    });

    return NextResponse.json({ scheduleItem }, { status: 201 });
  } catch (error) {
    console.error('Schedule item creation error:', error);
    return NextResponse.json(
      { error: 'Program öğesi oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
