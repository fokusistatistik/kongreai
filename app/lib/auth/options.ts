import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-posta", type: "email", placeholder: "ornek@email.com" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-posta ve şifre gereklidir");
        }

        try {
          // Kullanıcıyı veritabanından bul
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });

          if (!user) {
            throw new Error("Geçersiz e-posta veya şifre");
          }

          // Aktif mi kontrol et
          if (!user.aktif) {
            throw new Error("Hesabınız pasif durumda. Lütfen yöneticinizle iletişime geçin.");
          }

          // Şifre kontrolü
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error("Geçersiz e-posta veya şifre");
          }

          // Son giriş tarihini güncelle
          await prisma.user.update({
            where: { id: user.id },
            data: { son_giris_tarihi: new Date() }
          });

          // Return user object for NextAuth serialization
          return {
            id: user.id,
            email: user.email,
            name: `${user.ad} ${user.soyad}`,
            ad: user.ad,
            soyad: user.soyad,
            role: user.role,
            unvan: user.unvan,
            kurum: user.kurum,
            telefon: user.telefon,
            ilk_giris: user.ilk_giris,
          };
        } catch (error) {
          // Re-throw without logging sensitive data
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
        token.unvan = (user as any).unvan;
        token.kurum = (user as any).kurum;
        token.ilk_giris = (user as any).ilk_giris;
        token.ad = (user as any).ad;
        token.soyad = (user as any).soyad;
        token.telefon = (user as any).telefon;
      }

      // Session update - refresh from database
      if (trigger === "update" && token.email) {
        const updatedUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: {
            id: true,
            email: true,
            ad: true,
            soyad: true,
            role: true,
            unvan: true,
            kurum: true,
            telefon: true,
            ilk_giris: true,
          },
        });

        if (updatedUser) {
          token.id = updatedUser.id;
          token.email = updatedUser.email;
          token.name = `${updatedUser.ad} ${updatedUser.soyad}`;
          token.ad = updatedUser.ad;
          token.soyad = updatedUser.soyad;
          token.role = updatedUser.role;
          token.unvan = updatedUser.unvan;
          token.kurum = updatedUser.kurum;
          token.telefon = updatedUser.telefon;
          token.ilk_giris = updatedUser.ilk_giris;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).email = token.email;
        (session.user as any).name = token.name;
        (session.user as any).ad = token.ad;
        (session.user as any).soyad = token.soyad;
        (session.user as any).role = token.role;
        (session.user as any).unvan = token.unvan;
        (session.user as any).kurum = token.kurum;
        (session.user as any).telefon = token.telefon;
        (session.user as any).ilk_giris = token.ilk_giris;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
