import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logAktivite } from '@/lib/log';
import { getCurrentUser } from '@/lib/auth/permissions';

const onaySchema = z.object({
  veri_giris_id: z.string().uuid(),
  onaylayan_personel_id: z.string().uuid(),
  onay_durumu: z.enum(['ONAYLANDI', 'REDDEDILDI']),
  onay_notu: z.string().optional(),
  red_gerekce: z.string().optional() // YENİ: Red için gerekçe
});

/**
 * POST /api/shm/veri-giris/onay
 * Veri girişini onayla veya reddet
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = onaySchema.parse(body);

    const mevcutKayit = await prisma.sHMVeriGiris.findUnique({
      where: { id: validated.veri_giris_id }
    });

    if (!mevcutKayit) {
      return NextResponse.json(
        { error: 'Veri girişi bulunamadı' },
        { status: 404 }
      );
    }

    if (mevcutKayit.onay_durumu !== 'BEKLEMEDE') {
      return NextResponse.json(
        { error: 'Bu kayıt zaten onaylanmış veya reddedilmiş' },
        { status: 400 }
      );
    }

    // Reddediliyorsa gerekçe zorunlu
    if (validated.onay_durumu === 'REDDEDILDI' && !validated.red_gerekce) {
      return NextResponse.json(
        { error: 'Red için gerekçe belirtmelisiniz' },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    const updated = await prisma.sHMVeriGiris.update({
      where: { id: validated.veri_giris_id },
      data: {
        onay_durumu: validated.onay_durumu,
        onaylayan_personel_id: validated.onaylayan_personel_id,
        onay_tarihi: new Date(),
        onay_notu: validated.onay_notu,
        red_gerekce: validated.red_gerekce,
        updated_by_id: user?.id
      },
      include: {
        birim: {
          select: {
            id: true,
            ad: true,
            kod: true,
            tip: true,
            dis_birim_tip: true
          }
        }
      }
    });

    // Aktivite logu
    await logAktivite({
      personel_id: validated.onaylayan_personel_id,
      personel_email: user?.email,
      islem: `veri_giris.${validated.onay_durumu.toLowerCase()}`,
      tablo: 'shm_veri_giris',
      kayit_id: validated.veri_giris_id,
      aciklama: validated.onay_durumu === 'ONAYLANDI'
        ? `Veri girişi onaylandı`
        : `Veri girişi reddedildi: ${validated.red_gerekce}`
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: validated.onay_durumu === 'ONAYLANDI'
        ? 'Veri girişi onaylandı'
        : 'Veri girişi reddedildi'
    });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Onay işlemi başarısız' },
      { status: 500 }
    );
  }
}
