import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;

    // 2. Parse request
    const {
      eventId,
      tip,
      baslik,
      ozet,
      anahtarKelimeler,
      kategori,
      yazarlar,
    } = await request.json();

    if (!eventId || !tip) {
      return NextResponse.json(
        { error: 'Event ID and application type are required' },
        { status: 400 }
      );
    }

    // 3. Validate event exists and is accepting applications
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if deadline has passed
    if (event.son_basvuru_tarihi && new Date(event.son_basvuru_tarihi) < new Date()) {
      return NextResponse.json(
        { error: 'Application deadline has passed' },
        { status: 400 }
      );
    }

    // 4. Check for duplicate application
    const existingApplication = await prisma.application.findFirst({
      where: {
        user_id: user.id,
        event_id: eventId,
        durum: {
          not: 'IPTAL',
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this event' },
        { status: 400 }
      );
    }

    // 5. Create application
    const applicationId = uuidv4();

    const application = await prisma.application.create({
      data: {
        id: applicationId,
        user_id: user.id,
        event_id: eventId,
        tip,
        baslik: tip !== 'DINLEYICI' ? baslik : null,
        ozet: tip !== 'DINLEYICI' ? ozet : null,
        anahtar_kelimeler: tip !== 'DINLEYICI' ? anahtarKelimeler : null,
        kategori: tip !== 'DINLEYICI' ? kategori : null,
        durum: 'GONDERILDI',
        basvuru_tarihi: new Date(),
      },
    });

    // 6. Create authors if provided
    if (yazarlar && Array.isArray(yazarlar) && yazarlar.length > 0) {
      const authorData = yazarlar.map((yazar: any, index: number) => ({
        id: uuidv4(),
        application_id: applicationId,
        ad: yazar.ad,
        soyad: yazar.soyad,
        email: yazar.email,
        kurum: yazar.kurum || null,
        sira: yazar.sira || index + 1,
      }));

      await prisma.applicationAuthor.createMany({
        data: authorData,
      });
    }

    // 7. Return application data
    return NextResponse.json({
      success: true,
      message: 'Application created successfully',
      application: {
        id: application.id,
        tip: application.tip,
        durum: application.durum,
      },
    });
  } catch (error: any) {
    console.error('Application submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}
