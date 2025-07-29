// singleton Prisma client for hot-reloading in dev
import { PrismaClient } from '@prisma/client';

declare global {
  // allow global var in type-safe way
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
