// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions';

/**
 * Next.js app-router requires that API route modules export
 * only the HTTP verbs (GET, POST, etc.) plus the optional `config`.
 * We create a handler once and re-export it for GET and POST.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
