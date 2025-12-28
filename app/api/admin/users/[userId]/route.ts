import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Fetch single user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const sessionUser = session.user as any;

    if (sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        email: true,
        ad: true,
        soyad: true,
        telefon: true,
        unvan: true,
        kurum: true,
        role: true,
        aktif: true,
        email_verified: true,
        created_at: true,
        son_giris_tarihi: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Kullanıcı yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const sessionUser = session.user as any;

    if (sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { ad, soyad, email, telefon, unvan, kurum, role, password, aktif, email_verified } = body;

    // Validate required fields
    if (!ad || !soyad || !email) {
      return NextResponse.json({ error: 'Ad, soyad ve e-posta zorunludur' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Check if email is being changed and if it's already taken
    if (email.toLowerCase() !== existingUser.email.toLowerCase()) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (emailTaken) {
        return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanılıyor' }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      ad,
      soyad,
      email: email.toLowerCase(),
      telefon: telefon || null,
      unvan: unvan || null,
      kurum: kurum || null,
      role: role || 'KATILIMCI',
      aktif: aktif !== undefined ? aktif : true,
      email_verified: email_verified !== undefined ? email_verified : false,
    };

    // Update password if provided
    if (password && password.length > 0) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(password, 10);
      updateData.ilk_giris = false; // Password has been changed by admin
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        ad: updatedUser.ad,
        soyad: updatedUser.soyad,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    console.error('User update error:', error);
    return NextResponse.json(
      { error: error.message || 'Kullanıcı güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const sessionUser = session.user as any;

    if (sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Prevent deleting yourself
    if (user.id === sessionUser.id) {
      return NextResponse.json({ error: 'Kendi hesabınızı silemezsiniz' }, { status: 400 });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: params.userId },
    });

    return NextResponse.json({ success: true, message: 'Kullanıcı silindi' });
  } catch (error: any) {
    console.error('User delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Kullanıcı silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
