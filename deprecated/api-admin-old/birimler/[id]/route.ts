import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/prisma';
import { logAktivite } from '@/lib/log';
import { z } from 'zod';

// Validation schema
const birimUpdateSchema = z.object({
  ad: z.string().min(3, 'Birim adı en az 3 karakter olmalıdır').optional(),
  kod: z.string().min(2, 'Birim kodu en az 2 karakter olmalıdır').toUpperCase().optional(),
  tip: z.enum(['MUDURLUK', 'DIS_BIRIM']).optional(),
  dis_birim_tip: z.enum(['ASM', 'HSM', 'VSD', 'ILCE_SAGLIK']).optional().nullable(),
  ust_birim_id: z.string().uuid().optional().nullable(),
  telefon: z.string().optional().nullable(),
  email: z.string().email('Geçerli bir email giriniz').optional().or(z.literal('')).nullable(),
  adres: z.string().optional().nullable(),
  aktif: z.boolean().optional()
});

// GET - Tek bir birimi getir
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    // Admin yetkisi kontrolü
    if (session.user.rol.kod !== 'ADMIN' && session.user.rol.kod !== 'BASKAN') {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const birim = await prisma.birim.findUnique({
      where: { id: params.id },
      include: {
        ust_birim: {
          select: {
            id: true,
            ad: true,
            kod: true
          }
        },
        alt_birimler: {
          select: {
            id: true,
            ad: true,
            kod: true,
            tip: true,
            aktif: true
          }
        },
        _count: {
          select: {
            personeller: true,
            alt_birimler: true
          }
        }
      }
    });

    if (!birim) {
      return NextResponse.json(
        { success: false, error: 'Birim bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: birim
    });

  } catch (error: any) {
    console.error('Birim getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Birim getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT - Birimi güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    // Admin yetkisi kontrolü
    if (session.user.rol.kod !== 'ADMIN' && session.user.rol.kod !== 'BASKAN') {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // Mevcut birim kontrolü
    const mevcutBirim = await prisma.birim.findUnique({
      where: { id: params.id }
    });

    if (!mevcutBirim) {
      return NextResponse.json(
        { success: false, error: 'Birim bulunamadı' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = birimUpdateSchema.parse(body);

    // Kod benzersizliği kontrolü (eğer kod değiştiriliyorsa)
    if (validated.kod && validated.kod !== mevcutBirim.kod) {
      const existingBirim = await prisma.birim.findUnique({
        where: { kod: validated.kod }
      });

      if (existingBirim) {
        return NextResponse.json(
          { success: false, error: 'Bu kod ile bir birim zaten mevcut' },
          { status: 400 }
        );
      }
    }

    // Birim güncelle
    const guncellenmis = await prisma.birim.update({
      where: { id: params.id },
      data: {
        ...(validated.ad && { ad: validated.ad }),
        ...(validated.kod && { kod: validated.kod }),
        ...(validated.tip && { tip: validated.tip as any }),
        ...(validated.dis_birim_tip !== undefined && { dis_birim_tip: validated.dis_birim_tip as any }),
        ...(validated.ust_birim_id !== undefined && { ust_birim_id: validated.ust_birim_id }),
        ...(validated.telefon !== undefined && { telefon: validated.telefon }),
        ...(validated.email !== undefined && { email: validated.email }),
        ...(validated.adres !== undefined && { adres: validated.adres }),
        ...(validated.aktif !== undefined && { aktif: validated.aktif })
      }
    });

    // Activity log
    await logAktivite({
      personel_id: session.user.id,
      personel_email: session.user.email ?? undefined,
      islem: 'birim.guncelle',
      tablo: 'birimler',
      kayit_id: guncellenmis.id,
      aciklama: `Birim güncellendi: ${guncellenmis.ad}`
    });

    // Webhook'a gönder
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.fokusistatistik.com';

    try {
      await fetch(`${N8N_WEBHOOK_URL}/webhook/birim-guncelle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'birim_guncellendi',
          birim: guncellenmis,
          eski_veri: mevcutBirim,
          auth: {
            user_id: session.user.id,
            user_email: session.user.email,
            user_name: session.user.name,
            role: session.user.rol.kod,
            birim_id: session.user.birim?.id
          },
          timestamp: new Date().toISOString()
        })
      });
    } catch (webhookError) {
      console.error('Webhook hatası:', webhookError);
    }

    return NextResponse.json({
      success: true,
      data: guncellenmis
    });

  } catch (error: any) {
    console.error('Birim güncelleme hatası:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Birim güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Birimi sil
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    // Admin yetkisi kontrolü
    if (session.user.rol.kod !== 'ADMIN' && session.user.rol.kod !== 'BASKAN') {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // Mevcut birim kontrolü
    const mevcutBirim = await prisma.birim.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            personeller: true
          }
        }
      }
    });

    if (!mevcutBirim) {
      return NextResponse.json(
        { success: false, error: 'Birim bulunamadı' },
        { status: 404 }
      );
    }

    // Birimde personel var mı kontrolü
    if (mevcutBirim._count.personeller > 0) {
      return NextResponse.json(
        { success: false, error: 'Bu birimde kayıtlı personel var. Önce personelleri başka bir birime taşıyın.' },
        { status: 400 }
      );
    }

    // Birimi sil (cascade ile alt birimler de silinecek)
    await prisma.birim.delete({
      where: { id: params.id }
    });

    // Activity log
    await logAktivite({
      personel_id: session.user.id,
      personel_email: session.user.email ?? undefined,
      islem: 'birim.sil',
      tablo: 'birimler',
      kayit_id: params.id,
      aciklama: `Birim silindi: ${mevcutBirim.ad}`
    });

    // Webhook'a gönder
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.fokusistatistik.com';

    try {
      await fetch(`${N8N_WEBHOOK_URL}/webhook/birim-sil`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'birim_silindi',
          birim: mevcutBirim,
          auth: {
            user_id: session.user.id,
            user_email: session.user.email,
            user_name: session.user.name,
            role: session.user.rol.kod,
            birim_id: session.user.birim?.id
          },
          timestamp: new Date().toISOString()
        })
      });
    } catch (webhookError) {
      console.error('Webhook hatası:', webhookError);
    }

    return NextResponse.json({
      success: true,
      message: 'Birim başarıyla silindi'
    });

  } catch (error: any) {
    console.error('Birim silme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Birim silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
