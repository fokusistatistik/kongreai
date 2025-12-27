import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';

// PUT - Update a result
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string; resultId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'ORGANIZATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { eventId, resultId } = params;
    const body = await request.json();

    const existingResult = await prisma.congressResult.findUnique({
      where: { id: resultId },
    });

    if (!existingResult || existingResult.event_id !== eventId) {
      return NextResponse.json({ error: 'Sonuç bulunamadı' }, { status: 404 });
    }

    const result = await prisma.congressResult.update({
      where: { id: resultId },
      data: {
        baslik: body.baslik,
        icerik: body.icerik,
        tip: body.tip,
        dosya_url: body.dosya_url,
        yayinlandi: body.yayinlandi,
        yayin_tarihi: body.yayin_tarihi ? new Date(body.yayin_tarihi) : null,
        sira: body.sira,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Result update error:', error);
    return NextResponse.json(
      { error: 'Sonuç güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a result
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string; resultId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'ORGANIZATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { eventId, resultId } = params;

    const existingResult = await prisma.congressResult.findUnique({
      where: { id: resultId },
    });

    if (!existingResult || existingResult.event_id !== eventId) {
      return NextResponse.json({ error: 'Sonuç bulunamadı' }, { status: 404 });
    }

    await prisma.congressResult.delete({
      where: { id: resultId },
    });

    return NextResponse.json({ message: 'Sonuç başarıyla silindi' });
  } catch (error) {
    console.error('Result deletion error:', error);
    return NextResponse.json(
      { error: 'Sonuç silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
