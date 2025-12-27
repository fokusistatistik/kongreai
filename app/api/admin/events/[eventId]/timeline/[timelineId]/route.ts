import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/lib/prisma';
import { authOptions } from '@/app/lib/auth/options';

// PUT - Update timeline item (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string; timelineId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { timelineId } = params;
    const body = await request.json();

    const { baslik, aciklama, tarih, tip, ikon, yayinlandi, sira } = body;

    const timelineItem = await prisma.eventTimeline.update({
      where: { id: timelineId },
      data: {
        ...(baslik !== undefined && { baslik }),
        ...(aciklama !== undefined && { aciklama }),
        ...(tarih !== undefined && { tarih }),
        ...(tip !== undefined && { tip }),
        ...(ikon !== undefined && { ikon }),
        ...(yayinlandi !== undefined && { yayinlandi }),
        ...(sira !== undefined && { sira }),
      },
    });

    return NextResponse.json({ timelineItem });
  } catch (error) {
    console.error('Timeline update error:', error);
    return NextResponse.json(
      { error: 'Timeline güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Delete timeline item (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string; timelineId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { timelineId } = params;

    await prisma.eventTimeline.delete({
      where: { id: timelineId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Timeline deletion error:', error);
    return NextResponse.json(
      { error: 'Timeline silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
