import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';
import { randomUUID } from 'crypto';

// GET - List all results for an event
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

    const results = await prisma.congressResult.findMany({
      where: { event_id: eventId },
      orderBy: [{ sira: 'asc' }, { created_at: 'desc' }],
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

// POST - Create a new result
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

    const { baslik, icerik, tip, dosya_url, yayinlandi, yayin_tarihi, sira } = body;

    if (!baslik || !icerik) {
      return NextResponse.json(
        { error: 'Başlık ve içerik zorunludur' },
        { status: 400 }
      );
    }

    const result = await prisma.congressResult.create({
      data: {
        id: randomUUID(),
        event_id: eventId,
        baslik,
        icerik,
        tip: tip || 'SONUC',
        dosya_url: dosya_url || null,
        yayinlandi: yayinlandi !== undefined ? yayinlandi : false,
        yayin_tarihi: yayin_tarihi ? new Date(yayin_tarihi) : null,
        sira: sira || 0,
        created_by_email: session.user.email,
      },
    });

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    console.error('Result creation error:', error);
    return NextResponse.json(
      { error: 'Sonuç oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
