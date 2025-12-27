import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/lib/prisma';
import { authOptions } from '@/app/lib/auth/options';

// GET - List all timeline items for an event (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { eventId } = params;

    const timeline = await prisma.eventTimeline.findMany({
      where: { event_id: eventId },
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

// POST - Create new timeline item (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { eventId } = params;
    const body = await request.json();

    const { baslik, aciklama, tarih, tip, ikon, yayinlandi, sira } = body;

    if (!baslik || !tarih || !tip) {
      return NextResponse.json(
        { error: 'Başlık, tarih ve tip zorunludur' },
        { status: 400 }
      );
    }

    const timelineItem = await prisma.eventTimeline.create({
      data: {
        event_id: eventId,
        baslik,
        aciklama: aciklama || null,
        tarih,
        tip,
        ikon: ikon || null,
        yayinlandi: yayinlandi !== undefined ? yayinlandi : true,
        sira: sira || 0,
        created_by_email: (session.user as any).email,
      },
    });

    return NextResponse.json({ timelineItem }, { status: 201 });
  } catch (error) {
    console.error('Timeline creation error:', error);
    return NextResponse.json(
      { error: 'Timeline oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
