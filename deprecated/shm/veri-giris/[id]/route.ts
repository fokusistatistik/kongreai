import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logAktivite } from '@/lib/log';
import { getCurrentUser } from '@/lib/auth/permissions';

const updateSchema = z.object({
  veri: z.record(z.any()).optional(),
  aciklama: z.string().optional(),
  notlar: z.string().optional()
});

/**
 * GET /api/shm/veri-giris/[id]
 * Tek bir veri girişini getirir
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const veriGiris = await prisma.sHMVeriGiris.findUnique({
      where: { id: params.id },
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

    if (!veriGiris) {
      return NextResponse.json(
        { error: 'Veri girişi bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: veriGiris
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Veri girişi yüklenemedi' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/shm/veri-giris/[id]
 * Veri girişini günceller
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const mevcutKayit = await prisma.sHMVeriGiris.findUnique({
      where: { id: params.id }
    });

    if (!mevcutKayit) {
      return NextResponse.json(
        { error: 'Veri girişi bulunamadı' },
        { status: 404 }
      );
    }

    // Onaylanmış kayıtlar güncellenemez
    if (mevcutKayit.onay_durumu === 'ONAYLANDI') {
      return NextResponse.json(
        { error: 'Onaylanmış kayıtlar güncellenemez' },
        { status: 403 }
      );
    }

    const user = await getCurrentUser();

    const updated = await prisma.sHMVeriGiris.update({
      where: { id: params.id },
      data: {
        ...validated,
        veri: validated.veri as any,
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
      personel_id: user?.id || mevcutKayit.personel_id,
      personel_email: user?.email,
      islem: 'veri_giris.guncelle',
      tablo: 'shm_veri_giris',
      kayit_id: params.id,
      aciklama: `Veri girişi güncellendi: ${new Date(mevcutKayit.tarih).toLocaleDateString('tr-TR')}`
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Veri girişi güncellendi'
    });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Veri girişi güncellenemedi' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/shm/veri-giris/[id]
 * Veri girişini siler
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mevcutKayit = await prisma.sHMVeriGiris.findUnique({
      where: { id: params.id }
    });

    if (!mevcutKayit) {
      return NextResponse.json(
        { error: 'Veri girişi bulunamadı' },
        { status: 404 }
      );
    }

    // Onaylanmış kayıtlar silinemez
    if (mevcutKayit.onay_durumu === 'ONAYLANDI') {
      return NextResponse.json(
        { error: 'Onaylanmış kayıtlar silinemez' },
        { status: 403 }
      );
    }

    const user = await getCurrentUser();

    await prisma.sHMVeriGiris.delete({
      where: { id: params.id }
    });

    // Aktivite logu
    await logAktivite({
      personel_id: user?.id || mevcutKayit.personel_id,
      personel_email: user?.email,
      islem: 'veri_giris.sil',
      tablo: 'shm_veri_giris',
      kayit_id: params.id,
      aciklama: `Veri girişi silindi: ${new Date(mevcutKayit.tarih).toLocaleDateString('tr-TR')}`
    });

    return NextResponse.json({
      success: true,
      message: 'Veri girişi silindi'
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Veri girişi silinemedi' },
      { status: 500 }
    );
  }
}
