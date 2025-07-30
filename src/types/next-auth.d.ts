// types/next-auth.d.ts

import 'next-auth';
import 'next-auth/jwt';

// Extend the built-in JWT type
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username?: string | null;
  }
}

// Extend the built-in session and user types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    username?: string | null;
  }
}