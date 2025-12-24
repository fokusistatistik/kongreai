import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/prisma';
import { logAktivite } from '@/lib/log';
import { z } from 'zod';

// Validation schema
const birimSchema = z.object({
  ad: z.string().min(3, 'Birim adı en az 3 karakter olmalıdır'),
  kod: z.string().min(2, 'Birim kodu en az 2 karakter olmalıdır').toUpperCase(),
  tip: z.enum(['MUDURLUK', 'DIS_BIRIM']),
  dis_birim_tip: z.enum(['ASM', 'HSM', 'VSD', 'ILCE_SAGLIK']).optional().nullable(),
  ust_birim_id: z.string().uuid().optional().nullable(),
  telefon: z.string().optional().nullable(),
  email: z.string().email('Geçerli bir email giriniz').optional().or(z.literal('')).nullable(),
  adres: z.string().optional().nullable(),
  aktif: z.boolean().default(true)
});

// GET - Tüm birimleri listele
export async function GET(_request: NextRequest) {
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

    const birimler = await prisma.birim.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        ad: true,
        kod: true,
        tip: true,
        dis_birim_tip: true,
        ust_birim_id: true,
        ust_birim: {
          select: {
            id: true,
            ad: true
          }
        },
        telefon: true,
        email: true,
        aktif: true,
        created_at: true,
        _count: {
          select: {
            personeller: true,
            alt_birimler: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: birimler
    });

  } catch (error) {
    console.error('Birimler listesi hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Birimler listelenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Yeni birim oluştur
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validated = birimSchema.parse(body);

    // Kod benzersizliği kontrolü
    const existingBirim = await prisma.birim.findUnique({
      where: { kod: validated.kod }
    });

    if (existingBirim) {
      return NextResponse.json(
        { success: false, error: 'Bu kod ile bir birim zaten mevcut' },
        { status: 400 }
      );
    }

    // Birim oluştur
    const yeniBirim = await prisma.birim.create({
      data: {
        ad: validated.ad,
        kod: validated.kod,
        tip: validated.tip as 'MUDURLUK' | 'DIS_BIRIM',
        dis_birim_tip: validated.dis_birim_tip as 'ASM' | 'HSM' | 'VSD' | 'ILCE_SAGLIK' | null,
        ust_birim_id: validated.ust_birim_id,
        telefon: validated.telefon,
        email: validated.email,
        adres: validated.adres,
        aktif: validated.aktif
      }
    });

    // Activity log
    await logAktivite({
      personel_id: session.user.id,
      personel_email: session.user.email ?? undefined,
      islem: 'birim.olustur',
      tablo: 'birimler',
      kayit_id: yeniBirim.id,
      aciklama: `Birim oluşturuldu: ${yeniBirim.ad}`
    });

    // Webhook'a gönder
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.fokusistatistik.com';

    try {
      await fetch(`${N8N_WEBHOOK_URL}/webhook/birim-olustur`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'birim_olusturuldu',
          birim: yeniBirim,
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
      data: yeniBirim,
      message: 'Birim oluşturuldu'
    });

  } catch (error) {
    console.error('Birim oluşturma hatası:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Birim oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
