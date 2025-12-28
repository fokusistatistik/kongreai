import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';
import { createEventViaWebhook } from '@/app/lib/n8n-webhook';

// POST - Create new event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'ORGANIZATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const body = await request.json();
    const {
      baslik,
      slug,
      tip,
      aciklama,
      baslangic_tarihi,
      bitis_tarihi,
      son_basvuru_tarihi,
      yer,
      adres,
      online,
      ucret,
      erken_kayit_ucret,
      ogrenci_ucret,
      erken_kayit_tarihi,
      max_katilimci,
      durum,
    } = body;

    // Validate required fields
    if (!baslik || !slug || !baslangic_tarihi || !bitis_tarihi || !son_basvuru_tarihi || !yer) {
      return NextResponse.json(
        { error: 'Eksik zorunlu alanlar' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingEvent = await prisma.event.findUnique({
      where: { slug },
    });

    if (existingEvent) {
      return NextResponse.json(
        { error: 'Bu URL slug zaten kullanımda' },
        { status: 400 }
      );
    }

    // Create event in database
    const event = await prisma.event.create({
      data: {
        baslik,
        slug,
        tip: tip || 'KONGRE',
        aciklama,
        baslangic_tarihi: new Date(baslangic_tarihi),
        bitis_tarihi: new Date(bitis_tarihi),
        son_basvuru_tarihi: new Date(son_basvuru_tarihi),
        yer,
        adres,
        online: online || false,
        ucret: parseFloat(ucret) || 0,
        erken_kayit_ucret: parseFloat(erken_kayit_ucret) || 0,
        ogrenci_ucret: parseFloat(ogrenci_ucret) || 0,
        erken_kayit_tarihi: erken_kayit_tarihi ? new Date(erken_kayit_tarihi) : null,
        max_katilimci: parseInt(max_katilimci) || null,
        durum: durum || 'TASLAK',
      },
    });

    // Send to n8n webhook (non-blocking, graceful failure)
    try {
      await createEventViaWebhook({
        baslik,
        slug,
        tip: tip || 'KONGRE',
        aciklama,
        baslangic_tarihi: new Date(baslangic_tarihi).toISOString(),
        bitis_tarihi: new Date(bitis_tarihi).toISOString(),
        son_basvuru_tarihi: new Date(son_basvuru_tarihi).toISOString(),
        yer,
        adres,
        online: online || false,
        ucret: parseFloat(ucret) || 0,
        erken_kayit_ucret: parseFloat(erken_kayit_ucret) || 0,
        ogrenci_ucret: parseFloat(ogrenci_ucret) || 0,
        erken_kayit_tarihi: erken_kayit_tarihi ? new Date(erken_kayit_tarihi).toISOString() : undefined,
        max_katilimci: parseInt(max_katilimci) || undefined,
        durum: durum || 'TASLAK',
        created_by_email: session.user.email || '',
      });
    } catch (webhookError) {
      console.error('n8n webhook error (non-blocking):', webhookError);
      // Continue - event is already created in database
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json(
      { error: 'Etkinlik oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
