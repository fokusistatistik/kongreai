import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkRateLimit, RATE_LIMITS } from '@/app/lib/rate-limit';

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
          // Login rate limiting (email-based to prevent brute force)
          const rateLimitResult = checkRateLimit(
            credentials.email.toLowerCase(), // Email'i IP gibi kullan
            'login',
            RATE_LIMITS.LOGIN
          );

          if (!rateLimitResult.allowed) {
            throw new Error(
              `Çok fazla giriş denemesi. ${Math.ceil(rateLimitResult.retryAfter! / 60)} dakika sonra tekrar deneyin.`
            );
          }

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
            email_verified: user.email_verified,
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
        token.email_verified = (user as any).email_verified;
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
            email_verified: true,
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
          token.email_verified = updatedUser.email_verified;
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
        (session.user as any).email_verified = token.email_verified;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true, // JavaScript tarafından erişilemez (XSS koruması)
        sameSite: 'lax', // CSRF koruması
        path: '/',
        secure: process.env.NODE_ENV === 'production', // Production'da sadece HTTPS
      }
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days (30 gün yerine - güvenlik artırıldı)
    updateAge: 24 * 60 * 60, // Session 24 saatte bir güncellenir
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// CRITICAL: Validate NEXTAUTH_SECRET on startup
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error(
    '❌ NEXTAUTH_SECRET environment variable is missing!\n' +
    'Generate one with: openssl rand -base64 32\n' +
    'Then add it to your .env file: NEXTAUTH_SECRET="your-secret-here"'
  );
}

if (process.env.NEXTAUTH_SECRET.length < 32) {
  console.warn(
    '⚠️  WARNING: NEXTAUTH_SECRET is too short! It should be at least 32 characters.\n' +
    'Generate a secure one with: openssl rand -base64 32'
  );
}
