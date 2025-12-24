import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logAktivite } from '@/lib/log';
import { getCurrentUser } from '@/lib/auth/permissions';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.fokusistatistik.com';

// Veri giriş validation schema - YENİ YAPI
const veriGirisSchema = z.object({
  birim_id: z.string().uuid('Geçerli bir birim seçiniz'),
  personel_id: z.string().uuid('Geçerli bir personel ID giriniz'),
  tarih: z.string().refine((val) => !isNaN(Date.parse(val)), 'Geçerli bir tarih giriniz'),
  veri: z.record(z.any()).optional(), // Esnek veri yapısı
  aciklama: z.string().optional(),
  notlar: z.string().optional()
});

/**
 * GET /api/shm/veri-giris
 * Veri girişlerini listeler (filtreleme ve birim bazlı yetkilendirme ile)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);

    const birimId = searchParams.get('birim_id');
    const personelId = searchParams.get('personel_id');
    const baslangicTarihi = searchParams.get('baslangic_tarihi');
    const bitisTarihi = searchParams.get('bitis_tarihi');
    const onayDurumu = searchParams.get('onay_durumu');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereClause: any = {};

    // Birim bazlı filtreleme - Dış birim çalışanları sadece kendi birimlerini görebilir
    if (!['ADMIN', 'BASKAN', 'ANALIST'].includes(user.rol.kod)) {
      if (user.birim.tip === 'DIS_BIRIM') {
        // Dış birimde PERSONEL: Sadece kendi verileri
        if (user.rol.kod === 'PERSONEL') {
          whereClause.birim_id = user.birim_id;
          whereClause.personel_id = user.id;
        } else {
          // BIRIM_YONETICISI: Birimin tüm verileri
          whereClause.birim_id = user.birim_id;
        }
      } else if (user.birim.tip === 'MUDURLUK') {
        // Müdürlük biriminde: Bağlı dış birimlerin verileri
        const bagliBirimler = await prisma.birim.findMany({
          where: { ust_birim_id: user.birim_id },
          select: { id: true }
        });
        whereClause.birim_id = {
          in: bagliBirimler.map(b => b.id)
        };
      } else {
        // Diğer durumlar: Erişim yok
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            toplam: 0,
            limit,
            offset,
            sayfa: 1,
            toplamSayfa: 0
          }
        });
      }
    }

    if (birimId) whereClause.birim_id = birimId;
    if (personelId) whereClause.personel_id = personelId;
    if (onayDurumu) whereClause.onay_durumu = onayDurumu;

    if (baslangicTarihi || bitisTarihi) {
      whereClause.tarih = {};
      if (baslangicTarihi) whereClause.tarih.gte = new Date(baslangicTarihi);
      if (bitisTarihi) whereClause.tarih.lte = new Date(bitisTarihi);
    }

    const [veriGirisleri, toplam] = await Promise.all([
      prisma.sHMVeriGiris.findMany({
        where: whereClause,
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
        },
        orderBy: { tarih: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.sHMVeriGiris.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      data: veriGirisleri,
      pagination: {
        toplam,
        limit,
        offset,
        sayfa: Math.floor(offset / limit) + 1,
        toplamSayfa: Math.ceil(toplam / limit)
      }
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Veri girişleri yüklenemedi' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/shm/veri-giris
 * Yeni veri girişi oluşturur ve webhook'a gönderir (birim bazlı yetkilendirme ile)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = veriGirisSchema.parse(body);

    // Kullanıcının bu birime veri girişi yapma yetkisi var mı kontrol et
    const birim = await prisma.birim.findUnique({
      where: { id: validated.birim_id }
    });

    if (!birim) {
      return NextResponse.json(
        { success: false, error: 'Birim bulunamadı' },
        { status: 404 }
      );
    }

    // Yetki kontrolü
    if (!['ADMIN', 'BASKAN', 'ANALIST'].includes(user.rol.kod)) {
      if (user.birim.tip === 'DIS_BIRIM') {
        // Dış birimde sadece kendi birimine veri girebilir
        if (validated.birim_id !== user.birim_id) {
          return NextResponse.json(
            { success: false, error: 'Bu birime veri girişi yapma yetkiniz yok' },
            { status: 403 }
          );
        }
      } else if (user.birim.tip === 'MUDURLUK') {
        // Müdürlük biriminde bağlı dış birimlere veri girebilir
        if (birim.ust_birim_id !== user.birim_id) {
          return NextResponse.json(
            { success: false, error: 'Bu birime veri girişi yapma yetkiniz yok' },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'Veri girişi yapma yetkiniz yok' },
          { status: 403 }
        );
      }
    }

    // Aynı gün aynı kişi aynı birimde kayıt var mı kontrol et
    const mevcutKayit = await prisma.sHMVeriGiris.findFirst({
      where: {
        birim_id: validated.birim_id,
        personel_id: validated.personel_id,
        tarih: new Date(validated.tarih)
      }
    });

    if (mevcutKayit) {
      return NextResponse.json(
        { success: false, error: 'Bu tarih için zaten veri girişi yapılmış' },
        { status: 400 }
      );
    }

    // Veri girişini oluştur
    const veriGiris = await prisma.sHMVeriGiris.create({
      data: {
        birim_id: validated.birim_id,
        personel_id: validated.personel_id,
        tarih: new Date(validated.tarih),
        veri: validated.veri as any,
        aciklama: validated.aciklama,
        notlar: validated.notlar,
        onay_durumu: 'BEKLEMEDE',
        created_by_id: user.id
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

    // Webhook'a gönder (async, blocking değil)
    try {
      const webhookResponse = await fetch(`${N8N_WEBHOOK_URL}/webhook/shm-veri-giris`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'veri_giris_olusturuldu',
          veri_giris: veriGiris,
          auth: {
            user_id: user.id,
            user_email: user.email,
            user_name: `${user.ad} ${user.soyad}`,
            user_tc: user.tc_kimlik_no,
            role_code: user.rol.kod,
            role_name: user.rol.ad,
            role_level: user.rol.seviye,
            birim_id: user.birim_id,
            birim_ad: user.birim.ad,
            birim_kod: user.birim.kod,
            birim_tip: user.birim.tip,
            permissions: user.rol.yetkiler.map((ry: any) => ({
              kod: ry.yetki.kod,
              ad: ry.yetki.ad,
              kategori: ry.yetki.kategori
            }))
          },
          timestamp: new Date().toISOString()
        })
      });

      if (webhookResponse.ok) {
        await prisma.sHMVeriGiris.update({
          where: { id: veriGiris.id },
          data: {
            webhook_gonderildi: true,
            webhook_gonderim_tarihi: new Date(),
            webhook_yanit: await webhookResponse.json()
          }
        });
      }
    } catch (webhookError) {
      console.error('Webhook hatası:', webhookError);
      // Webhook hatası veri girişini engellemez
    }

    // Aktivite logu
    await logAktivite({
      personel_id: user.id,
      personel_email: user.email,
      islem: 'veri_giris.olustur',
      tablo: 'shm_veri_giris',
      kayit_id: veriGiris.id,
      aciklama: `Veri girişi oluşturuldu: ${birim.ad} - ${new Date(validated.tarih).toLocaleDateString('tr-TR')}`
    });

    return NextResponse.json({
      success: true,
      data: veriGiris,
      message: 'Veri girişi başarıyla oluşturuldu'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Veri giriş hatası:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Veri girişi oluşturulamadı' },
      { status: 500 }
    );
  }
}
