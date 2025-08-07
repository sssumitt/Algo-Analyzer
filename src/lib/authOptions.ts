// src/lib/authOptions.ts

import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient, User } from '@prisma/client';
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

        // Return the full user object from the database
        return user;
      },
    }),
  ],

  callbacks: {
    // The signIn callback remains the same.
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) {
          throw new Error('No email found from Google provider');
        }
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (existingUser) {
            return true;
          }

          const username = user.email.split('@')[0] + '-' + nanoid(4);
          await prisma.user.create({
            data: {
              email: user.email,
              username: username,
              passwordHash: await bcrypt.hash(nanoid(), 10),
            },
          });
          return true;
        } catch (error) {
          console.error('Error during Google sign-in:', error);
          return false;
        }
      }
      return true;
    },

    // ▼▼▼ THIS IS THE UPDATED JWT CALLBACK ▼▼▼
    async jwt({ token, user, account }) {
      // On initial sign-in, the account and user objects are available
      if (account && user) {
        // Differentiate logic based on the provider
        if (account.provider === 'google') {
          // For Google sign-in, find the user in the DB via their email
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.username = dbUser.username;
            token.email = dbUser.email;
            token.name = dbUser.username; // Use username for consistency
            token.picture = user.image;
          }
        } else if (account.provider === 'credentials') {
          // For credentials, the `user` object is the one from our `authorize` function.
          // We can cast it and use it directly.
          const dbUser = user as User;
          token.id = dbUser.id;
          token.username = dbUser.username;
          token.email = dbUser.email; // This will be null, which is correct
          token.name = dbUser.username;
          // Credentials users won't have a picture from the provider
        }
      }
      return token;
    },

    // The session callback maps the token data to the session object.
    // It is robust enough to handle the null email.
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string | null; // Account for null email
        session.user.image = token.picture as string | undefined;
      }
      return session;
    },
  },

  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/signup', // Your image shows a 'Register' page, ensure this path matches.
  },
};