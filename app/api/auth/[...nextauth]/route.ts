import NextAuth from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';

/**
 * NextAuth.js API Route Handler
 *
 * This handles all NextAuth.js authentication routes:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback
 * - /api/auth/session
 * - etc.
 */

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
