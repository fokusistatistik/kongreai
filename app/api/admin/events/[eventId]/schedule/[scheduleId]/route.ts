import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';

// PUT - Update a schedule item
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string; scheduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'ORGANIZATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { eventId, scheduleId } = params;
    const body = await request.json();

    const existingItem = await prisma.congressSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!existingItem || existingItem.event_id !== eventId) {
      return NextResponse.json({ error: 'Program öğesi bulunamadı' }, { status: 404 });
    }

    const scheduleItem = await prisma.congressSchedule.update({
      where: { id: scheduleId },
      data: {
        gun: body.gun,
        baslik: body.baslik,
        aciklama: body.aciklama,
        baslangic_saati: body.baslangic_saati,
        bitis_saati: body.bitis_saati,
        salon: body.salon,
        tip: body.tip,
        konusmacilar: body.konusmacilar,
        oturum_baskani: body.oturum_baskani,
        yayinlandi: body.yayinlandi,
        sira: body.sira,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ scheduleItem });
  } catch (error) {
    console.error('Schedule item update error:', error);
    return NextResponse.json(
      { error: 'Program öğesi güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a schedule item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string; scheduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'ORGANIZATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { eventId, scheduleId } = params;

    const existingItem = await prisma.congressSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!existingItem || existingItem.event_id !== eventId) {
      return NextResponse.json({ error: 'Program öğesi bulunamadı' }, { status: 404 });
    }

    await prisma.congressSchedule.delete({
      where: { id: scheduleId },
    });

    return NextResponse.json({ message: 'Program öğesi başarıyla silindi' });
  } catch (error) {
    console.error('Schedule item deletion error:', error);
    return NextResponse.json(
      { error: 'Program öğesi silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
