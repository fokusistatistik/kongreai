import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';
import { updateEventViaWebhook } from '@/app/lib/n8n-webhook';

// GET - Get event details
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

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Event fetch error:', error);
    return NextResponse.json(
      { error: 'Etkinlik getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'ORGANIZATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { eventId } = params;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
    }

    const body = await request.json();
    const {
      baslik,
      slug,
      tip,
      aciklama,
      // New date fields
      erken_basvuru_son_tarihi,
      son_basvuru_tarihi,
      sonuc_aciklama_tarihi,
      kongre_baslangic_tarihi,
      kongre_bitis_tarihi,
      // Old fields for backward compatibility
      baslangic_tarihi,
      bitis_tarihi,
      yer,
      adres,
      online,
      ucret,
      erken_kayit_ucret,
      ogrenci_ucret,
      max_katilimci,
      durum,
    } = body;

    // Check if slug is being changed and if it's already in use
    if (slug && slug !== existingEvent.slug) {
      const slugExists = await prisma.event.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'Bu URL slug zaten kullanımda' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (baslik !== undefined) updateData.baslik = baslik;
    if (slug !== undefined) updateData.slug = slug;
    if (tip !== undefined) updateData.tip = tip;
    if (aciklama !== undefined) updateData.aciklama = aciklama;

    // New date fields (priority)
    if (erken_basvuru_son_tarihi !== undefined) {
      updateData.erken_basvuru_son_tarihi = erken_basvuru_son_tarihi ? new Date(erken_basvuru_son_tarihi) : null;
    }
    if (son_basvuru_tarihi !== undefined) {
      updateData.son_basvuru_tarihi = new Date(son_basvuru_tarihi);
    }
    if (sonuc_aciklama_tarihi !== undefined) {
      updateData.sonuc_aciklama_tarihi = sonuc_aciklama_tarihi ? new Date(sonuc_aciklama_tarihi) : null;
    }
    if (kongre_baslangic_tarihi !== undefined) {
      updateData.kongre_baslangic_tarihi = new Date(kongre_baslangic_tarihi);
      // Also update old field for backward compatibility
      updateData.baslangic_tarihi = new Date(kongre_baslangic_tarihi);
    }
    if (kongre_bitis_tarihi !== undefined) {
      updateData.kongre_bitis_tarihi = new Date(kongre_bitis_tarihi);
      // Also update old field for backward compatibility
      updateData.bitis_tarihi = new Date(kongre_bitis_tarihi);
    }

    // Old date fields (fallback for backward compatibility)
    if (baslangic_tarihi !== undefined && kongre_baslangic_tarihi === undefined) {
      updateData.baslangic_tarihi = new Date(baslangic_tarihi);
    }
    if (bitis_tarihi !== undefined && kongre_bitis_tarihi === undefined) {
      updateData.bitis_tarihi = new Date(bitis_tarihi);
    }

    if (yer !== undefined) updateData.yer = yer;
    if (adres !== undefined) updateData.adres = adres;
    if (online !== undefined) updateData.online = online;
    if (ucret !== undefined) updateData.ucret = parseFloat(ucret);
    if (erken_kayit_ucret !== undefined) updateData.erken_kayit_ucret = parseFloat(erken_kayit_ucret);
    if (ogrenci_ucret !== undefined) updateData.ogrenci_ucret = parseFloat(ogrenci_ucret);
    if (max_katilimci !== undefined) {
      updateData.max_katilimci = max_katilimci ? parseInt(max_katilimci) : null;
    }
    if (durum !== undefined) updateData.durum = durum;

    // Update event in database
    const event = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });

    // Send to n8n webhook with operationType: 'update' (non-blocking, graceful failure)
    try {
      const webhookData: any = {
        eventId,
        updates: {},
        updated_by_email: session.user.email || '',
        operationType: 'update' as const,
      };

      // Only send changed fields
      if (baslik !== undefined) webhookData.updates.baslik = baslik;
      if (slug !== undefined) webhookData.updates.slug = slug;
      if (tip !== undefined) webhookData.updates.tip = tip;
      if (aciklama !== undefined) webhookData.updates.aciklama = aciklama;

      // New date fields
      if (erken_basvuru_son_tarihi !== undefined) {
        webhookData.updates.erken_basvuru_son_tarihi = erken_basvuru_son_tarihi ? new Date(erken_basvuru_son_tarihi).toISOString() : null;
      }
      if (son_basvuru_tarihi !== undefined) {
        webhookData.updates.son_basvuru_tarihi = new Date(son_basvuru_tarihi).toISOString();
      }
      if (sonuc_aciklama_tarihi !== undefined) {
        webhookData.updates.sonuc_aciklama_tarihi = sonuc_aciklama_tarihi ? new Date(sonuc_aciklama_tarihi).toISOString() : null;
      }
      if (kongre_baslangic_tarihi !== undefined) {
        webhookData.updates.kongre_baslangic_tarihi = new Date(kongre_baslangic_tarihi).toISOString();
        // Also send old field for backward compatibility
        webhookData.updates.baslangic_tarihi = new Date(kongre_baslangic_tarihi).toISOString();
      }
      if (kongre_bitis_tarihi !== undefined) {
        webhookData.updates.kongre_bitis_tarihi = new Date(kongre_bitis_tarihi).toISOString();
        // Also send old field for backward compatibility
        webhookData.updates.bitis_tarihi = new Date(kongre_bitis_tarihi).toISOString();
      }

      // Old date fields (fallback)
      if (baslangic_tarihi !== undefined && kongre_baslangic_tarihi === undefined) {
        webhookData.updates.baslangic_tarihi = new Date(baslangic_tarihi).toISOString();
      }
      if (bitis_tarihi !== undefined && kongre_bitis_tarihi === undefined) {
        webhookData.updates.bitis_tarihi = new Date(bitis_tarihi).toISOString();
      }

      if (yer !== undefined) webhookData.updates.yer = yer;
      if (adres !== undefined) webhookData.updates.adres = adres;
      if (online !== undefined) webhookData.updates.online = online;
      if (ucret !== undefined) webhookData.updates.ucret = parseFloat(ucret);
      if (erken_kayit_ucret !== undefined) webhookData.updates.erken_kayit_ucret = parseFloat(erken_kayit_ucret);
      if (ogrenci_ucret !== undefined) webhookData.updates.ogrenci_ucret = parseFloat(ogrenci_ucret);
      if (max_katilimci !== undefined) webhookData.updates.max_katilimci = max_katilimci ? parseInt(max_katilimci) : null;
      if (durum !== undefined) webhookData.updates.durum = durum;

      await updateEventViaWebhook(webhookData);
    } catch (webhookError) {
      console.error('n8n webhook error (non-blocking):', webhookError);
      // Continue - event is already updated in database
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Event update error:', error);
    return NextResponse.json(
      { error: 'Etkinlik güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
