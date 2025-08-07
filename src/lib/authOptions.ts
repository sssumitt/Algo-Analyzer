// src/lib/authOptions.ts

import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient, User } from '@prisma/client'; // Import the User type
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          throw new Error('Missing credentials');
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (!user || !user.passwordHash) {
          throw new Error('No user found');
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );

        if (!isPasswordCorrect) {
          throw new Error('Invalid password');
        }

        return user;
      },
    }),
  ],

  // Callbacks handle the custom logic
  callbacks: {
    async signIn({ user, account }) {
      // Logic for Google OAuth provider
      if (account?.provider === 'google') {
        if (!user.email) {
          throw new Error('No email found from Google provider');
        }

        try {
          // Check if a user with this email already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (existingUser) {
            return true; // User exists, allow sign-in
          }

          // If user does not exist, create a new one
          const username = user.email.split('@')[0] + '-' + nanoid(4);
          
          await prisma.user.create({
            data: {
              email: user.email,
              username: username,
              // Create a placeholder hash for the required password field
              passwordHash: await bcrypt.hash(nanoid(), 10),
            },
          });

          return true; // New user created, allow sign-in
        } catch (error) {
          console.error('Error during Google sign-in:', error);
          return false; // Prevent sign-in on error
        }
      }

      // Logic for other providers (like credentials)
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        const u = user as User; // Cast to your Prisma User type
        token.id = u.id;
        token.username = u.username;
      }
      return token;
    },

    async session({ session, token }) {
      // Add the custom properties from the token to the session object
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },

  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/signup',
  },
};
