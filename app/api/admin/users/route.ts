import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const user = session.user as any;

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { ad, soyad, email, telefon, unvan, kurum, role, password, aktif, email_verified } = body;

    // Validate required fields
    if (!ad || !soyad || !email || !password) {
      return NextResponse.json({ error: 'Ad, soyad, e-posta ve şifre zorunludur' }, { status: 400 });
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        ad,
        soyad,
        email: email.toLowerCase(),
        password: hashedPassword,
        telefon: telefon || null,
        unvan: unvan || null,
        kurum: kurum || null,
        role: role || 'KATILIMCI',
        aktif: aktif !== undefined ? aktif : true,
        email_verified: email_verified !== undefined ? email_verified : false,
        ilk_giris: true, // User will need to change password on first login
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        ad: newUser.ad,
        soyad: newUser.soyad,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Kullanıcı oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
